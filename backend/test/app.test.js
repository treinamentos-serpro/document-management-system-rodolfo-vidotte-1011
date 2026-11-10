const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const app = require('../src/app');

// Teste de fumaça do seed: garante que o app Express foi exportado.
// Novos testes serão adicionados durante os Steps 2, 6 e 7 com auxílio do Copilot.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('faz upload, lista e baixa documentos do usuário', async (t) => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const owner = `test-${randomUUID()}`;
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
  formData.append('file', new Blob(['conteudo de teste']), 'documento.txt');
  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'x-user-id': owner },
    body: formData,
  });

  assert.strictEqual(uploadResponse.status, 201);
  const document = await uploadResponse.json();
  uploadedId = document.id;
  assert.strictEqual(document.originalName, 'documento.txt');
  assert.strictEqual(document.owner, owner);
  assert.strictEqual(document.size, Buffer.byteLength('conteudo de teste'));
  assert.ok(Number.isFinite(Date.parse(document.uploadedAt)));

  const listResponse = await fetch(`${baseUrl}/documents`, {
    headers: { 'x-user-id': owner },
  });
  assert.strictEqual(listResponse.status, 200);
  assert.deepStrictEqual(await listResponse.json(), [document]);

  const otherOwnerResponse = await fetch(`${baseUrl}/documents`, {
    headers: { 'x-user-id': `${owner}-other` },
  });
  assert.deepStrictEqual(await otherOwnerResponse.json(), []);

  const downloadResponse = await fetch(`${baseUrl}/documents/${uploadedId}/download`, {
    headers: { 'x-user-id': owner },
  });
  assert.strictEqual(downloadResponse.status, 200);
  assert.strictEqual(await downloadResponse.text(), 'conteudo de teste');

  const missingDocumentResponse = await fetch(`${baseUrl}/documents/${randomUUID()}/download`, {
    headers: { 'x-user-id': owner },
  });
  assert.strictEqual(missingDocumentResponse.status, 404);
});
