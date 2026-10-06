const { randomUUID } = require('node:crypto');
const documentRepository = require('../repositories/documentRepository');

const owner = process.env.DMS_USER_ID || 'local-user';

function createUploadStorage() {
  return documentRepository.createUploadStorage();
}

function toPublicMetadata(document) {
  const { id, originalName, size, uploadedAt, owner, mimeType } = document;
  return { id, originalName, size, uploadedAt, owner, mimeType };
}

function createDocument(file) {
  const document = documentRepository.save({
    id: randomUUID(),
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    mimeType: file.mimetype || 'application/octet-stream',
    storageName: file.filename,
  });
  return toPublicMetadata(document);
}

function listDocuments() {
  return documentRepository.findByOwner(owner).map(toPublicMetadata);
}

function getDownload(id) {
  const document = documentRepository.findById(id);
  if (!document || document.owner !== owner) return null;
  return {
    filePath: documentRepository.getFilePath(document),
    originalName: document.originalName,
  };
}

module.exports = { createUploadStorage, createDocument, listDocuments, getDownload };