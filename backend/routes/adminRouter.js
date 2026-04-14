const express = require('express');
const router = express.Router();
const db = require('../util/database');
const fs = require('fs');

const User = require('../models/user');
const Order = require('../models/order');
const Products = require('../models/products');
const News = require('../models/news');
const Coupon = require('../models/coupon');
const upload = require('../util/upload');
const validateImage = require('../util/validateImage');
const processImage = require('../util/imageProcessor');

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

const insertCategory = async (catName, parentId) => {
  try {
    const [rows] = await db.execute(
      'INSERT INTO categories(categoryName, parentId) VALUES(?, ?);',
      [catName, parentId]
    );
    return rows.insertId;
  } catch (err) {
    return 'error';
  }
};

router.get('/statistics', async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        result: 'fail',
        message: 'Csak a tulajdonosnak engedélyezett',
      });
    }

    const period = req.query.period || 'all';
    let orderDateCond = '';
    let submissionDateCond = '';

    if (period === '7d') {
      orderDateCond = ' AND orderDate >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
      submissionDateCond =
        ' AND submissionDate >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } else if (period === '1m') {
      orderDateCond = ' AND orderDate >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
      submissionDateCond =
        ' AND submissionDate >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
    } else if (period === '1y') {
      orderDateCond = ' AND orderDate >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
      submissionDateCond =
        ' AND submissionDate >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
    }

    const [users] = await db.execute(
      'SELECT COUNT(userId) as count FROM users'
    );
    const [orders] = await db.execute(
      `SELECT COUNT(orderId) as count FROM orders WHERE 1=1${orderDateCond}`
    );
    const [revenue] = await db.execute(
      `SELECT SUM(totalAmount) as total FROM orders WHERE status != "Törölve"${orderDateCond}`
    );
    const [soldProducts] = await db.execute(
      `SELECT SUM(order_items.quantity) as total FROM order_items JOIN orders ON order_items.orderId = orders.orderId WHERE orders.status != "Törölve"${orderDateCond}`
    );
    const [purchasedUsed] = await db.execute(
      `SELECT COUNT(submissionId) as count FROM used_product_submissions WHERE status IN ("offer_accepted", "listed")${submissionDateCond}`
    );

    res.status(200).json({
      result: 'success',
      data: {
        totalUsers: users[0].count || 0,
        totalOrders: orders[0].count || 0,
        totalRevenue: revenue[0].total || 0,
        soldProducts: soldProducts[0].total || 0,
        successfulBuybacks: purchasedUsed[0].count || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

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
  processImage(800, 600),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ result: 'fail', message: 'hiányzó kép' });
      }

      let {
        prodPrice,
        categoryId,
        prodName,
        prodDescription,
        newCategory,
        newSubcategory,
      } = req.body;

      const img = `uploads/products/${req.file.filename}`;

      const priceNum = Number(prodPrice);

      if (
        prodName?.trim() === '' ||
        prodDescription?.trim() === '' ||
        priceNum <= 0 ||
        (!categoryId && !newCategory)
      ) {
        await fs.unlink(req.file.path).catch(() => {
          console.log('failed to remove file: ' + req.file.filename);
        });
        return res
          .status(400)
          .json({ result: 'fail', message: 'hiányzó adatok' });
      }

      if (!Number.isInteger(priceNum)) {
        await fs.unlink(req.file.path).catch(() => {
          console.log('failed to remove file: ' + req.file.filename);
        });
        return res
          .status(400)
          .json({ result: 'fail', message: 'az árnak számnak kell lennie' });
      }

      if (newCategory) {
        const mainId = await insertCategory(newCategory.trim(), null);
        const subId = await insertCategory(newSubcategory.trim(), mainId);
        categoryId = subId;
      }

      if (!newCategory && newSubcategory && categoryId) {
        const categoryNum = Number(categoryId);

        if (!Number.isInteger(categoryNum)) {
          await fs.unlink(req.file.path).catch(() => {
            console.log('failed to remove file: ' + req.file.filename);
          });
          return res
            .status(400)
            .json({ result: 'fail', message: 'nem megfelelő kategória' });
        }
        const subId = await insertCategory(newSubcategory, categoryNum);
        categoryId = subId;
      }

      const categoryNum = Number(categoryId);

      if (!Number.isInteger(categoryNum) || categoryNum < 1) {
        await fs.unlink(req.file.path).catch(() => {
          console.log('failed to remove file: ' + req.file.filename);
        });
        return res
          .status(400)
          .json({ result: 'fail', message: 'nem megfelelő kategória' });
      }

      const product = new Products(
        prodName,
        prodDescription,
        priceNum,
        img,
        categoryNum
      );
      const result = await product.save();
      if (result.result === 'success') {
        res.status(201).json(result);
      } else {
        await fs.unlink(req.file.path).catch(() => {
          console.log('failed to remove file: ' + req.file.filename);
        });
        return res.status(500).json(result);
      }
    } catch (err) {
      await fs.unlink(req.file.path).catch(() => {
        console.log('failed to remove file: ' + req.file.filename);
      });
      return res.status(500).json({ result: 'fail', message: 'szerver hiba' });
    }
  }
);

router.patch(
  '/product/:prodId',
  upload.uploadMiddleware,
  validateImage,
  processImage(800, 600),
  async (req, res) => {
    try {
      const id = req.params.prodId;

      const numId = Number(id);

      if (!Number.isInteger(numId) || numId <= 0) {
        return res
          .status(400)
          .json({ result: 'fail', message: 'nem megfelelő azonosító' });
      }

      if (!req.file) {
        return res.status(400).json({ result: 'fail', message: 'hiányzó kép' });
      }

      const img = `uploads/products/${req.file.filename}`;

      const result = await Products.updateImg(numId, img);

      if (result.result == 'success') {
        res.status(200).json(result);
      } else {
        res.status(500).json({ result: 'fail', message: 'szerver hiba' });
      }
    } catch (err) {
      res.status(500).json({ result: 'fail', message: 'szerver hiba' });
    }
  }
);

router.post(
  '/news',
  upload.uploadNewsMiddleware,
  validateImage,
  processImage(1200, 600),
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
