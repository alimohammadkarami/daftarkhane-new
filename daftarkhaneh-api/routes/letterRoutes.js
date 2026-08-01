const express = require('express');
const router = express.Router();

const letterController = require('../controllers/letterController');
const upload = require('../utils/upload');

// ثبت نامه جدید - فیلد فایل باید با نام scanFile ارسال شود (multipart/form-data)
router.post('/', upload.single('scanFile'), letterController.createLetter);

// دریافت یک نامه با شناسه
router.get('/:id', letterController.getLetterById);

router.post('/get', letterController.lettersByStringID);
router.get('/:id/download', letterController.downloadLetters);
module.exports = router;
