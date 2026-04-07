const express = require('express');
const User = require('../models/user');
const db = require('../util/database');
const verifyToken = require('../util/tokenVerify');
const router = express.Router();
const validator = require('validator');

router.post('/register', async (req, res) => {
  try {
    const { userName, password, email } = req.body;

    if (userName.trim() == '' || password.trim() == '' || email.trim() == '') {
      return res
        .status(400)
        .json({ result: 'fail', message: 'hiányzó adatok' });
    }

    if (password.trim().length < 8) {
      return res.status(400).json({
        result: 'fail',
        message: 'a jelszónak legalább 8 karakter hosszúnak kell lennie!',
      });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'Érvénytelen email cím' });
    }

    const user = new User(userName, password, email, 'user');
    const result = await user.register();
    if (result.result == 'success') {
      res.status(201).json(result);
    } else if (result.message == 'email használatban van') {
      res.status(409).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'Szerver hiba' });
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
      res.status(403).json(userData);
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (refreshToken) {
      await User.logout(refreshToken);
    }
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
    res.status(200).json({ result: 'success' });
  } catch (err) {
    res.status(500).json({ result: 'fail' });
  }
});

router.post('/reset-code', async (req, res) => {
  const email = req.body.email;
  if (!email) {
    return res
      .status(404)
      .json({ result: 'fail', message: 'nincs megadott email' });
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
  } else if (response.message == 'hibás email vagy kód') {
    return res.status(400).json(response);
  } else {
    return res.status(500).json(response);
  }
});

router.get('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ result: 'fail', message: 'nincs refresh token' });
    }

    const result = await User.refresh(refreshToken);
    if (result.result == 'success') {
      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({ result: result.result, data: result.data });
    } else {
      res.status(500).json({ result: 'fail', message: 'token hiba' });
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'Szerver error' });
  }
});

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT userName, email, bankAccountNumber FROM users WHERE userId = ?',
      [req.user.id]
    );
    if (rows.length > 0) {
      res.status(200).json({ result: 'success', data: rows[0] });
    } else {
      res.status(404).json({ result: 'fail' });
    }
  } catch (err) {
    res.status(500).json({ result: 'fail' });
  }
});

router.patch('/bank-account', verifyToken, async (req, res) => {
  try {
    let { bankAccountNumber } = req.body;

    if (!bankAccountNumber.includes('HU')) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'nem megfelelő formátum' });
    }

    bankAccountNumber = bankAccountNumber.split(' ')[1];

    if (!bankAccountNumber || bankAccountNumber.trim() == '') {
      return res
        .status(400)
        .json({ result: 'fail', message: 'nem adott meg bankszámlaszámot' });
    }

    if (!/^\d+$/.test(bankAccountNumber.trim())) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'nem megfelelő formátum' });
    }

    if (bankAccountNumber.trim().length !== 24) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'nem megfelelő hossz' });
    }

    await db.execute(
      'UPDATE users SET bankAccountNumber = ? WHERE userId = ?',
      [bankAccountNumber, req.user.id]
    );
    res.status(200).json({ result: 'success' });
  } catch (err) {
    res.status(500).json({ result: 'fail' });
  }
});

router.get('/addresses', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM user_addresses WHERE userId = ?',
      [req.user.id]
    );
    res.status(200).json({ result: 'success', data: rows });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

router.post('/addresses', verifyToken, async (req, res) => {
  try {
    const { zipCode, city, streetAddress } = req.body;
    if (!zipCode || !city || !streetAddress) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'Hiányzó adatok' });
    }
    await db.execute(
      'INSERT INTO user_addresses (userId, zipCode, city, streetAddress) VALUES (?, ?, ?, ?)',
      [req.user.id, zipCode, city, streetAddress]
    );
    res.status(201).json({ result: 'success' });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

router.delete('/addresses/:id', verifyToken, async (req, res) => {
  try {
    const addressId = req.params.id;
    await db.execute('DELETE FROM user_addresses WHERE id = ? AND userId = ?', [
      addressId,
      req.user.id,
    ]);
    res.status(200).json({ result: 'success' });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

router.patch('/chat-topic', verifyToken, async (req, res) => {
  try {
    const { topic } = req.body;
    await db.execute('UPDATE users SET chatTopic = ? WHERE userId = ?', [
      topic,
      req.user.id,
    ]);
    res.status(200).json({ result: 'success' });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

router.get('/messages', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM messages WHERE messages.sender = ? OR messages.recipientId = ? ORDER BY id ASC;',
      [req.user.id, req.user.id]
    );

    const [userRows] = await db.execute(
      'SELECT chatTopic FROM users WHERE userId = ?',
      [req.user.id]
    );

    let chatTopic = 'Egyéb';
    if (userRows.length > 0 && userRows[0].chatTopic) {
      chatTopic = userRows[0].chatTopic;
    }

    res.status(200).json({
      result: 'success',
      data: [{ messages: rows, chatTopic: chatTopic }],
    });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

router.post('/readmessages', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'UPDATE messages SET unread = 0 WHERE recipientId = ? AND unread = 1;',
      [req.user.id]
    );
    res
      .status(200)
      .json({ result: 'success', affectedRows: rows.affectedRows });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

module.exports = router;
