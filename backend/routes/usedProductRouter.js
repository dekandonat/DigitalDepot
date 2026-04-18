const express = require('express');
const router = express.Router();
const UsedProduct = require('../models/usedProduct');
const db = require('../util/database');
const upload = require('../util/multer');
const verifyAdmin = require('../util/verifyAdmin');

router.post('/submit', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ result: 'fail', message: 'Kép feltöltése kötelező!' });
  }

  try {
    const userId = req.user.id;
    const { productName, productDescription, conditionState } = req.body;

    if (!productName || typeof productName !== 'string' || productName.trim() === '' ||
        !productDescription || typeof productDescription !== 'string' || productDescription.trim() === '' ||
        !conditionState || typeof conditionState !== 'string') {
      return res.status(400).json({ result: 'fail', message: 'Hiányzó vagy érvénytelen adatok' });
    }

    const [userRows] = await db.execute(
      'SELECT bankAccountNumber FROM users WHERE userId = ?',
      [userId]
    );
    
    if (userRows.length == 0 || !userRows[0].bankAccountNumber) {
      return res.status(400).json({ result: 'fail', message: 'Bank account number missing!' });
    }

    const img = `uploads/products/${req.file.filename}`;

    const usedProduct = new UsedProduct(
      userId,
      productName.trim(),
      productDescription.trim(),
      conditionState,
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
  try {
    const rows = await UsedProduct.fetchByUserId(req.user.id);
    res.status(200).json({ result: 'success', data: rows });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: err.message });
  }
});

router.get('/admin/all', verifyAdmin, async (req, res) => {
  try {
    const rows = await UsedProduct.fetchAll();
    res.status(200).json({ result: 'success', data: rows });
  } catch (err) {
    res.status(500).json({ result: 'fail', message: err.message });
  }
});

router.patch('/admin/status', verifyAdmin, async (req, res) => {
  try {
    const { submissionId, status, offerPrice } = req.body;
    
    const subIdNum = Number(submissionId);
    if (!Number.isInteger(subIdNum) || subIdNum <= 0) {
      return res.status(400).json({ result: 'fail', message: 'Érvénytelen azonosító' });
    }

    if (!status || typeof status !== 'string') {
      return res.status(400).json({ result: 'fail', message: 'Érvénytelen státusz' });
    }

    let parsedOfferPrice = null;
    if (offerPrice !== undefined && offerPrice !== null && offerPrice !== '') {
      parsedOfferPrice = Number(offerPrice);
      if (isNaN(parsedOfferPrice) || parsedOfferPrice < 0) {
        return res.status(400).json({ result: 'fail', message: 'Érvénytelen ár' });
      }
    }

    const result = await UsedProduct.updateStatus(
      subIdNum,
      status,
      parsedOfferPrice
    );

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
  try {
    const { submissionId, decision } = req.body;
    
    const subIdNum = Number(submissionId);
    if (!Number.isInteger(subIdNum) || subIdNum <= 0 || !decision || typeof decision !== 'string') {
      return res.status(400).json({ result: 'fail', message: 'Érvénytelen vagy hiányzó adat' });
    }

    const result = await UsedProduct.userRespondToOffer(subIdNum, decision);

    if (result.result == 'success') {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: err.message });
  }
});

router.post('/admin/list-product', verifyAdmin, upload.single('file'), async (req, res) => {
  try {
    const {
      submissionId,
      productName,
      productDescription,
      productPrice,
      categoryId,
      conditionState,
      existingImage,
      newMainCategory,
      newSubCategory,
      selectedMainCat
    } = req.body;

    const subIdNum = Number(submissionId);
    const priceNum = Number(productPrice);

    if (!Number.isInteger(subIdNum) || subIdNum <= 0 || isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ result: 'fail', message: 'Érvénytelen szám adatok' });
    }

    if (!productName || !productDescription) {
      return res.status(400).json({ result: 'fail', message: 'Hiányzó adatok' });
    }

    let finalImage = existingImage;
    if (req.file) {
      finalImage = `uploads/products/${req.file.filename}`;
    }

    if (!finalImage || typeof finalImage !== 'string') {
      return res.status(400).json({
        result: 'fail',
        message: 'Hiányzó termékkép! Kérlek tölts fel egyet.',
      });
    }

    let finalCategoryId = Number(categoryId);

    if (newMainCategory && typeof newMainCategory === 'string' && newMainCategory.trim() !== '') {
      const [mainResult] = await db.execute(
        'INSERT INTO categories (categoryName, parentId) VALUES (?, NULL)',
        [newMainCategory.trim()]
      );
      finalCategoryId = mainResult.insertId;

      if (newSubCategory && typeof newSubCategory === 'string' && newSubCategory.trim() !== '') {
        const [subResult] = await db.execute(
          'INSERT INTO categories (categoryName, parentId) VALUES (?, ?)',
          [newSubCategory.trim(), finalCategoryId]
        );
        finalCategoryId = subResult.insertId;
      }
    } else if (newSubCategory && typeof newSubCategory === 'string' && newSubCategory.trim() !== '') {
      const selMainCatNum = Number(selectedMainCat);
      if (!Number.isInteger(selMainCatNum) || selMainCatNum <= 0) {
          return res.status(400).json({ result: 'fail', message: 'Érvénytelen főkategória azonosító' });
      }
      const [subResult] = await db.execute(
        'INSERT INTO categories (categoryName, parentId) VALUES (?, ?)',
        [newSubCategory.trim(), selMainCatNum]
      );
      finalCategoryId = subResult.insertId;
    }

    const productData = {
      productName: productName.trim(),
      productDescription: productDescription.trim(),
      productPrice: priceNum,
      productImg: finalImage,
      categoryId: finalCategoryId,
      conditionState,
    };

    const result = await UsedProduct.publishToShop(subIdNum, productData);

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