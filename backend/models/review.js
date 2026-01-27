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
};