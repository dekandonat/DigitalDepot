const express = require('express');
const router = express.Router();

const Review = require('../models/review');
const verifyToken = require('../util/tokenVerify');

router.get('/:productId', async (req, res) => {
  try {
    const numId = Number(req.params.productId);

    if (!Number.isInteger(numId) || numId <= 0) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'id must be a number' });
    }

    const reviews = await Review.fetchByProductId(numId);
    res.status(200).json({ result: 'success', data: reviews });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: err.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    console.log(req.cookies);
    const userId = req.user.id;
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'missing fields' });
    }

    const numId = Number(productId);
    if (!Number.isInteger(numId) || numId <= 0) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'id must be a number' });
    }

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
