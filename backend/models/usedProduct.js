const db = require('../util/database');

module.exports = class UsedProduct {
  constructor(userId, productName, productDescription, conditionState, productImage) {
    this.userId = userId;
    this.productName = productName;
    this.productDescription = productDescription;
    this.conditionState = conditionState;
    this.productImage = productImage;
  }

  async save() {
    try {
      await db.execute(
        `INSERT INTO used_product_submissions (userId, productName, productDescription, conditionState, productImage, status) 
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [this.userId, this.productName, this.productDescription, this.conditionState, this.productImage]
      );
      return { result: 'success' };
    } catch (err) {
      return { result: 'fail', message: err.message };
    }
  }

  static async fetchAll() {
    try {
      const [rows] = await db.execute(
        `SELECT used_product_submissions.*, users.userName, users.email, users.bankAccountNumber 
         FROM used_product_submissions 
         JOIN users ON used_product_submissions.userId = users.userId 
         ORDER BY used_product_submissions.submissionDate DESC`
      );
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async fetchByUserId(userId) {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM used_product_submissions WHERE userId = ? ORDER BY submissionDate DESC`,
        [userId]
      );
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async updateStatus(submissionId, status, offerPrice) {
    try {
      await db.execute(
        `UPDATE used_product_submissions SET status = ?, adminOfferPrice = ? WHERE submissionId = ?`,
        [status, offerPrice, submissionId]
      );
      return { result: 'success' };
    } catch (err) {
      return { result: 'fail', message: err.message };
    }
  }

  static async userRespondToOffer(submissionId, decision) {
    try {
      const newStatus = decision == 'accept' ? 'offer_accepted' : 'offer_rejected';
      await db.execute(
        `UPDATE used_product_submissions SET status = ? WHERE submissionId = ?`,
        [newStatus, submissionId]
      );
      return { result: 'success' };
    } catch (err) {
      return { result: 'fail', message: err.message };
    }
  }
};