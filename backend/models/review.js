const db = require('../util/database');

module.exports = class Review {
    constructor(userId, productId, rating, comment) {
        this.userId = userId;
        this.productId = productId;
        this.rating = rating;
        this.comment = comment;
    }

    async save() {
        try {
            await db.execute(
                `INSERT INTO reviews (userId, productId, rating, comment) 
                 VALUES (?, ?, ?, ?)`,
                [this.userId, this.productId, this.rating, this.comment]
            );
            return { result: 'success' };
        } catch (err) {
            return { result: 'fail', message: err.message };
        }
    }

    static async fetchByProductId(productId) {
        try {
            const [rows] = await db.execute(`
                SELECT reviews.*, users.userName 
                FROM reviews 
                JOIN users ON reviews.userId = users.userId 
                WHERE reviews.productId = ? 
                ORDER BY reviews.reviewDate DESC`, 
                [productId]
            );
            return rows;
        } catch (err) {
            throw err;
        }
    }

    static async hasUserReviewed(userId, productId) {
        try {
            const [rows] = await db.execute(
                `SELECT reviewId FROM reviews WHERE userId = ? AND productId = ?`,
                [userId, productId]
            );
            return rows.length > 0;
        } catch (err) {
            throw err;
        }
    }

    static async fetchUserReview(userId, productId) {
        try {
            const [rows] = await db.execute(
                `SELECT * FROM reviews WHERE userId = ? AND productId = ?`,
                [userId, productId]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (err) {
            throw err;
        }
    }

    static async update(reviewId, userId, rating, comment) {
        try {
            await db.execute(
                `UPDATE reviews SET rating = ?, comment = ? WHERE reviewId = ? AND userId = ?`,
                [rating, comment, reviewId, userId]
            );
            return { result: 'success' };
        } catch (err) {
            return { result: 'fail', message: err.message };
        }
    }

    static async delete(reviewId, userId) {
        try {
            await db.execute(
                `DELETE FROM reviews WHERE reviewId = ? AND userId = ?`,
                [reviewId, userId]
            );
            return { result: 'success' };
        } catch (err) {
            return { result: 'fail', message: err.message };
        }
    }
};