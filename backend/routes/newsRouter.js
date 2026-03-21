const express = require('express');
const router = express.Router();

const News = require('../models/news');
const upload = require('../util/multer');

router.get('/', async (req, res) => {
  try {
    const response = await News.FetchAll();
    if (response.result == 'success') {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'server error' });
  }
});

module.exports = router;
