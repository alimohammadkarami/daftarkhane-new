const { pool } = require('../config/db');

// کد اختصاری هر نوع نامه که در شماره ثبت سیستم استفاده می‌شود
const LETTER_TYPE_CODE = {
  incoming: 'و', // وارده
  outgoing: 'ص', // صادره
  internal: 'د', // داخلی
};


/**
 * دریافت شماره ترتیبی بعدی برای یک سال شمسی و نوع نامه مشخص
 * با استفاده از INSERT ... ON DUPLICATE KEY UPDATE به صورت اتمیک روی همان تراکنش
 * ردیف مربوطه قفل و افزایش داده می‌شود تا از تداخل هم‌زمان جلوگیری شود
 * @param {import('mysql2/promise').PoolConnection} connection
 */
async function getNextSequenceNumber(connection, persianYear, letterType) {
  await connection.query(
    `INSERT INTO letter_sequences (persian_year, letter_type, last_number)
     VALUES (?, ?, 1)
     ON DUPLICATE KEY UPDATE last_number = last_number + 1`,
    [persianYear, letterType]
  );

  const [rows] = await connection.query(
    `SELECT last_number FROM letter_sequences
     WHERE persian_year = ? AND letter_type = ?
     FOR UPDATE`,
    [persianYear, letterType]
  );

  return rows[0].last_number;
}

function buildRegistrationNumber(seq, letterType, persianYear) {
  const paddedSeq = String(seq).padStart(5, '0');
  const typeCode = LETTER_TYPE_CODE[letterType];
  return `${paddedSeq}/${typeCode}/${persianYear}`;
}

/**
 * ثبت یک نامه جدید در دبیرخانه (در یک تراکنش کامل)
 * @param {object} data
 */
async function createLetter(data) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const seq = await getNextSequenceNumber(connection, data.persianYear, data.letterType);
    const registrationNumber = buildRegistrationNumber(seq, data.letterType, data.persianYear);

    const [result] = await connection.query(
      `INSERT INTO letters
        (letter_type, letter_date_jalali, letter_date_gregorian, registration_number, sender, receiver,
         subject, attachments_count, scan_file_path, scan_file_original_name, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.letterType,
        data.letterDateJalali,
        data.letterDateGregorian,
        registrationNumber,
        data.sender,
        data.receiver,
        data.subject,
        data.attachmentsCount,
        data.scanFilePath,
        data.scanFileOriginalName,
        data.description,
      ]
    );

    await connection.commit();

    return {
      id: result.insertId,
      registrationNumber,
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function findLetterById(id) {
  const [rows] = await pool.query('SELECT * FROM letters WHERE id = ?', [id]);
  return rows[0] || null;
}
async function findLetterByStringId(stringId) {
  const [rows] = await pool.query('SELECT * FROM letters WHERE registration_number = ?', [stringId]);
  return rows[0] || null;
}
module.exports = {
  createLetter,
  findLetterById,
  findLetterByStringId,
  LETTER_TYPE_CODE,
};
