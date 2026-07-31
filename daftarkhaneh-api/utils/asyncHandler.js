/**
 * دور تا دور توابع async کنترلر را می‌گیرد تا نیازی به try/catch تکراری نباشد
 * و خطاها به‌طور خودکار به میدلور مدیریت خطای اکسپرس فرستاده شوند
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
