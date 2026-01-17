const express = require('express');

const User = require('../models/user');

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
      res.status(200).json(userData);
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

module.exports = router;
