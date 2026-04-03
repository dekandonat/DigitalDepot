const express = require('express');
const router = express.Router();

const News = require('../models/news');

router.get('/', async (req, res) => {
  try {
    const response = await News.FetchAll();
    if (response.result == 'success') {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

module.exports = router;
