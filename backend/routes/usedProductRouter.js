const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const UsedProduct = require('../models/usedProduct');
const db = require('../util/database');
const upload = require('../util/multer');

const verifyAsync = promisify(jwt.verify);

router.post('/submit', upload.single('file'), async (req, res) => {
  const authorizationHeader = req.headers['authorization'];
  const token = authorizationHeader && authorizationHeader.split(' ')[1];

  if (!token) return res.status(401).json({ result: 'fail', message: 'no token found' });

  if (!req.file) {
      return res.status(400).json({ result: 'fail', message: 'Kép feltöltése kötelező!' });
  }

  try {
    const decodedToken = await verifyAsync(token, process.env.SECRET);
    const userId = decodedToken.id;

    const [userRows] = await db.execute('SELECT bankAccountNumber FROM users WHERE userId = ?', [userId]);
    if (userRows.length == 0 || !userRows[0].bankAccountNumber) {
        return res.status(400).json({ result: 'fail', message: 'Bank account number missing!' });
    }
    
    const img = `uploads/products/${req.file.filename}`;

    const usedProduct = new UsedProduct(
      userId,
      req.body.productName,
      req.body.productDescription,
      req.body.conditionState,
      img
    );

    const result = await usedProduct.save();
    if (result.result == 'success') {
      res.status(201).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: err.message });
  }
});

router.get('/my-submissions', async (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    const token = authorizationHeader && authorizationHeader.split(' ')[1];
  
    if (!token) return res.status(401).json({ result: 'fail', message: 'no token' });
  
    try {
      const decodedToken = await verifyAsync(token, process.env.SECRET);
      const rows = await UsedProduct.fetchByUserId(decodedToken.id);
      res.status(200).json({ result: 'success', data: rows });
    } catch (err) {
      res.status(500).json({ result: 'fail', message: err.message });
    }
  });

router.get('/admin/all', async (req, res) => {
  const authorizationHeader = req.headers['authorization'];
  const token = authorizationHeader && authorizationHeader.split(' ')[1];

  if (!token) return res.status(401).json({ result: 'fail' });

  try {
    const decodedToken = await verifyAsync(token, process.env.SECRET);
    if (decodedToken.role != 'admin' && decodedToken.role != 'owner') return res.status(403).json({ result: 'fail' });

    const rows = await UsedProduct.fetchAll();
    res.status(200).json({ result: 'success', data: rows });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: err.message });
  }
});

router.patch('/admin/status', async (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    const token = authorizationHeader && authorizationHeader.split(' ')[1];
  
    if (!token) return res.status(401).json({ result: 'fail' });
  
    try {
      const decodedToken = await verifyAsync(token, process.env.SECRET);
      if (decodedToken.role != 'admin' && decodedToken.role != 'owner') return res.status(403).json({ result: 'fail' });
  
      const { submissionId, status, offerPrice } = req.body;
      const result = await UsedProduct.updateStatus(submissionId, status, offerPrice);
      
      if (result.result == 'success') {
        res.status(200).json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (err) {
      res.status(500).json({ result: 'fail', message: err.message });
    }
  });

router.patch('/user-response', async (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    const token = authorizationHeader && authorizationHeader.split(' ')[1];

    if (!token) return res.status(401).json({ result: 'fail' });

    try {
        const decodedToken = await verifyAsync(token, process.env.SECRET);
        const { submissionId, decision } = req.body; 

        const result = await UsedProduct.userRespondToOffer(submissionId, decision);
        
        if (result.result == 'success') {
            res.status(200).json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (err) {
        res.status(500).json({ result: 'fail', message: err.message });
    }
  });

router.post('/admin/list-product', upload.single('file'), async (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    const token = authorizationHeader && authorizationHeader.split(' ')[1];
  
    if (!token) return res.status(401).json({ result: 'fail' });
  
    try {
      const decodedToken = await verifyAsync(token, process.env.SECRET);
      if (decodedToken.role != 'admin' && decodedToken.role != 'owner') return res.status(403).json({ result: 'fail' });
  
      const { submissionId, productName, productDescription, productPrice, categoryId, conditionState, existingImage } = req.body;
      
      let finalImage = existingImage;
      if (req.file) {
          finalImage = `uploads/products/${req.file.filename}`;
      }

      if (!finalImage) {
          return res.status(400).json({ result: 'fail', message: 'Hiányzó termékkép! Kérlek tölts fel egyet.' });
      }

      const productData = {
          productName,
          productDescription,
          productPrice,
          productImg: finalImage,
          categoryId,
          conditionState
      };

      const result = await UsedProduct.publishToShop(submissionId, productData);
      
      if (result.result == 'success') {
        res.status(200).json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (err) {
      res.status(500).json({ result: 'fail', message: err.message });
    }
  });

module.exports = router;