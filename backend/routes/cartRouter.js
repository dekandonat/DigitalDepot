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

  const idNum = Number(productId);
  const quantityNum = Number(quantity);

  if (!Number.isInteger(idNum) || idNum <= 0) {
    return res.status(400).json({ result: 'fail', message: 'invalid id' });
  }

  if (!Number.isInteger(quantityNum) || quantityNum <= 0) {
    return res
      .status(400)
      .json({ result: 'fail', message: 'quantity must be a number' });
  }

  try {
    const userId = req.user.id;
    await db.execute(
      `INSERT INTO carts (userId, productId, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?;`,
      [userId, idNum, quantityNum, quantityNum]
    );
    res.status(201).json({ result: 'success' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: 'fail', message: 'server error' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { amount } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;

    const productNum = Number(productId);
    const amountNum = Number(amount);

    if (!Number.isInteger(productNum) || productNum <= 0) {
      return res.status(400).json({ result: 'fail', message: 'invalid id' });
    }

    if (!Number.isInteger(amountNum)) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'quantity must be a number' });
    }

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
