const express = require('express');
const router = express.Router();

const Order = require('../models/order');

const verifyToken = require('../util/tokenVerify');

router.get('/items/:orderId', async (req, res) => {
  const orderId = req.params.orderId;

  const idNum = Number(orderId);

  if (!Number.isInteger(idNum) || idNum <= 0) {
    return res
      .status(400)
      .json({ result: 'fail', message: 'érvénytelen rendelésazonosító' });
  }

  try {
    const items = await Order.getOrderItems(orderId);
    res.status(200).json({ result: 'success', data: items });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.fetchByUserId(userId);

    res.status(200).json({ result: 'success', data: orders });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

router.post('/place-order', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { shippingAddress, paymentMethod, couponCode } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'hiányzó adatok' });
    }

    const order = new Order(userId, shippingAddress, paymentMethod, couponCode);

    const result = await order.save();

    if (result.result === 'success') {
      res.status(201).json({ result: 'success', message: 'Sikeres rendelés' });
    } else if (result.message == 'Szerver hiba') {
      console.log(result);
      res.status(500).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'Szerver hiba' });
  }
});

module.exports = router;
