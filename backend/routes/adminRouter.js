const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const db = require('../util/database');

const User = require('../models/user');
const Order = require('../models/order');

const verifyAsync = promisify(jwt.verify);

router.post('/register', async (req, res) => {
  const authorizationHeader = req.headers['authorization'];
  const token = authorizationHeader && authorizationHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ result: 'fail', message: 'no token found' });
  }

  try {
    const decodedToken = await verifyAsync(token, process.env.SECRET);
    const role = decodedToken.role;

    if (role == 'admin') {
      const user = new User(
        req.body.userName,
        req.body.password,
        req.body.email,
        'admin'
      );
      const result = await user.register();
      if (result.result == 'success') {
        res.status(201).json(result);
      } else {
        res.status(500).json(result);
      }
    } else {
      res
        .status(403)
        .json({ result: 'fail', message: 'not authorized action' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: 'fail', message: 'server error' });
  }
});

router.get('/orders', async (req, res) => {
  const authorizationHeader = req.headers['authorization'];
  const token = authorizationHeader && authorizationHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ result: 'fail', message: 'no token found' });
  }

  try {
    const decodedToken = await verifyAsync(token, process.env.SECRET);
    const role = decodedToken.role;

    if (role == 'admin') {
      try {
        const [rows] = await db.execute('SELECT * FROM orders ORDER BY orderDate DESC');
        return res.status(200).json({ result: 'success', data: rows });
      } catch (err) {
        console.log(err);
        return res
          .status(500)
          .json({ result: 'fail', message: 'database error' });
      }
    } else {
      return res
        .status(403)
        .json({ result: 'fail', message: 'not authorized action' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: 'fail', message: 'server error' });
  }
});

router.delete('/orders/:orderId', async (req, res) => {
  const authorizationHeader = req.headers['authorization'];
  const token = authorizationHeader && authorizationHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ result: 'fail', message: 'no token found' });
  }

  try {
    const decodedToken = await verifyAsync(token, process.env.SECRET);
    const role = decodedToken.role;

    if (role == 'admin') {
      const orderId = req.params.orderId;
      const result = await Order.delete(orderId);
      if (result.result === 'success') {
        res.status(200).json(result);
      } else {
        res.status(500).json(result);
      }
    } else {
      res.status(403).json({ result: 'fail', message: 'not authorized action' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: 'fail', message: 'server error' });
  }
});

module.exports = router;