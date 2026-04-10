const express = require('express');
const router = express.Router();

const Coupon = require('../models/coupon');

router.post('/check', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ result: 'fail', message: 'hiányzó kód' });
    }
    const result = await Coupon.check(code);

    if (result.result == 'success') {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (err) {
    res.status(500).json({ result: 'fail', message: 'szerver hiba' });
  }
});

module.exports = router;
