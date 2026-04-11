const express = require('express');
const router = express.Router();

const Products = require('../models/products');

router.get('/category/:categoryId', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const idNum = Number(categoryId);

    if (!Number.isInteger(idNum) || idNum <= 0) {
      return res.status(400).json({ result: 'fail', message: 'Azonosítónak számnak kell lennie' });
    }

    const data = await Products.fetchByCategory(idNum);
    res.status(200).json({ result: 'success', data: data });
  } catch (err) {
    console.error("Backend hiba a kategória lekérdezésekor:", err);
    res.status(500).json({ result: 'fail', message: 'Szerver hiba' });
  }
});

router.get('/search/:string', async (req, res) => {
  try {
    const string = req.params.string;
    const results = await Products.find(string);
    res.status(200).json({ result: 'success', data: results });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'Szerver hiba' });
  }
});

router.get('/:prodId', async (req, res) => {
  try {
    const id = req.params.prodId;

    const idNum = Number(id);

    if (!Number.isInteger(idNum) || idNum <= 0) {
      return res
        .status(400)
        .json({ result: 'fail', message: 'Azonosítónak számnak kell lennie' });
    }

    const data = await Products.fetch(idNum);
    if (data.length > 0) {
      res.status(200).json({ result: 'success', data: data[0] });
    } else {
      res.status(404).json({
        result: 'fail',
        message: 'Nincs termék ezzel az azonosítóval',
      });
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'Szerver hiba' });
  }
});

router.get('/', async (req, res) => {
  try {
    const data = await Products.fetchAll();
    res.status(200).json({ result: 'success', data: data });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'Szerver hiba' });
  }
});

module.exports = router;