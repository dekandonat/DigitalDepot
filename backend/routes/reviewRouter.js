const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const Review = require('../models/review');

const verifyAsync = promisify(jwt.verify);

router.get('/:productId', async (req, res) => {
    try {
        const reviews = await Review.fetchByProductId(req.params.productId);
        res.status(200).json({ result: 'success', data: reviews });
    } catch (err) {
        res.status(500).json({ result: 'fail', message: err.message });
    }
});

router.post('/', async (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    const token = authorizationHeader && authorizationHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ result: 'fail', message: 'no token found' });
    }

    try {
        const decodedToken = await verifyAsync(token, process.env.SECRET);
        const userId = decodedToken.id;
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