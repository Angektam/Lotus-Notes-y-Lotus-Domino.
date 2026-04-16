const { Report, User } = require('../models');
const { REPORT_STATUS } = require('../utils/reportStatus');

// Obtener todos los informes (admin) con paginación
exports.getAllReports = async (req, res) => {
  try {
    const { status, month, year, studentId, page = 1, limit = 20 } = req.query;
    
    const whereClause = {};
    if (status) whereClause.status = status;
    if (month) whereClause.reportMonth = month;
    if (year) whereClause.reportYear = year;
    if (studentId) whereClause.assignedTo = studentId;

    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    const { count, rows: reports } = await Report.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'brigadista',
        attributes: ['id', 'username', 'email', 'fullName', 'department']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: reports,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener informes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los informes',
      error: error.message
    });
  }
};

// Obtener estadísticas generales (admin) con filtros opcionales por mes/año
exports.getStatistics = async (req, res) => {
  try {
    const { month, year } = req.query;

    const whereClause = {};
    if (month) whereClause.reportMonth = month;
    if (year) whereClause.reportYear = year;

    const totalReports = await Report.count({ where: whereClause });
    const totalStudents = await User.count({ where: { role: 'student' } });
    
    const reportsByStatus = await Report.findAll({
      attributes: [
        'status',
        [Report.sequelize.fn('COUNT', Report.sequelize.col('id')), 'count']
      ],
      where: whereClause,
      group: ['status']
    });

    const totalHours = await Report.sum('totalHours', { where: whereClause });

    const recentReports = await Report.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      where: whereClause,
      include: [{
        model: User,
        as: 'brigadista',
        attributes: ['id', 'username', 'fullName']
      }]
    });

    // Agrupar estados: legacy + brigadista
    const statusMap = reportsByStatus.reduce((acc, item) => {
      acc[item.status] = parseInt(item.dataValues.count);
      return acc;
    }, {});

    const pendingCount = (statusMap['submitted'] || 0) + (statusMap['ENVIADO'] || 0);
    const approvedCount = (statusMap['approved'] || 0) + (statusMap['APROBADO'] || 0);
    const rejectedCount = (statusMap['rejected'] || 0) + (statusMap['OBSERVADO'] || 0);
    const draftCount = (statusMap['draft'] || 0) + (statusMap['ASIGNADO'] || 0) + (statusMap['EN_ELABORACION'] || 0);

    res.json({
      success: true,
      data: {
        totalReports,
        totalStudents,
        totalHours: totalHours || 0,
        reportsByStatus: {
          draft: draftCount,
          submitted: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          ...statusMap
        },
        recentReports
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

// Aprobar informe (admin/supervisor)
exports.approveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const report = await Report.findByPk(id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Informe no encontrado' });
    }

    // Detectar flujo: brigadista usa estados en mayúsculas
    const isBrigadistaFlow = ['ASIGNADO','EN_ELABORACION','ENVIADO','EN_REVISION','OBSERVADO','APROBADO'].includes(report.status);
    const newStatus = isBrigadistaFlow ? REPORT_STATUS.APROBADO : REPORT_STATUS.APPROVED;

    await report.update({
      status: newStatus,
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      reviewComments: comments,
      workflowHistory: isBrigadistaFlow
        ? [...(report.workflowHistory || []), { state: newStatus, date: new Date(), by: req.user.id, comments: comments || 'Aprobado por admin' }]
        : report.workflowHistory
    });

    res.json({ success: true, message: 'Informe aprobado exitosamente', data: report });
  } catch (error) {
    console.error('Error al aprobar informe:', error);
    res.status(500).json({ success: false, message: 'Error al aprobar el informe', error: error.message });
  }
};

// Rechazar informe (admin/supervisor)
exports.rejectReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    if (!comments) {
      return res.status(400).json({ success: false, message: 'Debes proporcionar comentarios al rechazar un informe' });
    }

    const report = await Report.findByPk(id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Informe no encontrado' });
    }

    const isBrigadistaFlow = ['ASIGNADO','EN_ELABORACION','ENVIADO','EN_REVISION','OBSERVADO','APROBADO'].includes(report.status);
    const newStatus = isBrigadistaFlow ? REPORT_STATUS.OBSERVADO : REPORT_STATUS.REJECTED;

    await report.update({
      status: newStatus,
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      reviewComments: comments,
      workflowHistory: isBrigadistaFlow
        ? [...(report.workflowHistory || []), { state: newStatus, date: new Date(), by: req.user.id, comments }]
        : report.workflowHistory
    });

    res.json({ success: true, message: 'Informe rechazado con observaciones', data: report });
  } catch (error) {
    console.error('Error al rechazar informe:', error);
    res.status(500).json({ success: false, message: 'Error al rechazar el informe', error: error.message });
  }
};

