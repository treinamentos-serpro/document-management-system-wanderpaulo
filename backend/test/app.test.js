const { test } = require('node:test');
const assert = require('node:assert');
const { once } = require('node:events');
const { mkdtemp, readdir, readFile, unlink, rm } = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

test('API de documentos', async (suite) => {
  const storageDir = await mkdtemp(path.join(os.tmpdir(), 'dms-test-'));
  const previousEnv = { ...process.env };
  process.env.DMS_STORAGE_DIR = storageDir;
  process.env.DMS_MAX_FILE_SIZE_BYTES = '32';
  process.env.DMS_USER_ID = 'test-user';
  const app = require('../src/app');
  const server = app.listen(0, '127.0.0.1');
  suite.after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
      server.closeAllConnections();
    });
    await rm(storageDir, { recursive: true, force: true });
    for (const key of ['DMS_STORAGE_DIR', 'DMS_MAX_FILE_SIZE_BYTES', 'DMS_USER_ID']) {
      if (previousEnv[key] === undefined) delete process.env[key];
      else process.env[key] = previousEnv[key];
    }
  });
  await once(server, 'listening');
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const upload = (content, name = 'document.txt', field = 'file') => {
    const form = new FormData();
    form.append(field, new Blob([content], { type: 'text/plain' }), name);
    form.append('owner', 'client-user');
    return fetch(`${baseUrl}/upload`, { method: 'POST', body: form });
  };
  let firstDocument;
  let secondDocument;

  await suite.test('exporta o app e preserva a rota de saúde', async () => {
    assert.ok(app, 'o app deve estar definido');
    assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
    const response = await fetch(`${baseUrl}/health`);
    assert.deepStrictEqual(await response.json(), { status: 'ok' });
  });

  await suite.test('lista inicialmente vazia', async () => {
    const response = await fetch(`${baseUrl}/documents`);
    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(await response.json(), []);
  });

  await suite.test('upload grava arquivo local e retorna somente metadados públicos', async () => {
    const response = await upload('conteudo do documento');
    assert.strictEqual(response.status, 201);
    firstDocument = await response.json();
    assert.deepStrictEqual(Object.keys(firstDocument).sort(),
      ['id', 'mimeType', 'originalName', 'owner', 'size', 'uploadedAt'].sort());
    assert.match(firstDocument.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    assert.strictEqual(firstDocument.originalName, 'document.txt');
    assert.strictEqual(firstDocument.size, Buffer.byteLength('conteudo do documento'));
    assert.strictEqual(firstDocument.owner, 'test-user');
    assert.strictEqual(firstDocument.mimeType, 'text/plain');
    assert.strictEqual(new Date(firstDocument.uploadedAt).toISOString(), firstDocument.uploadedAt);
    const files = await readdir(storageDir);
    assert.strictEqual(files.length, 1);
    assert.notStrictEqual(files[0], firstDocument.originalName);
    assert.strictEqual(await readFile(path.join(storageDir, files[0]), 'utf8'), 'conteudo do documento');
  });

  await suite.test('lista os documentos do mais recente para o mais antigo', async () => {
    const response = await upload('segundo', 'second.txt');
    assert.strictEqual(response.status, 201);
    secondDocument = await response.json();
    const listing = await fetch(`${baseUrl}/documents`);
    assert.deepStrictEqual(await listing.json(), [secondDocument, firstDocument]);
  });

  await suite.test('download preserva conteúdo e nome original', async () => {
    const response = await fetch(`${baseUrl}/documents/${firstDocument.id}/download`);
    assert.strictEqual(response.status, 200);
    assert.match(response.headers.get('content-disposition'), /attachment;.*document\.txt/);
    assert.strictEqual(await response.text(), 'conteudo do documento');
  });

  await suite.test('rejeita upload sem arquivo', async () => {
    const response = await fetch(`${baseUrl}/upload`, { method: 'POST' });
    assert.strictEqual(response.status, 400);
    assert.strictEqual((await response.json()).error.code, 'FILE_REQUIRED');
  });

  await suite.test('rejeita arquivo acima do limite sem deixar arquivo parcial', async () => {
    const filesBefore = await readdir(storageDir);
    const response = await upload('x'.repeat(33));
    assert.strictEqual(response.status, 413);
    assert.deepStrictEqual(await response.json(), {
      error: { code: 'FILE_TOO_LARGE', message: 'O arquivo excede o tamanho máximo permitido.' },
    });
    assert.deepStrictEqual(await readdir(storageDir), filesBefore);
  });

  await suite.test('rejeita campo de arquivo inesperado', async () => {
    const response = await upload('conteudo', 'document.txt', 'unexpected');
    assert.strictEqual(response.status, 400);
    assert.strictEqual((await response.json()).error.code, 'INVALID_UPLOAD');
  });

  await suite.test('download desconhecido retorna erro público 404', async () => {
    const response = await fetch(`${baseUrl}/documents/unknown/download`);
    assert.strictEqual(response.status, 404);
    assert.deepStrictEqual(await response.json(), {
      error: { code: 'DOCUMENT_NOT_FOUND', message: 'Documento não encontrado.' },
    });
  });

  await suite.test('arquivo removido do disco retorna 404 sem expor caminhos', async () => {
    for (const filename of await readdir(storageDir)) await unlink(path.join(storageDir, filename));
    const response = await fetch(`${baseUrl}/documents/${firstDocument.id}/download`);
    assert.strictEqual(response.status, 404);
    assert.deepStrictEqual(await response.json(), {
      error: { code: 'DOCUMENT_NOT_FOUND', message: 'Documento não encontrado.' },
    });
  });
});
