const express = require('express');
const router = express.Router();
const db = require('../util/database');

const User = require('../models/user');
const Order = require('../models/order');
const Products = require('../models/products');
const News = require('../models/news');
const Coupon = require('../models/coupon');
const upload = require('../util/upload');
const validateImage = require('../util/validateImage');

const groupMessagesByUser = (messages) => {
  const groupMap = {};

  for (const message of messages) {
    const userId = message.recipientId ?? message.sender;

    if (!groupMap[userId]) {
      groupMap[userId] = {
        id: userId,
        userName: message.userName || null,
        chatTopic: message.chatTopic || 'Egyéb',
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
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        result: 'fail',
        message: 'Csak a tulajdonosnak engedélyezett',
      });
    }

    if (!req.body.userName || !req.body.password || !req.body.email) {
      return res.status(400).json({ result: 'fail', message: 'hiányzó adat' });
    }

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
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

router.get('/users', async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        result: 'fail',
        message: 'Csak a tulajdonosnak engedélyezett',
      });
    }
    const users = await User.fetchAllUsers();
    res.status(200).json({ result: 'success', data: users });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

router.patch('/users/:userId/role', async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        result: 'fail',
        message: 'Csak a tulajdonosnak engedélyezett',
      });
    }
    const userId = req.params.userId;

    const numId = Number(userId);

    if (!Number.isInteger(numId) || numId <= 0) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'érvénytelen azonosító' });
    }

    const { role } = req.body;

    if (role !== 'user' && role !== 'admin' && role !== 'owner') {
      return res
        .status(400)
        .json({ result: 'fail', message: 'érvénytelen role' });
    }

    const result = await User.updateRole(numId, role);
    if (result.result === 'success') {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

router.delete('/users/:userId', async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        result: 'fail',
        message: 'Csak a tulajdonosnak engedélyezett',
      });
    }
    const userId = req.params.userId;

    const numId = Number(userId);

    if (!Number.isInteger(numId) || numId <= 0) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'érvénytelen azonosító' });
    }

    const result = await User.deleteUser(numId);
    if (result.result === 'success') {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
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
    return res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

router.get('/orders/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const numId = Number(orderId);

    if (!Number.isInteger(numId) || numId <= 0) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'érvénytelen azonosító' });
    }

    const result = await Order.getOrderItems(numId);
    res.status(200).json({ result: 'success', data: result });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

