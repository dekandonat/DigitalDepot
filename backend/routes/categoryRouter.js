const express = require('express');
const router = express.Router();
const db = require('../util/database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM categories');
    res.status(200).json({ result: 'success', data: rows });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'Szerver hiba' });
  }
});

router.get('/:categoryId', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const categoryNum = Number(categoryId);

    if (!Number.isInteger(categoryNum) || categoryNum <= 0) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'érvénytelen kategória' });
    }

    const sql = `
            SELECT products.*, categories.categoryName 
            FROM products 
            JOIN categories ON products.categoryId = categories.categoryId 
            WHERE products.categoryId = ? OR products.categoryId IN (SELECT categoryId FROM categories WHERE parentId = ?)`;

    const [rows] = await db.execute(sql, [categoryNum, categoryNum]);

    res.status(200).json({ result: 'success', data: rows });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

module.exports = router;
