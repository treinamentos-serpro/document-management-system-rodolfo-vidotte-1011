const path = require('node:path');

const documents = new Map();
const storageDirectory = path.resolve(__dirname, '../../storage');

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
  return path.join(storageDirectory, storageName);
}

module.exports = {
  save,
  findByOwner,
  findByIdAndOwner,
  getStoragePath,
};