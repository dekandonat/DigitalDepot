const express = require('express');
const User = require('../models/user');
const db = require('../util/database');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const verifyAsync = promisify(jwt.verify);

const router = express.Router();

router.post('/register', async (req, res) => {
  const user = new User(
    req.body.userName,
    req.body.password,
    req.body.email,
    'user'
  );
  const result = await user.register();
  if (result.result == 'success') {
    res.status(201).json(result);
  } else {
    res.status(500).json(result);
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.login(email, password);
    if (userData.result === 'success') {
      res.cookie('refresh_token', userData.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res
        .status(200)
        .json({ result: userData.result, message: userData.message });
    } else {
      res.status(401).json(userData);
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'server error' });
  }
});

router.post('/reset-code', async (req, res) => {
  const email = req.body.email;
  if (!email) {
    return res.status(404).json({ result: 'fail', message: 'no email given' });
  }
  const response = await User.getCode(email);
  if (response.result == 'success') {
    res.status(200).json(response);
  } else {
    res.status(500).json(response);
  }
});

router.post('/reset-password', async (req, res) => {
  const { email, code, password } = req.body;
  const response = await User.resetPassword(email, code, password);
  if (response.result == 'success') {
    return res.status(200).json(response);
  } else {
    return res.status(400).json(response);
  }
});

router.get('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    console.log(req.cookies);

    if (!refreshToken) {
      return res
        .status(401)
        .json({ result: 'fail', message: 'no refresh token' });
    }

    const result = await User.refresh(refreshToken);
    console.log(result);
    if (result.result == 'success') {
      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({ result: result.result, data: result.data });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ result: 'fail', message: 'server error' });
  }
});

module.exports = router;
router.get('/profile', async (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    const token = authorizationHeader && authorizationHeader.split(' ')[1];
    if (!token) return res.status(401).json({ result: 'fail' });

    try {
        const decodedToken = await verifyAsync(token, process.env.SECRET);
        const [rows] = await db.execute('SELECT userName, email, bankAccountNumber FROM users WHERE userId = ?', [decodedToken.id]);
        if (rows.length > 0) {
            res.status(200).json({ result: 'success', data: rows[0] });
        } else {
            res.status(404).json({ result: 'fail' });
        }
    } catch (err) {
        res.status(500).json({ result: 'fail' });
    }
});

router.patch('/bank-account', async (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    const token = authorizationHeader && authorizationHeader.split(' ')[1];
    if (!token) return res.status(401).json({ result: 'fail' });

    try {
        const decodedToken = await verifyAsync(token, process.env.SECRET);
        const { bankAccountNumber } = req.body;
        await db.execute('UPDATE users SET bankAccountNumber = ? WHERE userId = ?', [bankAccountNumber, decodedToken.id]);
        res.status(200).json({ result: 'success' });
    } catch (err) {
        res.status(500).json({ result: 'fail' });
    }
});

module.exports = router;
