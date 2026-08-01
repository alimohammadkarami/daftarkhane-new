const jalaali = require('jalaali-js');
const JALALI_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
function isValidJalaliDateString(jalaliStr) {
  if (typeof jalaliStr !== 'string') return false;

  const match = jalaliStr.match(JALALI_DATE_REGEX);
  if (!match) return false;

  const [, jy, jm, jd] = match.map(Number);
  return jalaali.isValidJalaaliDate(jy, jm, jd);
}

function getJalaliYear(jalaliStr) {
  return Number(jalaliStr.split('-')[0]);
}

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
