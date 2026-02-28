const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const brigadistaController = require('../controllers/brigadista.controller');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Tipo de archivo no permitido'));
  }
});

// Gestión de reportes
router.get('/reports', authenticate, checkRole('brigadista', 'admin'), brigadistaController.getMyReports);
router.get('/reports/:id', authenticate, checkRole('brigadista', 'admin'), brigadistaController.getReportById);
router.put('/reports/:id', authenticate, checkRole('brigadista', 'admin'), brigadistaController.updateReport);
router.post('/reports/:id/submit', authenticate, checkRole('brigadista', 'admin'), brigadistaController.submitReport);
router.post('/reports/:id/attachments', authenticate, checkRole('brigadista', 'admin'), upload.single('file'), brigadistaController.uploadAttachment);

// Dashboard
router.get('/dashboard/stats', authenticate, checkRole('brigadista', 'admin'), brigadistaController.getMyStats);

module.exports = router;
