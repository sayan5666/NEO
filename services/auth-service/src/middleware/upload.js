const multer = require('multer');

// Configure memory storage so we have access to req.file.buffer for pdf-parse and Cloudinary streaming
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept only PDF files
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = file.originalname.toLowerCase().endsWith('.pdf');

  if (isPdfMime || isPdfExt) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF documents are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum file size
  },
});

module.exports = upload;
