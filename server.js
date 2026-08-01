const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require("cors");
require('dotenv').config();

const letterRoutes = require('./daftarkhaneh-api/routes/letterRoutes');
const ApiError = require('./daftarkhaneh-api/utils/ApiError');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/letters', letterRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'مسیر مورد نظر یافت نشد.' });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.includes('فرمت فایل')) {
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.details,
    });
  }

  console.error(err);
  res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
