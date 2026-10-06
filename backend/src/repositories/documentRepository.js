const { randomUUID } = require('node:crypto');
const { mkdirSync } = require('node:fs');
const path = require('node:path');
const multer = require('multer');

const storageDir = path.resolve(process.env.DMS_STORAGE_DIR || path.join(__dirname, '../../storage'));
const documents = new Map();

mkdirSync(storageDir, { recursive: true });

function createUploadStorage() {
  return multer.diskStorage({
    destination: storageDir,
    filename(req, file, callback) {
      callback(null, randomUUID());
    },
  });
}

function save(document) {
  documents.set(document.id, document);
  return document;
}

function findByOwner(owner) {
  return Array.from(documents.values())
    .filter((document) => document.owner === owner)
    .reverse();
}

function findById(id) {
  return documents.get(id);
}

function getFilePath(document) {
  return path.join(storageDir, document.storageName);
}

module.exports = { createUploadStorage, save, findByOwner, findById, getFilePath };