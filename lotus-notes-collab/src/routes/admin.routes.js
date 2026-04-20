const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Todas las rutas requieren autenticación y rol de admin o supervisor
router.use(authMiddleware);
router.use(checkRole('admin', 'supervisor'));

// Estadísticas generales
router.get('/statistics', adminController.getStatistics);
router.get('/stats/community', adminController.getStatsByCommunity);
router.get('/access-log', adminController.getAccessLog);

// Gestión de informes
router.get('/reports', adminController.getAllReports);
router.put('/reports/:id/approve', adminController.approveReport);
router.put('/reports/:id/reject', adminController.rejectReport);
router.post('/reports/bulk-review', adminController.bulkReviewReports);

// Gestión de estudiantes
router.get('/students', adminController.getAllStudents);
router.get('/students/:id', adminController.getStudentDetail);

// Gestión de usuarios
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.updateUserStatus);

module.exports = router;
