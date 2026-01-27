const express = require('express');
const router = express.Router();

const Review = require('../models/review');
const verifyToken = require('../util/tokenVerify');

router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.fetchByProductId(req.params.productId);
    res.status(200).json({ result: 'success', data: reviews });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: err.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, rating, comment } = req.body;

    const review = new Review(userId, productId, rating, comment);
    const result = await review.save();

    if (result.result === 'success') {
      res.status(201).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'server error' });
  }
});

module.exports = router;
