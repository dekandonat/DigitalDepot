const fs = require('fs/promises');
const sharp = require('sharp');

const processImage = (width, height) => {
  return async (req, res, next) => {
    if (!req.file) {
      return next();
    }

    const originalPath = req.file.path;
    const tempPath = `${originalPath}_tmp`;

    try {
      await sharp(originalPath)
        .resize(width, height, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .toFile(tempPath);

      await fs.rename(tempPath, originalPath);
      next();
    } catch (err) {
      try {
        await fs.unlink(originalPath);
      } catch (e) {
        console.log('Hiba a kép eltávolítása közben: ' + originalPath);
      }
      try {
        await fs.unlink(tempPath);
      } catch (e) {
        console.log('Hiba a kép eltávolítása közben: ' + tempPath);
      }

      return res
        .status(500)
        .json({ result: 'fail', message: 'Hiba a kép feldolgozása közben' });
    }
  };
};

module.exports = processImage;
