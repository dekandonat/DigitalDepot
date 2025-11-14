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

module.exports = router;
