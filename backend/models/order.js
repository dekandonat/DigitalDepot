const db = require('../util/database');
const nodemailer = require('nodemailer');

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
    try {
      const [cartItems] = await db.execute(
        `SELECT products.prodId, products.productPrice, carts.quantity 
         FROM products 
         INNER JOIN carts ON products.prodId = carts.productId 
         WHERE carts.userId = ${this.userId};`
      );

      if (cartItems.length === 0) {
        return { result: 'fail', message: 'Cart is empty' };
      }

      let totalAmount = 0;
      cartItems.forEach((item) => {
        totalAmount += item.productPrice * item.quantity;
      });

      const [orderResult] = await db.execute(
        `INSERT INTO orders (userId, totalAmount, shippingAddress, paymentMethod, couponCode, orderDate) 
         VALUES (${this.userId}, ${totalAmount}, '${this.shippingAddress}', '${this.paymentMethod}', '${this.couponCode}', NOW())`
      );

      const orderId = orderResult.insertId;

      for (let item of cartItems) {
        await db.execute(
          `INSERT INTO order_items (orderId, productId, quantity, price) 
           VALUES (${orderId}, ${item.prodId}, ${item.quantity}, ${item.productPrice})`
        );
      }

      //E-mail küldése
      let email;
      let ordered_products;
      try {
        email = await db.execute(
          'SELECT users.email FROM users WHERE userId = ?',
          [this.userId]
        );
        ordered_products = await db.execute(
          'SELECT products.productName, products.productPrice, order_items.quantity FROM products INNER JOIN order_items ON products.prodId = order_items.productId WHERE order_items.orderId = ?',
          [orderId]
        );
      } catch (err) {
        console.log(err.message);
      }

      ordered_products = ordered_products[0];
      let htmlbody =
        '<h1>Rendszerünk sikeresen rögzítette rendelését!</h1><table style="width:100%; border-collapse: collapse; font-family: Arial, sans-serif;"><tr><th style="border-bottom: 2px solid #ddd; padding: 8px; text-align:left;">Termék</th><th style="border-bottom: 2px solid #ddd; padding: 8px; text-align:right;">Ár</th><th style="border-bottom: 2px solid #ddd; padding: 8px; text-align:right;">Mennyiség</th></tr>';

      for (const row of ordered_products) {
        htmlbody += `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd;">${row.productName}</td><td style="padding: 8px; border-bottom: 1px solid #ddd; text-align:right;">${row.productPrice}</td><td style="padding: 8px; border-bottom: 1px solid #ddd; text-align:right;">${row.quantity}</td></tr>`;
      }

      htmlbody += `</table><br><h1>Fizetendő összeg: ${totalAmount} Ft</h1>`;

      try {
        await transporter.sendMail({
          from: `"DigitalDepot" <${process.env.EMAIL_USER}>`,
          to: email[0][0].email,
          subject: 'Sikeres Rendelés',
          text: 'Rendszerünk sikeresen rögzítette rendelését!',
          html: htmlbody,
        });
      } catch (err) {
        console.log(err.message);
      }

      await db.execute(`DELETE FROM carts WHERE userId = ${this.userId}`);

      return { result: 'success' };
    } catch (err) {
      return { result: 'fail', message: err.message };
    }
  }

  static async fetchByUserId(userId) {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM orders WHERE userId = ${userId} ORDER BY orderId DESC`
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
         WHERE order_items.orderId = ${orderId}`
      );
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async delete(id) {
    try {
      await db.execute(`DELETE FROM order_items WHERE orderId = ${id}`);
      await db.execute(`DELETE FROM orders WHERE orderId = ${id}`);
      return { result: 'success' };
    } catch (err) {
      return { result: 'fail', message: err.message };
    }
  }
};
