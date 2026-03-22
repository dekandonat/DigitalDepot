const upload = require('./multer');
const newsUpload = require('./multer2');

const uploadMiddleware = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        result: 'fail',
        message: err.message,
      });
    }
    next();
  });
};

const uploadNewsMiddleware = (req, res, next) => {
  newsUpload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        result: 'fail',
        message: err.message,
      });
    }
    next();
  });
};

module.exports = { uploadMiddleware, uploadNewsMiddleware };
