const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');

const uploadDirectory = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');
const privateUploadDirectory = process.env.PRIVATE_UPLOADS_DIR || path.join(__dirname, '../private_uploads');
const publicDirectory = path.join(uploadDirectory, 'internships');
const privateDirectory = path.join(privateUploadDirectory, 'application_cvs');

const publicExtensions = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

function hasExpectedSignature(file) {
  const buffer = file.buffer;
  if (file.mimetype === 'application/pdf') return buffer.subarray(0, 5).toString() === '%PDF-';
  if (file.mimetype === 'image/png') return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (file.mimetype === 'image/jpeg') return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (file.mimetype === 'image/webp') {
    return buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP';
  }
  return false;
}

async function savePublicInternshipFile(file) {
  if (!publicExtensions[file.mimetype] || !hasExpectedSignature(file)) {
    throw new Error('Uploaded file content does not match its file type');
  }
  await fs.mkdir(publicDirectory, { recursive: true });
  const fileName = `${randomUUID()}${publicExtensions[file.mimetype]}`;
  await fs.writeFile(path.join(publicDirectory, fileName), file.buffer, { flag: 'wx' });
  return `/uploads/internships/${fileName}`;
}

async function removePublicInternshipFile(url) {
  const match = /^\/uploads\/internships\/([\da-f-]{36}\.(?:jpg|png|webp|pdf))$/i.exec(url || '');
  if (!match) return;
  await fs.rm(path.join(publicDirectory, match[1]), { force: true });
}

async function savePrivateCv(file) {
  if (file.mimetype !== 'application/pdf' || !hasExpectedSignature(file)) {
    throw new Error('CV must be a valid PDF file');
  }
  await fs.mkdir(privateDirectory, { recursive: true });
  const storageKey = `${randomUUID()}.pdf`;
  await fs.writeFile(path.join(privateDirectory, storageKey), file.buffer, { flag: 'wx' });
  return storageKey;
}

async function removePrivateCv(storageKey) {
  if (!/^[\da-f-]{36}\.pdf$/i.test(storageKey || '')) return;
  await fs.rm(path.join(privateDirectory, storageKey), { force: true });
}

function getPrivateCvPath(storageKey) {
  if (!/^[\da-f-]{36}\.pdf$/i.test(storageKey || '')) {
    throw new Error('Invalid CV storage key');
  }
  return path.join(privateDirectory, storageKey);
}

module.exports = {
  getPrivateCvPath,
  hasExpectedSignature,
  removePrivateCv,
  removePublicInternshipFile,
  savePrivateCv,
  savePublicInternshipFile,
};
