const express = require('express');
const router = express.Router();
const db = require('../util/database');

const User = require('../models/user');
const Order = require('../models/order');
const Products = require('../models/products');

const groupMessagesByUser = (messages) => {
  const groupMap = {};

  for (const message of messages) {
    const userId = message.recipientId ?? message.sender;

    if (!groupMap[userId]) {
      groupMap[userId] = {
        id: userId,
        unread: false,
        messages: [],
      };
    }

    groupMap[userId].messages.push({
      text: message.message,
      sender: message.sender,
      recipientId: message.recipientId,
      date: message.sentAt,
    });

    if (!message.recipientId && message.unread) {
      groupMap[userId].unread = true;
    }
  }

  return Object.values(groupMap);
};

router.post('/register', async (req, res) => {
  try {
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
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: 'fail', message: 'server error' });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM orders ORDER BY orderDate DESC'
    );
    return res.status(200).json({ result: 'success', data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ result: 'fail', message: 'database error' });
  }
});

router.delete('/orders/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const result = await Order.delete(orderId);
    if (result.result === 'success') {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: 'fail', message: 'server error' });
  }
});

router.patch('/products/addInventory', async (req, res) => {
  try {
    const { id, quantity } = req.body;
    const result = await Products.addInventory(id, quantity);

    if (result.result == 'success') {
      res.status(200).json(result);
    } else {
      console.log(result);
      res.status(500).json(result);
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'server error' });
  }
});

router.patch('/products/:prodId', async (req, res) => {
  const id = req.params.prodId;
  const { prodName, prodDescription, prodPrice, conditionState } = req.body;

  try {
    const result = await Products.update(
      id,
      prodName,
      prodDescription,
      prodPrice,
      conditionState
    );
    if (result.result === 'success') {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: err.message });
  }
});

router.get('/messages', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM messages ORDER BY messages.id'
    );
    const messageList = groupMessagesByUser(rows);
    res.status(200).json({ result: 'success', data: messageList });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ result: 'fail', message: err.message });
  }
});

router.patch('/readmessages/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const [rows] = await db.execute(
      'UPDATE messages SET unread = 0 WHERE sender = ? AND recipientId IS NULL AND unread = 1;',
      [userId]
    );
    res
      .status(200)
      .json({ result: 'success', affectedRows: rows.affectedRows });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: err.message });
  }
});

module.exports = router;