router.delete('/orders/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const numId = Number(orderId);

    if (!Number.isInteger(numId) || numId <= 0) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'érvénytelen azonosító' });
    }

    const result = await Order.delete(numId);
    if (result.result === 'success') {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

router.patch('/orders/:orderId/status', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;
    await db.execute('UPDATE orders SET status = ? WHERE orderId = ?', [
      status,
      orderId,
    ]);
    res.status(200).json({ result: 'success' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

router.patch('/products/addInventory', async (req, res) => {
  try {
    const { id, quantity } = req.body;
    const result = await Products.addInventory(id, quantity);

    if (result.result == 'success') {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

router.patch('/products/:prodId', async (req, res) => {
  const id = req.params.prodId;
  const { prodName, prodDescription, prodPrice, conditionState } = req.body;

  if (
    !prodName ||
    !prodDescription ||
    !prodPrice ||
    conditionState === undefined
  ) {
    return res.status(400).json({ result: 'fail', message: 'hiányzó értékek' });
  }

  const numId = Number(id);
  const numPrice = Number(prodPrice);

  if (!Number.isInteger(numPrice) || numPrice <= 0) {
    return res.status(400).json({ result: 'fail', message: 'érvénytelen ár' });
  }

  if (!Number.isInteger(numId) || numId <= 0) {
    return res
      .status(400)
      .json({ result: 'fail', message: 'érvénytelen azonosító' });
  }

  try {
    const result = await Products.update(
      numId,
      prodName,
      prodDescription,
      numPrice,
      conditionState
    );
    if (result.result === 'success') {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

router.get('/messages/:id', async (req, res) => {
  try {
    const numId = Number(req.params.id);
    if (!Number.isInteger(numId) || numId <= 0) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'érvénytelen azonosító' });
    }

    const [rows] = await db.execute(
      `SELECT messages.message, 
        messages.sender, 
        messages.recipientId, 
        messages.sentAt,
        users.userName, 
        users.chatTopic 
       FROM messages 
       LEFT JOIN users ON (users.userId = messages.sender OR users.userId = messages.recipientId) 
       WHERE users.userID = ? 
       ORDER BY messages.id ASC`,
      [numId]
    );

    const messageList = groupMessagesByUser(rows);
    res.status(200).json({ result: 'success', data: messageList });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

router.get('/messages', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT messages.message, 
        messages.sender, 
        messages.recipientId, 
        messages.sentAt,
        users.userName, 
        users.chatTopic 
       FROM messages 
       LEFT JOIN users ON (users.userId = messages.sender OR users.userId = messages.recipientId) 
       WHERE users.role = 'user' 
       ORDER BY messages.id ASC`
    );

    const messageList = groupMessagesByUser(rows);
    res.status(200).json({ result: 'success', data: messageList });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

router.patch('/readmessages/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const idNum = Number(userId);

    if (!Number.isInteger(idNum) || idNum <= 0) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'érvénytelen azonosító' });
    }

    const [rows] = await db.execute(
      'UPDATE messages SET unread = 0 WHERE sender = ? AND recipientId IS NULL AND unread = 1;',
      [idNum]
    );
    res
      .status(200)
      .json({ result: 'success', affectedRows: rows.affectedRows });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

router.delete('/messages/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const idNum = Number(userId);

    if (!Number.isInteger(idNum) || idNum <= 0) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'érvénytelen azonosító' });
    }

    const [rows] = await db.execute(
      'DELETE FROM messages WHERE messages.sender = ? OR messages.recipientId = ?;',
      [idNum, idNum]
    );
    res
      .status(200)
      .json({ result: 'success', affectedRows: rows.affectedRows });
  } catch (err) {
    res.status(500).json({ result: 'fail' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { categoryName, parentId } = req.body;

    const parent = parentId ? parentId : null;

    if (!categoryName) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'nincs megadott kategória név' });
    }

    const [result] = await db.execute(
      'INSERT INTO categories (categoryName, parentId) VALUES (?, ?)',
      [categoryName, parent]
    );

    res.status(201).json({ result: 'success', insertId: result.insertId });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

router.post(
  '/addProduct',
  upload.uploadMiddleware,
  validateImage,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ result: 'fail', message: 'hiányzó kép' });
      }

      const img = `uploads/products/${req.file.filename}`;

      const priceNum = Number(req.body.prodPrice);
      const cateogryNum = Number(req.body.categoryId);

      if (!Number.isInteger(priceNum)) {
        return res
          .status(400)
          .json({ result: 'fail', message: 'az árnak számnak kell lennie' });
      }

      if (!Number.isInteger(cateogryNum)) {
        return res
          .status(400)
          .json({ result: 'fail', message: 'érvénytelen kategória' });
      }

      if (
        req.body.prodName.trim() === '' ||
        req.body.prodDescription.trim() === '' ||
        priceNum <= 0 ||
        cateogryNum <= 0
      ) {
        return res
          .status(400)
          .json({ result: 'fail', message: 'hiányzó adatok' });
      }

      const product = new Products(
        req.body.prodName,
        req.body.prodDescription,
        priceNum,
        img,
        cateogryNum
      );
      const result = await product.save();
      if (result.result === 'success') {
        res.status(201).json(result);
      } else {
        return res.status(500).json(result);
      }
    } catch (err) {
      return res.status(400).json({ result: 'fail', message: 'szerver hiba' });
    }
  }
);

router.post(
  '/news',
  upload.uploadNewsMiddleware,
  validateImage,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ result: 'fail', message: 'hiányzó kép' });
      }

      if (!req.body.alt) {
        return res
          .status(400)
          .json({ result: 'fail', message: 'hiányzó leírás' });
      }

      const imgPath = `uploads/news/${req.file.filename}`;
      const result = await News.Upload(imgPath, req.body.alt);

      if (result.result == 'success') {
        res.status(200).json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (err) {
      res.status(500).json({ result: 'fail', message: 'szerver hiba' });
    }
  }
);

router.delete('/news/:id', async (req, res) => {
  try {
    const numId = Number(req.params.id);

    if (!Number.isInteger(numId) || numId <= 0) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'érvénytelen azonosító' });
    }

    const result = await News.Delete(numId);

    if (result.result == 'success') {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (err) {
    return res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

router.post('/coupon', async (req, res) => {
  try {
    const { code, price } = req.body;
    if (!code || !price) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'Hiányzó paraméter' });
    }

    const numPrice = Number(price);

    if (!Number.isInteger(numPrice) || numPrice <= 0) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'nem megfelelő érték az árnak' });
    }

    const result = await Coupon.add(code, numPrice);
    if (result.result == 'success') {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'Szerver hiba' });
  }
});

module.exports = router;
