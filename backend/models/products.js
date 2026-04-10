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
        [
          this.prodName,
          this.prodDescription,
          this.prodPrice,
          this.prodImg,
          this.categoryId,
        ]
      );
      return { result: 'success' };
    } catch (err) {
      return { result: 'fail', message: 'Szerver hiba' };
    }
  }

  static async fetchAll() {
    try {
      const sql = `
        SELECT p.*, 
        (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE productId = p.prodId) as avgRating, 
        (SELECT COUNT(reviewId) FROM reviews WHERE productId = p.prodId) as reviewCount,
        (SELECT COALESCE(SUM(quantity), 0) FROM order_items WHERE productId = p.prodId) as soldQuantity
        FROM products p
      `;
      const [rows] = await db.execute(sql);
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async fetch(id) {
    try {
      const sql = `
        SELECT p.*, 
        (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE productId = p.prodId) as avgRating, 
        (SELECT COUNT(reviewId) FROM reviews WHERE productId = p.prodId) as reviewCount,
        (SELECT COALESCE(SUM(quantity), 0) FROM order_items WHERE productId = p.prodId) as soldQuantity
        FROM products p 
        WHERE p.prodId = ?
      `;
      const [rows] = await db.execute(sql, [id]);
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async find(string) {
    try {
      const sql = `
        SELECT p.*, 
        (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE productId = p.prodId) as avgRating, 
        (SELECT COUNT(reviewId) FROM reviews WHERE productId = p.prodId) as reviewCount,
        (SELECT COALESCE(SUM(quantity), 0) FROM order_items WHERE productId = p.prodId) as soldQuantity
        FROM products p 
        WHERE p.productName LIKE ? OR p.productDescription LIKE ?
      `;
      const [rows] = await db.execute(sql, [`%${string}%`, `%${string}%`]);
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
      return { result: 'fail', message: 'szerver hiba' };
    }
  }

  static async updateImg(id, img) {
    try {
      await db.execute(`UPDATE products SET productImg = ? WHERE prodId = ?`, [
        img,
        id,
      ]);
      return { result: 'success' };
    } catch (err) {
      return { result: 'fail', message: 'szerver hiba' };
    }
  }

  static async addInventory(id, quantity) {
    try {
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return {
          result: 'fail',
          message: 'A mennyiségnek pozitív egész számnak kell lennie',
        };
      }

      const [result] = await db.execute(
        'UPDATE products SET quantity = quantity + ? WHERE products.prodId = ?',
        [quantity, id]
      );

      if (result.affectedRows == 0) {
        return { result: 'fail', message: 'nincs találat' };
      } else {
        return { result: 'success', message: 'mennyiség frissítve' };
      }

      return { result: 'success' };
    } catch (err) {
      return { result: 'fail', message: 'szerver hiba' };
    }
  }
};
