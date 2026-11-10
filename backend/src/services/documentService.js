const documentRepository = require('../repositories/documentRepository');

function toPublicDocument(document) {
  const { storageName, ...publicDocument } = document;
  return publicDocument;
}

async function createDocument(file, owner) {
  if (!file) {
    const error = new Error('O arquivo é obrigatório.');
    error.statusCode = 400;
    throw error;
  }

  const document = documentRepository.save({
    id: file.filename,
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    storageName: file.filename,
  });
  return toPublicDocument(document);
}

async function listDocuments(owner) {
  return documentRepository.findByOwner(owner).map(toPublicDocument);
}

async function findDocumentForDownload(id, owner) {
  const document = documentRepository.findByIdAndOwner(id, owner);
  if (!document) {
    return null;
  }

  return {
    document,
    filePath: documentRepository.getStoragePath(document.storageName),
  };
}

module.exports = {
  createDocument,
  listDocuments,
  findDocumentForDownload,
};