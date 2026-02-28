const { Report, User } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los informes (admin)
exports.getAllReports = async (req, res) => {
  try {
    const { status, month, year, studentId } = req.query;
    
    const whereClause = {};
    
    if (status) whereClause.status = status;
    if (month) whereClause.reportMonth = month;
    if (year) whereClause.reportYear = year;
    if (studentId) whereClause.userId = studentId;

    const reports = await Report.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'student',
        attributes: ['id', 'username', 'email', 'fullName', 'department']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: reports,
      total: reports.length
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

// Obtener estadísticas generales (admin)
exports.getStatistics = async (req, res) => {
  try {
    const totalReports = await Report.count();
    const totalStudents = await User.count({ where: { role: 'student' } });
    
    const reportsByStatus = await Report.findAll({
      attributes: [
        'status',
        [Report.sequelize.fn('COUNT', Report.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const totalHours = await Report.sum('totalHours');

    const recentReports = await Report.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'student',
        attributes: ['id', 'username', 'fullName']
      }]
    });

    res.json({
      success: true,
      data: {
        totalReports,
        totalStudents,
        totalHours: totalHours || 0,
        reportsByStatus: reportsByStatus.reduce((acc, item) => {
          acc[item.status] = parseInt(item.dataValues.count);
          return acc;
        }, {}),
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
      return res.status(404).json({
        success: false,
        message: 'Informe no encontrado'
      });
    }

    await report.update({
      status: 'approved',
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      reviewComments: comments
    });

    res.json({
      success: true,
      message: 'Informe aprobado exitosamente',
      data: report
    });
  } catch (error) {
    console.error('Error al aprobar informe:', error);
    res.status(500).json({
      success: false,
      message: 'Error al aprobar el informe',
      error: error.message
    });
  }
};

// Rechazar informe (admin/supervisor)
exports.rejectReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    if (!comments) {
      return res.status(400).json({
        success: false,
        message: 'Debes proporcionar comentarios al rechazar un informe'
      });
    }

    const report = await Report.findByPk(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Informe no encontrado'
      });
    }

    await report.update({
      status: 'rejected',
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      reviewComments: comments
    });

    res.json({
      success: true,
      message: 'Informe rechazado',
      data: report
    });
  } catch (error) {
    console.error('Error al rechazar informe:', error);
    res.status(500).json({
      success: false,
      message: 'Error al rechazar el informe',
      error: error.message
    });
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
          approved: reports.filter(r => r.status === 'approved').length,
          pending: reports.filter(r => r.status === 'submitted').length
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
