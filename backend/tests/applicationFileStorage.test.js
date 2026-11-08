const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const test = require('node:test');
const {
  getPrivateCvPath,
  removePrivateCv,
  removePublicInternshipFile,
  savePrivateCv,
  savePublicInternshipFile,
} = require('../services/applicationFileStorage');

test('stores public internship assets with generated safe URLs', async () => {
  const file = {
    mimetype: 'image/png',
    originalname: 'company logo.png',
    buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  };
  const url = await savePublicInternshipFile(file);
  try {
    assert.match(url, /^\/uploads\/internships\/[a-f\d-]{36}\.png$/i);
  } finally {
    await removePublicInternshipFile(url);
  }
});

test('keeps CVs outside the public directory and only accepts signed PDFs', async () => {
  const key = await savePrivateCv({
    mimetype: 'application/pdf',
    originalname: 'cv.pdf',
    buffer: Buffer.from('%PDF-1.7\n'),
  });
  try {
    const filePath = getPrivateCvPath(key);
    assert.match(filePath, /private_uploads/i);
    await fs.access(filePath);
    assert.throws(() => getPrivateCvPath('../secret.pdf'), /Invalid CV storage key/);
    await assert.rejects(savePrivateCv({
      mimetype: 'application/pdf',
      originalname: 'fake.pdf',
      buffer: Buffer.from('not a PDF'),
    }), /valid PDF/);
  } finally {
    await removePrivateCv(key);
  }
});
