const express = require('express');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const db = require('../util/database');

const router = express.Router();

const verifyAsync = promisify(jwt.verify);

router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const [items] = await db.execute(
      `SELECT products.*, carts.quantity FROM products INNER JOIN carts ON products.prodId = carts.productId WHERE carts.userId = ?;`,
      [userId]
    );
    const [total] = await db.execute(
      `SELECT SUM(products.productPrice * carts.quantity) AS total FROM products INNER JOIN carts ON products.prodId = carts.productId WHERE carts.userId = ?;`,
      [userId]
    );
    res.status(200).json({ result: 'success', data: { items, total } });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: 'fail', message: 'server error' });
  }
});

router.post('/add/:id/:quantity', async (req, res) => {
  const productId = req.params.id;
  const quantity = req.params.quantity;

  try {
    const userId = req.user.id;
    await db.execute(
      `INSERT INTO carts (userId, productId, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + 1;`,
      [userId, productId, quantity]
    );
    res.status(201).json({ result: 'success' });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ result: 'fail', message: 'failed to validate token' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { amount } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;
    if (amount != 0) {
      await db.execute(
        `UPDATE carts SET quantity = quantity + ? WHERE userId = ? AND productId = ?`,
        [amount, userId, productId]
      );
      if (amount < 0) {
        await db.execute('DELETE FROM carts WHERE quantity <= 0;');
      }
      res.status(200).json({ result: 'success' });
    } else {
      res.status(200).json({ result: 'success', message: 'nothing changed' });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ result: 'server error' });
  }
});

module.exports = router;
