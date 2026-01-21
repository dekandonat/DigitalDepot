const express = require('express');
const router = express.Router();

const Products = require('../models/products');
const upload = require('../util/multer');

router.post('/', upload.single('file'), async (req, res) => {
  const img = `uploads/products/${req.file.filename}`;

  const product = new Products(
    req.body.prodName,
    req.body.prodDescription,
    req.body.prodPrice,
    img,
    req.body.categoryId
  );
  const result = await product.save();
  if (result.result === 'success') {
    res.status(201).json(result);
  } else {
    res.status(500).json(result);
  }
});

router.patch('/:prodId', async (req, res) => {
  const id = req.params.prodId;
  const { prodName, prodDescription, prodPrice } = req.body;

  try {
    const result = await Products.update(
      id,
      prodName,
      prodDescription,
      prodPrice
    );
    if (result.result === 'success') {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: err.message });
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

router.get('/search/:string', async (req, res) => {
  try {
    const string = req.params.string;
    const results = await Products.find(string);
    res.status(200).json({ result: 'success', data: results });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'server error' });
  }
});

router.patch('/addInventory', async (req, res) => {
  try {
    const { id, quantity } = req.body;
    const result = await Products.addInventory(id, quantity);

    if (result.result == 'success') {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ result: 'fail', message: 'server error' });
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
