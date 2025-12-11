const express = require('express');
const router = express.Router();
const db = require('../util/database');
const Products = require('../models/products');

router.post('/', async (req, res) => {
  const product = new Products(
    req.body.prodName,
    req.body.prodDescription,
    req.body.prodPrice,
    req.body.prodImg
  );
  const result = await product.save();
  if (result.result === 'success') {
    res.status(201).json(result);
  } else {
    res.status(500).json(result);
  }
});

router.get('/:prodId', async (req, res) => {
  const id = req.params.prodId;
  
  if(id === 'search') return; 

  try {
    const data = await Products.fetch(id);
    if (data.length > 0) {
      res.status(200).json({ result: 'success', data: data });
    } else {
      res.status(404).json({ result: 'fail', message: 'no product with this id' });
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const searchWord = req.query.search;
    
    let query = 'SELECT * FROM products';
    
    if (searchWord) {
      query += ` WHERE productName LIKE '%${searchWord}%' OR productDescription LIKE '%${searchWord}%'`;
    }

    const [rows] = await db.execute(query);

    if (rows.length > 0) {
      res.status(200).json({ result: 'success', data: rows });
    } else {
      res.status(200).json({ result: 'success', data: [] });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: 'fail', message: err.message });
  }
});

module.exports = router;