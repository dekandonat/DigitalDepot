const express = require('express');
const router = express.Router();

const Products = require('../models/products');

router.get('/search/:string', async (req, res) => {
  try {
    const string = req.params.string;
    const results = await Products.find(string);
    res.status(200).json({ result: 'success', data: results });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'server error' });
  }
});

router.get('/:prodId', async (req, res) => {
  const id = req.params.prodId;

  const idNum = Number(id);

  if (!Number.isInteger(idNum)) {
    return res
      .status(400)
      .json({ result: 'fail', message: 'id must be a number' });
  }

  try {
    const data = await Products.fetch(idNum);
    if (data.length > 0) {
      res.status(200).json({ result: 'success', data: data[0] });
    } else {
      res
        .status(404)
        .json({ result: 'fail', message: 'no product with this id' });
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const data = await Products.fetchAll();
    if (data.length > 0) {
      res.status(200).json({ result: 'success', data: data });
    } else {
      res.status(200).json({ result: 'success', data: [] });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: 'fail', message: 'Server error' });
  }
});

module.exports = router;
