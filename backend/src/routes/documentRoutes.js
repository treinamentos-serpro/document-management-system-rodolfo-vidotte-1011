const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const multer = require('multer');
const documentController = require('../controllers/documentController');

const router = express.Router();
const storageDirectory = path.resolve(__dirname, '../../storage');
const storage = multer.diskStorage({
  destination(req, file, callback) {
    fs.mkdir(storageDirectory, { recursive: true }, (error) => {
      callback(error, storageDirectory);
    });
  },
  filename(req, file, callback) {
    callback(null, crypto.randomUUID());
  },
});
const maxFileSize = Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024);
const upload = multer({
  storage,
  limits: { fileSize: maxFileSize },
});

router.post('/upload', upload.single('file'), documentController.upload);
router.get('/documents', documentController.list);
router.get('/documents/:id/download', documentController.download);

router.use((error, req, res, next) => {
  if (!(error instanceof multer.MulterError)) {
    return next(error);
  }

  const statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
  res.status(statusCode).json({ error: 'Não foi possível processar o arquivo enviado.' });
});

module.exports = router;