const fs = require('fs');
const sharp = require('sharp');

const validateImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ result: 'fail', message: 'missing file' });
    }

    await sharp(req.file.path).metadata();

    next();
  } catch (err) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    return res.status(400).json({
      result: 'fail',
      message: 'Nem megfelelő kép formátum',
    });
  }
};

module.exports = validateImage;
