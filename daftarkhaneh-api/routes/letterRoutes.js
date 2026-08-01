const express = require('express');
const router = express.Router();

const letterController = require('../controllers/letterController');
const upload = require('../utils/upload');

// ثبت نامه و اپلود فایل
router.post('/', upload.single('scanFile'), letterController.createLetter);

// دریافت یک نامه با شناسه
router.get('/:id', letterController.getLetterById);
// دریافت نامه با شماره نامه 
router.post('/get', letterController.lettersByStringID);
// دانلود نامه 
router.get('/:id/download', letterController.downloadLetters);
module.exports = router;
