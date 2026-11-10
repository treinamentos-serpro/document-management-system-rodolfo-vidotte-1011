const documentService = require('../services/documentService');

function getOwner(req) {
  return req.get('x-user-id')?.trim() || 'anonymous';
}

async function upload(req, res, next) {
  try {
    const document = await documentService.createDocument(req.file, getOwner(req));
    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    res.json(await documentService.listDocuments(getOwner(req)));
  } catch (error) {
    next(error);
  }
}

async function download(req, res, next) {
  try {
    const result = await documentService.findDocumentForDownload(req.params.id, getOwner(req));
    if (!result) {
      return res.status(404).json({ error: 'Documento não encontrado.' });
    }

    res.download(result.filePath, result.document.originalName, (error) => {
      if (error && !res.headersSent) {
        res.status(error.code === 'ENOENT' ? 404 : 500).json({
          error: error.code === 'ENOENT' ? 'Documento não encontrado.' : 'Falha ao baixar o documento.',
        });
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  upload,
  list,
  download,
};