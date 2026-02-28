const express = require('express');
const router = express.Router();
const supervisorController = require('../controllers/supervisor.controller');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Gestión de brigadistas
router.post('/brigadistas', authenticate, checkRole('supervisor', 'admin'), supervisorController.registerBrigadista);
router.get('/brigadistas', authenticate, checkRole('supervisor', 'admin'), supervisorController.getBrigadistas);

// Gestión de reportes
router.post('/reports/assign', authenticate, checkRole('supervisor', 'admin'), supervisorController.assignReport);
router.get('/reports/pending', authenticate, checkRole('supervisor', 'admin'), supervisorController.getPendingReports);
router.get('/reports', authenticate, checkRole('supervisor', 'admin'), supervisorController.getAllReports);
router.put('/reports/:id/review', authenticate, checkRole('supervisor', 'admin'), supervisorController.reviewReport);

// Dashboard
router.get('/dashboard/stats', authenticate, checkRole('supervisor', 'admin'), supervisorController.getDashboardStats);

module.exports = router;
