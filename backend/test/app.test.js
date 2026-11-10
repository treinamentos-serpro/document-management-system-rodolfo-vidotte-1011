const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const path = require('node:path');
const app = require('../src/app');
const documentRepository = require('../src/repositories/documentRepository');
const { getMaxFileSize } = require('../src/config/upload');

// Teste de fumaça do seed: garante que o app Express foi exportado.
// Novos testes serão adicionados durante os Steps 2, 6 e 7 com auxílio do Copilot.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('valida o limite máximo de upload', () => {
  assert.strictEqual(getMaxFileSize(undefined), 10 * 1024 * 1024);
  assert.strictEqual(getMaxFileSize('2048'), 2048);
  for (const value of ['', '0', '-1', '1.5', 'Infinity', '9007199254740992']) {
    assert.throws(() => getMaxFileSize(value), /MAX_FILE_SIZE/);
  }
});

test('rejeita nomes de storage que não sejam UUIDs', () => {
  assert.throws(() => documentRepository.getStoragePath('../outside'), /Nome interno/);
});

test('envia, lista e baixa documentos somente para o usuário associado', async (t) => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  let uploadedId;

  t.after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    if (uploadedId) {
      await fs.rm(path.join(__dirname, '../storage', uploadedId), { force: true });
    }
  });

  const formData = new FormData();
  formData.append('file', new Blob(['conteudo do documento']), 'relatorio.txt');
  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'x-user-id': 'usuario-a' },
    body: formData,
  });

  assert.strictEqual(uploadResponse.status, 201);
  const document = await uploadResponse.json();
  uploadedId = document.id;
  assert.deepStrictEqual(Object.keys(document).sort(), [
    'id', 'originalName', 'owner', 'size', 'uploadedAt',
  ]);
  assert.strictEqual(document.originalName, 'relatorio.txt');
  assert.strictEqual(document.owner, 'usuario-a');

  const prefixedListResponse = await fetch(`${baseUrl}/api/documents`, {
    headers: { 'x-user-id': 'usuario-a' },
  });
  assert.deepStrictEqual(await prefixedListResponse.json(), [document]);

  const listResponse = await fetch(`${baseUrl}/documents`, {
    headers: { 'x-user-id': 'usuario-a' },
  });
  assert.deepStrictEqual(await listResponse.json(), [document]);

  const otherUserResponse = await fetch(`${baseUrl}/documents`, {
    headers: { 'x-user-id': 'usuario-b' },
  });
  assert.deepStrictEqual(await otherUserResponse.json(), []);

  const downloadResponse = await fetch(`${baseUrl}/documents/${uploadedId}/download`, {
    headers: { 'x-user-id': 'usuario-a' },
  });
  assert.strictEqual(downloadResponse.status, 200);
  assert.strictEqual(await downloadResponse.text(), 'conteudo do documento');

  const deniedDownloadResponse = await fetch(`${baseUrl}/documents/${uploadedId}/download`, {
    headers: { 'x-user-id': 'usuario-b' },
  });
  assert.strictEqual(deniedDownloadResponse.status, 404);

  const missingFileResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'x-user-id': 'usuario-a' },
  });
  assert.strictEqual(missingFileResponse.status, 400);
});
