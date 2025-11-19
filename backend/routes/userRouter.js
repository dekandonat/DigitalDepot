const express = require('express');

const User = require('../models/user');

const router = express.Router();

router.post('/register', async (req, res) => {
  const user = new User(req.body.userName, req.body.password, req.body.email);
  const result = await user.register();
  if (result.message == 'success') {
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

module.exports = router;
