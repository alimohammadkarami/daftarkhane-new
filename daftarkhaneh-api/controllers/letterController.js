const letterModel = require('../models/letterModel');
const {
  isValidJalaliDateString,
  getJalaliYear,
  jalaliToGregorianDateString,
} = require('../utils/jalaali');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const VALID_TYPES = ['incoming', 'outgoing', 'internal'];

/**
 * اعتبارسنجی فیلدهای اجباری فرم ثبت نامه
 */
function validateBody(body) {
  const errors = [];

  if (!body.letterType || !VALID_TYPES.includes(body.letterType)) {
    errors.push('نوع نامه الزامی است و باید یکی از incoming, outgoing, internal باشد.');
  }
  if (!body.letterDate || !isValidJalaliDateString(body.letterDate)) {
    errors.push('تاریخ نامه الزامی است و باید تاریخ شمسی معتبر با فرمت YYYY-MM-DD باشد.');
  }
  if (!body.sender || !body.sender.trim()) {
    errors.push('فرستنده الزامی است.');
  }
  if (!body.receiver || !body.receiver.trim()) {
    errors.push('گیرنده الزامی است.');
  }
  if (!body.subject || !body.subject.trim()) {
    errors.push('موضوع نامه الزامی است.');
  }
  if (body.attachmentsCount !== undefined && isNaN(Number(body.attachmentsCount))) {
    errors.push('تعداد پیوست باید عددی باشد.');
  }

  return errors;
}

/**
 * POST /api/letters
 * ثبت یک نامه جدید در دبیرخانه
 */
exports.createLetter = asyncHandler(async (req, res) => {
  const errors = validateBody(req.body);
  if (errors.length) {
    throw new ApiError(400, 'خطای اعتبارسنجی اطلاعات فرم', errors);
  }

  const {
    letterType,
    letterDate,
    sender,
    receiver,
    subject,
    attachmentsCount,
    description,
  } = req.body;

  const persianYear = getJalaliYear(letterDate);
  const letterDateGregorian = jalaliToGregorianDateString(letterDate);

  const scanFileData = req.file
    ? {
        scanFilePath: `/uploads/${req.file.filename}`,
        scanFileOriginalName: req.file.originalname,
      }
    : { scanFilePath: null, scanFileOriginalName: null };

  const result = await letterModel.createLetter({
    letterType,
    letterDateJalali: letterDate,
    letterDateGregorian,
    persianYear,
    sender: sender.trim(),
    receiver: receiver.trim(),
    subject: subject.trim(),
    attachmentsCount: Number(attachmentsCount) || 0,
    description: description ? description.trim() : null,
    ...scanFileData,
  });

  res.status(201).json({
    success: true,
    message: 'نامه با موفقیت در دبیرخانه ثبت شد.',
    data: result,
  });
});

/**
 * GET /api/letters/:id
 * دریافت یک نامه بر اساس شناسه
 */
exports.getLetterById = asyncHandler(async (req, res) => {
  const letter = await letterModel.findLetterById(req.params.id);

  if (!letter) {
    throw new ApiError(404, 'نامه‌ای با این شناسه یافت نشد.');
  }

  res.json({ success: true, data: letter });
});
