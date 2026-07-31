const jalaali = require('jalaali-js');

const JALALI_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * بررسی می‌کند رشته ورودی یک تاریخ شمسی معتبر با فرمت YYYY-MM-DD باشد
 * (این همان فرمتی است که از کلاینت دریافت می‌شود، اما بر مبنای سال شمسی)
 * @param {string} jalaliStr
 * @returns {boolean}
 */
function isValidJalaliDateString(jalaliStr) {
  if (typeof jalaliStr !== 'string') return false;

  const match = jalaliStr.match(JALALI_DATE_REGEX);
  if (!match) return false;

  const [, jy, jm, jd] = match.map(Number);
  return jalaali.isValidJalaaliDate(jy, jm, jd);
}

/**
 * استخراج سال شمسی از رشته تاریخ شمسی، بدون هیچ تبدیلی
 * @param {string} jalaliStr مثل '1405-05-09'
 * @returns {number} مثل 1405
 */
function getJalaliYear(jalaliStr) {
  return Number(jalaliStr.split('-')[0]);
}

/**
 * تبدیل تاریخ شمسی به معادل میلادی‌اش، فقط برای ذخیره در ستون DATE استاندارد
 * (جهت مرتب‌سازی/فیلتر با ابزارهای استاندارد SQL - نمایش همچنان بر اساس تاریخ شمسی اصلی است)
 * @param {string} jalaliStr مثل '1405-05-09'
 * @returns {string} تاریخ میلادی به فرمت 'YYYY-MM-DD'
 */
function jalaliToGregorianDateString(jalaliStr) {
  const [, jy, jm, jd] = jalaliStr.match(JALALI_DATE_REGEX).map(Number);
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);

  const pad = (n) => String(n).padStart(2, '0');
  return `${gy}-${pad(gm)}-${pad(gd)}`;
}

module.exports = {
  isValidJalaliDateString,
  getJalaliYear,
  jalaliToGregorianDateString,
};
