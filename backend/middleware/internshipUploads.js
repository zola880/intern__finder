const multer = require('multer');
const path = require('path');

const allowed = {
  companyLogo: {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
  },
  applicationForm: {
    'application/pdf': ['.pdf'],
  },
  cv: {
    'application/pdf': ['.pdf'],
  },
};

function createUpload(fields) {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: fields.length },
    fileFilter(req, file, callback) {
      const extensions = allowed[file.fieldname]?.[file.mimetype];
      const extension = path.extname(file.originalname).toLowerCase();
      if (!extensions || !extensions.includes(extension)) {
        return callback(new Error(`Unsupported file type for ${file.fieldname}`));
      }
      callback(null, true);
    },
  }).fields(fields.map(name => ({ name, maxCount: 1 })));

  return (req, res, next) => upload(req, res, error => {
    if (error) {
      const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      return res.status(status).json({ message: error.message });
    }
    next();
  });
}

exports.internshipUploads = createUpload(['companyLogo', 'applicationForm']);
exports.cvUpload = createUpload(['cv']);
