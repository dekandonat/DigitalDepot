const express = require('express');
const router = express.Router();
const db = require('../util/database');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const verifyAsync = promisify(jwt.verify);

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM categories');
        if (rows.length > 0) {
            res.status(200).json({ result: 'success', data: rows });
        } else {
            res.status(200).json({ result: 'success', data: 'no categories found' });
        }
    } catch (err) {
        res.status(500).json({ result: 'fail', message: 'error during database querry' });
    }
});

router.get('/:categoryId', async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const sql = `
            SELECT products.*, categories.categoryName 
            FROM products 
            JOIN categories ON products.categoryId = categories.categoryId 
            WHERE products.categoryId = ? OR products.categoryId IN (SELECT categoryId FROM categories WHERE parentId = ?)`;

        const [rows] = await db.execute(sql, [categoryId, categoryId]);

        if (rows.length > 0) {
            res.status(200).json({ result: 'success', data: rows });
        } else {
            res.status(200).json({ result: 'success', data: 'no products found' });
        }
    } catch (err) {
        res.status(500).json({ result: 'fail', message: 'error during database query' });
    }
});

router.post('/', async (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    const token = authorizationHeader && authorizationHeader.split(' ')[1];

    if (!token) return res.status(401).json({ result: 'fail' });

    try {
        const decodedToken = await verifyAsync(token, process.env.SECRET);
        if (decodedToken.role != 'admin') return res.status(403).json({ result: 'fail' });

        const { categoryName, parentId } = req.body;
        
        const parent = parentId ? parentId : null;

        const [result] = await db.execute(
            'INSERT INTO categories (categoryName, parentId) VALUES (?, ?)',
            [categoryName, parent]
        );

        res.status(201).json({ result: 'success', insertId: result.insertId });
    } catch (err) {
        res.status(500).json({ result: 'fail', message: err.message });
    }
});

module.exports = router;