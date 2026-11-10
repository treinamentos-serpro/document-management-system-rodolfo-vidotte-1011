const documentRepository = require('../repositories/documentRepository');

async function createDocument(file, owner) {
  if (!file) {
    const error = new Error('O arquivo é obrigatório.');
    error.statusCode = 400;
    throw error;
  }

  return documentRepository.save({
    id: file.filename,
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    storageName: file.filename,
  });
}

async function listDocuments(owner) {
  return documentRepository.findByOwner(owner).map(({ storageName, ...document }) => document);
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