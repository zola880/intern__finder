const fs = require('fs');
const path = require('path');

// Local file upload (no Cloudinary required for development)
async function uploadToCloudinary(fileBuffer, originalName) {
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const timestamp = Date.now();
  const safeName = originalName.replace(/[^a-zA-Z0-9.]/g, '_');
  const fileName = `${timestamp}_${safeName}`;
  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, fileBuffer);
  // Return a local URL (you'd serve static files from /uploads)
  return `http://localhost:5000/uploads/${fileName}`;
}

module.exports = { uploadToCloudinary };