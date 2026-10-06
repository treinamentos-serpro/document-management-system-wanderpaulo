const multer = require('multer');
const documentService = require('../services/documentService');

const maxFileSize = Number(process.env.DMS_MAX_FILE_SIZE_BYTES || 10 * 1024 * 1024);
if (!Number.isSafeInteger(maxFileSize) || maxFileSize <= 0) {
  throw new Error('DMS_MAX_FILE_SIZE_BYTES deve ser um inteiro positivo.');
}

const uploadFile = multer({
  storage: documentService.createUploadStorage(),
  limits: { fileSize: maxFileSize },
}).single('file');

function sendNotFound(res) {
  return res.status(404).json({
    error: { code: 'DOCUMENT_NOT_FOUND', message: 'Documento não encontrado.' },
  });
}

function uploadDocument(req, res) {
  if (!req.file) {
    return res.status(400).json({
      error: { code: 'FILE_REQUIRED', message: 'Envie um arquivo no campo file.' },
    });
  }
  return res.status(201).json(documentService.createDocument(req.file));
}

function listDocuments(req, res) {
  return res.json(documentService.listDocuments());
}

function downloadDocument(req, res, next) {
  const download = documentService.getDownload(req.params.id);
  if (!download) return sendNotFound(res);

  return res.download(download.filePath, download.originalName, (error) => {
    if (!error) return;
    if (res.headersSent) return next(error);
    if (error.code === 'ENOENT' || error.status === 404) return sendNotFound(res);
    return next(error);
  });
}

function handleError(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: { code: 'FILE_TOO_LARGE', message: 'O arquivo excede o tamanho máximo permitido.' },
    });
  }
  if (error.name === 'MulterError' || (req.path === '/upload' && error.message === 'Unexpected end of form')) {
    return res.status(400).json({
      error: { code: 'INVALID_UPLOAD', message: 'O envio do arquivo é inválido.' },
    });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { code: 'INVALID_REQUEST', message: 'O corpo da requisição é inválido.' },
    });
  }
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Não foi possível concluir a operação.' },
  });
}

module.exports = { uploadFile, uploadDocument, listDocuments, downloadDocument, handleError };