const db = require('../util/database');
const nodemailer = require('nodemailer');
const Coupon = require('./coupon');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports = class Order {
  constructor(userId, shippingAddress, paymentMethod, couponCode) {
    this.userId = userId;
    this.shippingAddress = shippingAddress;
    this.paymentMethod = paymentMethod;
    this.couponCode = couponCode;
  }

  async save() {
    let connection;
    let couponResult;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();

      const [cartItems] = await connection.execute(
        `SELECT products.prodId, products.productPrice, products.quantity AS stock, carts.quantity 
         FROM products 
         INNER JOIN carts ON products.prodId = carts.productId 
         WHERE carts.userId = ? FOR UPDATE;`,
        [this.userId]
      );

      if (cartItems.length === 0) {
        await connection.rollback();
        return { result: 'fail', message: 'Üres a kosár' };
      }

      for (const product of cartItems) {
        if (product.stock < product.quantity) {
          await connection.rollback();
          return {
            result: 'fail',
            message: 'Egy vagy több termék nincs készleten',
          };
        }
      }

      let totalAmount = 0;
      cartItems.forEach((item) => {
        totalAmount += item.productPrice * item.quantity;
      });
      let discount;
      if (this.couponCode != '') {
        couponResult = await Coupon.check(this.couponCode);
        if (couponResult.result == 'success') {
          totalAmount = totalAmount - couponResult.data.value;
          discount = couponResult.data.value;
          if (totalAmount < 0) {
            totalAmount = 0;
          }
        }
      }

      const [orderResult] = await connection.execute(
        `INSERT INTO orders (userId, totalAmount, shippingAddress, paymentMethod, couponCode, orderDate) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          this.userId,
          totalAmount,
          this.shippingAddress,
          this.paymentMethod,
          this.couponCode,
        ]
      );

      const orderId = orderResult.insertId;

      for (let item of cartItems) {
        await connection.execute(
          `INSERT INTO order_items (orderId, productId, quantity, price) 
           VALUES (?, ?, ?, ?)`,
          [orderId, item.prodId, item.quantity, item.productPrice]
        );

        await connection.execute(
          `UPDATE products SET quantity = quantity - ? WHERE prodId = ?`,
          [item.quantity, item.prodId]
        );
      }

      if (couponResult && couponResult.result == 'success') {
        await connection.execute(
          'UPDATE coupons SET coupons.usedAt = NOW(), coupons.orderId=? WHERE coupons.code = ?;',
          [orderId, this.couponCode]
        );
      }

      let email;
      let ordered_products;

      try {
        email = await connection.execute(
          'SELECT users.email FROM users WHERE userId = ?',
          [this.userId]
        );
        ordered_products = await connection.execute(
          'SELECT products.productName, products.productPrice, order_items.quantity FROM products INNER JOIN order_items ON products.prodId = order_items.productId WHERE order_items.orderId = ?',
          [orderId]
        );

        ordered_products = ordered_products[0];
        let htmlbody =
          '<h1>Rendszerünk sikeresen rögzítette rendelését!</h1><table style="width:100%; border-collapse: collapse; font-family: Arial, sans-serif;"><tr><th style="border-bottom: 2px solid #ddd; padding: 8px; text-align:left;">Termék</th><th style="border-bottom: 2px solid #ddd; padding: 8px; text-align:right;">Ár</th><th style="border-bottom: 2px solid #ddd; padding: 8px; text-align:right;">Mennyiség</th></tr>';

        for (const row of ordered_products) {
          htmlbody += `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd;">${row.productName}</td><td style="padding: 8px; border-bottom: 1px solid #ddd; text-align:right;">${row.productPrice}</td><td style="padding: 8px; border-bottom: 1px solid #ddd; text-align:right;">${row.quantity}</td></tr>`;
        }
        if (discount) {
          htmlbody += `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd;">Kedvezmény</td><td style="padding: 8px; border-bottom: 1px solid #ddd; text-align:right;">${discount}</td></tr>`;
        }
        htmlbody += `</table><br><h1>Fizetendő összeg: ${totalAmount} Ft</h1>`;

        await transporter.sendMail({
          from: `"DigitalDepot" <${process.env.EMAIL_USER}>`,
          to: email[0][0].email,
          subject: 'Sikeres Rendelés',
          text: 'Rendszerünk sikeresen rögzítette rendelését!',
          html: htmlbody,
        });
      } catch (mailErr) {
        console.log(mailErr.message);
      }

      await connection.execute(`DELETE FROM carts WHERE userId = ?`, [
        this.userId,
      ]);
      await connection.commit();
      connection.release();
      return { result: 'success' };
    } catch (err) {
      if (connection) {
        await connection.rollback();
        await connection.release();
      }
      console.log(err.message);
      return { result: 'fail', message: 'Szerver hiba' };
    }
  }

  static async fetchByUserId(userId) {
    try {
      const [rows] = await db.execute(
        `SELECT orderId, totalAmount, shippingAddress, orderDate, paymentMethod, status FROM orders WHERE userId = ? ORDER BY orderId DESC;`,
        [userId]
      );
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async getOrderItems(orderId) {
    try {
      const [rows] = await db.execute(
        `SELECT order_items.quantity, order_items.price, products.productName, products.productImg 
         FROM order_items 
         JOIN products ON order_items.productId = products.prodId 
         WHERE order_items.orderId = ?`,
        [orderId]
      );

      const [discount] = await db.execute(
        'SELECT coupons.value FROM coupons WHERE coupons.orderId = ?;',
        [orderId]
      );

      if (discount.length > 0) {
        return { products: rows, discount: discount[0] };
      } else {
        return { products: rows, discount: 0 };
      }
    } catch (err) {
      throw err;
    }
  }

  static async delete(id) {
    try {
      await db.execute(`DELETE FROM order_items WHERE orderId = ?`, [id]);
      await db.execute(`DELETE FROM orders WHERE orderId = ?`, [id]);
      return { result: 'success' };
    } catch (err) {
      return { result: 'fail', message: 'Szerver hiba' };
    }
  }
};
