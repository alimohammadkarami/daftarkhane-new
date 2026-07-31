const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// فقط PDF و تصاویر مطابق فرم (اسکن نامه) مجاز است
const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

function fileFilter(req, file, cb) {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('فرمت فایل مجاز نیست. فقط PDF یا تصویر (JPG/PNG) مجاز است.'));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // حداکثر ۱۰ مگابایت
});

module.exports = upload;
