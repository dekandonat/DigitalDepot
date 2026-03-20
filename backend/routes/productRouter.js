const express = require('express');
const router = express.Router();

const Products = require('../models/products');
const upload = require('../util/multer');

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ result: 'fail', message: 'missing file' });
    }

    const img = `uploads/products/${req.file.filename}`;

    const priceNum = Number(req.body.prodPrice);
    const cateogryNum = Number(req.body.categoryId);

    if (!Number.isInteger(priceNum)) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'price must be a number' });
    }

    if (!Number.isInteger(cateogryNum)) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'invalid category' });
    }

    if (
      req.body.prodName.trim() === '' ||
      req.body.prodDescription.trim() === '' ||
      priceNum <= 0 ||
      cateogryNum <= 0
    ) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'missing parameters' });
    }

    const product = new Products(
      req.body.prodName,
      req.body.prodDescription,
      priceNum,
      img,
      cateogryNum
    );
    const result = await product.save();
    if (result.result === 'success') {
      res.status(201).json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (err) {
    return res.status(400).json({ result: 'fail', message: 'invalid input' });
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
