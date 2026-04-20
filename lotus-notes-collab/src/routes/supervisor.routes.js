const express = require('express');
const router = express.Router();
const multer = require('multer');
const os = require('os');
const supervisorController = require('../controllers/supervisor.controller');
const docParserController = require('../controllers/docParser.controller');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Multer temporal para parseo de documentos
const uploadTemp = multer({ dest: os.tmpdir(), limits: { fileSize: 10 * 1024 * 1024 } });

// Parsear documento DOCX/PDF para pre-llenar formulario
router.post('/parse-report', authenticate, checkRole('supervisor', 'admin'), uploadTemp.single('document'), docParserController.parseReport);

// Gestión de brigadistas
router.post('/brigadistas', authenticate, checkRole('supervisor', 'admin'), supervisorController.registerBrigadista);
router.get('/brigadistas', authenticate, checkRole('supervisor', 'admin'), supervisorController.getBrigadistas);
router.put('/brigadistas/:id', authenticate, checkRole('supervisor', 'admin'), supervisorController.updateBrigadista);
router.delete('/brigadistas/:id', authenticate, checkRole('supervisor', 'admin'), supervisorController.deleteBrigadista);

// Gestión de reportes
router.post('/reports/assign', authenticate, checkRole('supervisor', 'admin'), supervisorController.assignReport);
router.post('/reports/assign-bulk', authenticate, checkRole('supervisor', 'admin'), supervisorController.assignReportBulk);
router.get('/reports/pending', authenticate, checkRole('supervisor', 'admin'), supervisorController.getPendingReports);
router.get('/reports', authenticate, checkRole('supervisor', 'admin'), supervisorController.getAllReports);
router.put('/reports/:id/review', authenticate, checkRole('supervisor', 'admin'), supervisorController.reviewReport);
router.post('/reports/:id/ai-analyze', authenticate, checkRole('supervisor', 'admin'), supervisorController.aiAnalyzeReport);

// Dashboard
router.get('/dashboard/stats', authenticate, checkRole('supervisor', 'admin'), supervisorController.getDashboardStats);

module.exports = router;
