const db = require('../util/database');

module.exports = class Products {
  constructor(prodName, prodDescription, prodPrice, prodImg, categoryId) {
    this.prodName = prodName;
    this.prodDescription = prodDescription;
    this.prodPrice = prodPrice;
    this.prodImg = prodImg;
    this.categoryId = categoryId;
  }

  async save() {
    try {
      await db.execute(
        `INSERT INTO products (productName, productDescription, productPrice, productImg, categoryId) VALUES (?, ?, ?, ?, ?)`,
        [this.prodName, this.prodDescription, this.prodPrice, this.prodImg, this.categoryId]
      );
      return { result: 'success' };
    } catch (err) {
      return { result: 'fail', message: err.message };
    }
  }

  static async fetchAll() {
    try {
      const [rows] = await db.execute('SELECT * FROM products');
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async fetch(id) {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM products WHERE prodId = ?`,
        [id]
      );
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async find(string) {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM products WHERE products.productName LIKE ? OR products.productDescription LIKE ?`,
        [`%${string}%`, `%${string}%`]
      );
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async update(id, name, desc, price, condition) {
    try {
      await db.execute(
        `UPDATE products SET productName = ?, productDescription = ?, productPrice = ?, conditionState = ? WHERE prodId = ?`,
        [name, desc, price, condition, id]
      );
      return { result: 'success' };
    } catch (err) {
      return { result: 'fail', message: err.message };
    }
  }

  static async addInventory(id, quantity) {
    try {
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return {
          result: 'fail',
          message: 'quantity must be a positive integer',
        };
      }

      const [result] = await db.execute(
        'UPDATE products SET quantity = quantity + ? WHERE products.prodId = ?',
        [quantity, id]
      );

      if (result.affectedRows == 0) {
        return { result: 'fail', message: 'no product found' };
      } else {
        return { result: 'success', message: 'quantity updated' };
      }
    } catch (err) {
      console.log(err.message);
      return { result: 'fail', message: 'server error' };
    }
  }
};