// Aprobar/rechazar múltiples informes en lote (admin)
exports.bulkReviewReports = async (req, res) => {
  try {
    const { ids, action, comments } = req.body; // action: 'approve' | 'reject'

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Debes seleccionar al menos un informe' });
    }
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Acción inválida' });
    }
    if (action === 'reject' && !comments?.trim()) {
      return res.status(400).json({ success: false, message: 'Debes proporcionar comentarios al rechazar informes' });
    }

    const reports = await Report.findAll({ where: { id: ids } });

    const results = { success: [], failed: [] };

    for (const report of reports) {
      try {
        const isBrigadistaFlow = ['ASIGNADO','EN_ELABORACION','ENVIADO','EN_REVISION','OBSERVADO','APROBADO'].includes(report.status);
        const newStatus = action === 'approve'
          ? (isBrigadistaFlow ? REPORT_STATUS.APROBADO : REPORT_STATUS.APPROVED)
          : (isBrigadistaFlow ? REPORT_STATUS.OBSERVADO : REPORT_STATUS.REJECTED);

        await report.update({
          status: newStatus,
          reviewedBy: req.user.id,
          reviewedAt: new Date(),
          reviewComments: comments || (action === 'approve' ? 'Aprobado en lote' : null),
          workflowHistory: isBrigadistaFlow
            ? [...(report.workflowHistory || []), { state: newStatus, date: new Date(), by: req.user.id, comments: comments || `${action === 'approve' ? 'Aprobado' : 'Rechazado'} en lote` }]
            : report.workflowHistory
        });
        results.success.push(report.id);
      } catch {
        results.failed.push(report.id);
      }
    }

    res.json({
      success: true,
      message: `${results.success.length} informe(s) procesado(s)${results.failed.length ? `, ${results.failed.length} fallaron` : ''}`,
      data: results
    });
  } catch (error) {
    console.error('Error en bulk review:', error);
    res.status(500).json({ success: false, message: 'Error al procesar informes', error: error.message });
  }
};

// Obtener todos los estudiantes (admin)
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'username', 'email', 'fullName', 'department', 'createdAt'],
      include: [{
        model: Report,
        as: 'reports',
        attributes: ['id', 'status', 'totalHours']
      }]
    });

    const studentsWithStats = students.map(student => {
      const reports = student.reports || [];
      return {
        ...student.toJSON(),
        stats: {
          totalReports: reports.length,
          totalHours: reports.reduce((sum, r) => sum + (r.totalHours || 0), 0),
          approved: reports.filter(r => r.status === REPORT_STATUS.APPROVED).length,
          pending: reports.filter(r => r.status === REPORT_STATUS.SUBMITTED).length
        }
      };
    });

    res.json({
      success: true,
      data: studentsWithStats,
      total: studentsWithStats.length
    });
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estudiantes',
      error: error.message
    });
  }
};

// Obtener detalle de un estudiante (admin)
exports.getStudentDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findOne({
      where: { id, role: 'student' },
      attributes: ['id', 'username', 'email', 'fullName', 'department', 'createdAt'],
      include: [{
        model: Report,
        as: 'reports',
        order: [['createdAt', 'DESC']]
      }]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error al obtener detalle del estudiante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalle del estudiante',
      error: error.message
    });
  }
};
