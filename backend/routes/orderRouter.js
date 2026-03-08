const express = require('express');
const router = express.Router();

const Order = require('../models/order');

const verifyToken = require('../util/tokenVerify');

router.get('/items/:orderId', async (req, res) => {
  const orderId = req.params.orderId;

  const idNum = Number(orderId);

  if (!Number.isInteger(idNum) || idNum <= 0) {
    return res.status(400).json({ result: 'fail', message: 'invalid orderId' });
  }

  try {
    const items = await Order.getOrderItems(orderId);
    res.status(200).json({ result: 'success', data: items });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: 'fail', message: 'server error' });
  }
});

router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.fetchByUserId(userId);

    res.status(200).json({ result: 'success', data: orders });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: 'fail', message: 'server error' });
  }
});

router.post('/place-order', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

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
