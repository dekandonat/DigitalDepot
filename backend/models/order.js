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
      } catch (err) {
        console.log(err.message);
      }

      try {
        await transporter.sendMail({
          from: `"DigitalDepot" <${process.env.EMAIL_USER}>`,
          to: email[0][0].email,
          subject: 'Sikeres Rendelés',
          text: 'Rendszerünk sikeresen rögzítette rendelését!',
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
};
