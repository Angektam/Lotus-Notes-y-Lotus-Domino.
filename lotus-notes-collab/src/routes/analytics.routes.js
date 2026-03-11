const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Analíticas para supervisor
router.get('/supervisor', authenticate, analyticsController.getSupervisorAnalytics);

// Analíticas para brigadista
router.get('/brigadista', authenticate, analyticsController.getBrigadistaAnalytics);

// Exportar reportes a Excel
router.get('/export/excel', authenticate, analyticsController.exportReportsToExcel);

// Búsqueda avanzada
router.get('/search', authenticate, analyticsController.advancedSearch);

module.exports = router;
