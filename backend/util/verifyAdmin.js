const express = require('express');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const verifyAsync = promisify(jwt.verify);

async function verifyAdmin(req, res, next) {
  const authorizationHeader = req.headers['authorization'];
  const token = authorizationHeader && authorizationHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ result: 'fail', message: 'no token found' });
  }

  try {
    const decodedToken = await verifyAsync(token, process.env.SECRET);

    if (decodedToken.role == 'admin') {
      req.user = decodedToken;
      next();
    } else {
      return res
        .status(403)
        .json({ result: 'fail', message: 'no authorization!' });
    }
  } catch (err) {
    return res.status(401).json({ result: 'fail', message: 'token error' });
  }
}

module.exports = verifyAdmin;
