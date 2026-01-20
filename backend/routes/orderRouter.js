const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const Order = require('../models/order');

const verifyAsync = promisify(jwt.verify);

router.get('/items/:orderId', async (req, res) => {
  const orderId = req.params.orderId;
  try {
    const items = await Order.getOrderItems(orderId);
    res.status(200).json({ result: 'success', data: items });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: 'fail', message: 'server error' });
  }
});

router.get('/my-orders', async (req, res) => {
  const authorizationHeader = req.headers['authorization'];
  const token = authorizationHeader && authorizationHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ result: 'fail', message: 'no token found' });
  }

  try {
    const decodedToken = await verifyAsync(token, process.env.SECRET);
    const userId = decodedToken.id;

    const orders = await Order.fetchByUserId(userId);

    res.status(200).json({ result: 'success', data: orders });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: 'fail', message: 'server error' });
  }
});

router.post('/place-order', async (req, res) => {
  const authorizationHeader = req.headers['authorization'];
  const token = authorizationHeader && authorizationHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ result: 'fail', message: 'no token found' });
  }

  try {
    const decodedToken = await verifyAsync(token, process.env.SECRET);
    const userId = decodedToken.id;

    const { shippingAddress, paymentMethod, couponCode } = req.body;

    const order = new Order(userId, shippingAddress, paymentMethod, couponCode);

    const result = await order.save();

    if (result.result === 'success') {
      res
        .status(201)
        .json({ result: 'success', message: 'Order placed successfully' });
    } else {
      res.status(500).json(result);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: 'fail', message: 'server error' });
  }
});

module.exports = router;
