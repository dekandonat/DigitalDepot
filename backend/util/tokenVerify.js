const express = require('express');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const verifyAsync = promisify(jwt.verify);

async function tokenVerify(req, res, next) {
  const authorizationHeader = req.headers['authorization'];
  const token = authorizationHeader && authorizationHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ result: 'fail', message: 'no token found' });
  }

  try {
    const decodedToken = await verifyAsync(token, process.env.SECRET);
    req.user = decodedToken;
    next();
  } catch (err) {
    return res.status(401).json({ result: 'fail', message: 'token error' });
  }
}

module.exports = tokenVerify;
