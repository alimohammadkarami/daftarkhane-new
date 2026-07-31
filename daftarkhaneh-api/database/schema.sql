-- =====================================================================
-- دیتابیس سیستم دبیرخانه شخصی (Daftarkhaneh)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS daftarkhaneh
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_persian_ci;

USE daftarkhaneh;

-- ---------------------------------------------------------------------
-- جدول اصلی نامه‌ها
-- letter_type:
--   incoming  = وارده  (به درون)
--   outgoing  = صادره  (به بیرون)
--   internal  = داخلی
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS letters (
  id                        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  letter_type               ENUM('incoming', 'outgoing', 'internal') NOT NULL,
  letter_date_jalali          VARCHAR(10) NOT NULL COMMENT 'تاریخ شمسی همانطور که از کلاینت دریافت شده، فرمت YYYY-MM-DD',
  letter_date_gregorian        DATE NOT NULL COMMENT 'معادل میلادی، صرفا برای مرتب‌سازی/فیلتر با توابع استاندارد SQL',
  registration_number        VARCHAR(50) NOT NULL,
  sender                      VARCHAR(255) NOT NULL,
  receiver                    VARCHAR(255) NOT NULL,
  subject                     VARCHAR(500) NOT NULL,
  attachments_count           SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  scan_file_path               VARCHAR(500) DEFAULT NULL,
  scan_file_original_name       VARCHAR(255) DEFAULT NULL,
  description                  TEXT DEFAULT NULL,
  created_at                    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_registration_number (registration_number),
  INDEX idx_letter_type (letter_type),
  INDEX idx_letter_date_gregorian (letter_date_gregorian),
  INDEX idx_sender (sender),
  INDEX idx_receiver (receiver)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- ---------------------------------------------------------------------
-- جدول شمارنده‌ها برای تولید «شماره ثبت سیستم» به تفکیک سال شمسی و نوع نامه
-- هر ترکیب (سال , نوع نامه) یک شمارنده مستقل دارد
-- مثال شماره نهایی تولید شده: 00142/ص/JBH/1405
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS letter_sequences (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  persian_year   SMALLINT UNSIGNED NOT NULL,
  letter_type    ENUM('incoming', 'outgoing', 'internal') NOT NULL,
  last_number    INT UNSIGNED NOT NULL DEFAULT 0,

  UNIQUE KEY uq_year_type (persian_year, letter_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;
