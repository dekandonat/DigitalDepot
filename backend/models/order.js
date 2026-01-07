const db = require('../util/database');

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
        `SELECT SUM(products.productPrice * carts.quantity) AS total 
         FROM products 
         INNER JOIN carts ON products.prodId = carts.productId 
         WHERE carts.userId = ${this.userId};`
      );

      const totalAmount = cartItems[0].total || 0;

      if (totalAmount === 0) {
        return { result: 'fail', message: 'Cart is empty' };
      }

      const [orderResult] = await db.execute(
        `INSERT INTO orders (userId, totalAmount, shippingAddress, paymentMethod, couponCode, orderDate) 
         VALUES (${this.userId}, ${totalAmount}, '${this.shippingAddress}', '${this.paymentMethod}', '${this.couponCode}', NOW())`
      );

      const orderId = orderResult.insertId;

      const [products] = await db.execute(
        `SELECT * FROM carts WHERE userId = ?`,
        [this.userId]
      );

      for (const product of products) {
        await db.execute(
          `INSERT INTO order_items (orderId, productId, quantity) VALUES (?, ?, ?)`,
          [orderId, product.productId, product.quantity]
        );
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
};
