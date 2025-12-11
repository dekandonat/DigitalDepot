const express = require('express');
const router = express.Router();

const Products = require('../models/products');

router.post('/', async (req, res) => {
  const product = new Products(
    req.body.prodName,
    req.body.prodDescription,
    req.body.prodPrice,
    req.body.prodImg
  );
  const result = await product.save();
  if (result.message === 'success') {
    res.status(201).json(result);
  } else {
    res.status(500).json(result);
  }
});

router.get('/:prodId', async (req, res) => {
  const id = req.params.prodId;
  try {
    const data = await Products.fetch(id);
    if (data.length > 0) {
      res.status(200).json({ result: 'success', data: data });
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
    res.status(500).json({ result: 'fail', message: err.message });
  }
});

module.exports = router;
