const db = require('../util/database');

module.exports = class Order {
  constructor(userId, shippingAddress) {
    this.userId = userId;
    this.shippingAddress = shippingAddress;
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

      await db.execute(
        `INSERT INTO orders (userId, totalAmount, shippingAddress) 
         VALUES (${this.userId}, ${totalAmount}, '${this.shippingAddress}')`
      );

      await db.execute(`DELETE FROM carts WHERE userId = ${this.userId}`);

      return { result: 'success' };
    } catch (err) {
      return { result: 'fail', message: err.message };
    }
  }
};