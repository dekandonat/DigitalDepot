const express = require('express');
const router = express.Router();

const Review = require('../models/review');
const verifyToken = require('../util/tokenVerify');

router.get('/my-review/:productId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const numId = Number(req.params.productId);

    if (!Number.isInteger(numId) || numId <= 0) {
      return res.status(400).json({ result: 'fail', message: 'invalid id' });
    }

    const review = await Review.fetchUserReview(userId, numId);
    res.status(200).json({ result: 'success', data: review });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: err.message });
  }
});

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

    const alreadyReviewed = await Review.hasUserReviewed(userId, numId);
    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'Már értékelted ezt a terméket!' });
    }

    const review = new Review(userId, numId, rating, comment);
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

router.patch('/:reviewId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewId = Number(req.params.reviewId);
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ result: 'fail', message: 'missing fields' });
    }

    const result = await Review.update(reviewId, userId, rating, comment);
    if (result.result === 'success') {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: err.message });
  }
});

router.delete('/:reviewId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewId = Number(req.params.reviewId);

    const result = await Review.delete(reviewId, userId);
    if (result.result === 'success') {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: err.message });
  }
});

module.exports = router;