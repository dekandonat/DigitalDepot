const express = require('express');
const router = express.Router();
const db = require('../util/database');

const User = require('../models/user');
const Order = require('../models/order');
const Products = require('../models/products');

router.post('/register', async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ result: 'fail', message: 'only owners can create admins' });
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
    res.status(500).json({ result: 'fail', message: 'server error' });
  }
});

router.get('/users', async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ result: 'fail', message: 'only owners can view users' });
    }
    const users = await User.fetchAllUsers();
    res.status(200).json({ result: 'success', data: users });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'server error' });
  }
});

router.patch('/users/:userId/role', async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ result: 'fail', message: 'only owners can change roles' });
    }
    const userId = req.params.userId;
    const { role } = req.body;
    
    if (role !== 'user' && role !== 'admin' && role !== 'owner') {
      return res.status(400).json({ result: 'fail', message: 'invalid role' });
    }

    const result = await User.updateRole(userId, role);
    if (result.result === 'success') {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'server error' });
  }
});

router.delete('/users/:userId', async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ result: 'fail', message: 'only owners can delete users' });
    }
    const userId = req.params.userId;
    const result = await User.deleteUser(userId);
    if (result.result === 'success') {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (err) {
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

module.exports = router;