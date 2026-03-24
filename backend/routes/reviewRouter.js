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
        .json({ result: 'fail', message: 'Azonosítónak számnak kell lennie' });
    }

    const reviews = await Review.fetchByProductId(numId);
    res.status(200).json({ result: 'success', data: reviews });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'Szerver hiba' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'Hiányzó adatok' });
    }

    const numId = Number(productId);
    if (!Number.isInteger(numId) || numId <= 0) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'Azonosítónak számnak kell lennie' });
    }

    const numRating = Number(rating);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'Nem megfelelő értékelés' });
    }

    if (comment.trim().length < 1 || comment.length > 250) {
      return res.status(400).json({
        result: 'fail',
        message: 'A komment 1 és 250 karakter közötti hosszúságú lehet',
      });
    }

    const review = new Review(userId, productId, rating, comment);
    const result = await review.save();

    if (result.result === 'success') {
      res.status(201).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'Szerver hiba' });
  }
});

module.exports = router;
