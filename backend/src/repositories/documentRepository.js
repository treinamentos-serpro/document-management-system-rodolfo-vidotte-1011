const path = require('node:path');
const { storageDirectory } = require('../config/storage');

const documents = new Map();
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function save(document) {
  documents.set(document.id, document);
  return document;
}

function findByOwner(owner) {
  return Array.from(documents.values()).filter((document) => document.owner === owner);
}

function findByIdAndOwner(id, owner) {
  const document = documents.get(id);
  return document?.owner === owner ? document : null;
}

function getStoragePath(storageName) {
  if (!uuidPattern.test(storageName)) {
    throw new TypeError('Nome interno de arquivo inválido.');
  }

  const filePath = path.resolve(storageDirectory, storageName);
  const relativePath = path.relative(storageDirectory, filePath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new TypeError('Caminho de arquivo fora do diretório de armazenamento.');
  }

  return filePath;
}

module.exports = {
  save,
  findByOwner,
  findByIdAndOwner,
  getStoragePath,
};