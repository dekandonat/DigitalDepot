const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const User = require('../models/user');

const verifyAsync = promisify(jwt.verify);

router.post('/register', async (req, res) => {
  const authorizationHeader = req.headers['authorization'];
  const token = authorizationHeader && authorizationHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ result: 'fail', message: 'no token found' });
  }

  try {
    const decodedToken = await verifyAsync(token, process.env.SECRET);
    const role = decodedToken.role;

    if (role == 'admin') {
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
    } else {
      res
        .status(403)
        .json({ result: 'fail', message: 'not authorized action' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: 'fail', message: 'server error' });
  }
});

module.exports = router;
