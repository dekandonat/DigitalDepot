const db = require('../util/database');

module.exports = class Products {
  constructor(prodName, prodDescription, prodPrice, prodImg) {
    this.prodName = prodName;
    this.prodDescription = prodDescription;
    this.prodPrice = prodPrice;
    this.prodImg = prodImg;
  }

  async save() {
    try {
      await db.execute(
        `INSERT INTO products (productName, productDescription, productPrice, productImg) VALUES ("${this.prodName}", "${this.prodDescription}", ${this.prodPrice}, "${this.prodImg}")`
      );
      return { result: 'success' };
    } catch (err) {
      return { result: 'fail', message: err.message };
    }
  }

  static async fetchAll() {
    try {
      const [rows] = await db.execute('SELECT * FROM products');
      console.log(rows);
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async fetch(id) {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM products WHERE prodId = ${id}`
      );
      console.log(rows);
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async find(string) {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM products WHERE products.productName LIKE "%${string}%" OR products.productDescription LIKE "%${string}%";`
      );
      return rows;
    } catch (err) {
      throw err;
    }
  }
};
