const multer = require('multer')

module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes('spreadsheet') || file.mimetype.includes('excel') || file.originalname.match(/\.(xlsx|xls)$/i)) {
      cb(null, true)
    } else {
      cb(new Error('Only Excel files allowed'))
    }
  }
})
