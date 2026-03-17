const { Report, User } = require('../models');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');

// Dashboard de analíticas para supervisores
exports.getSupervisorAnalytics = async (req, res) => {
  try {
    const supervisorId = req.user.id;
    const { startDate, endDate } = req.query;

    // Filtros de fecha
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Total de reportes asignados
    const totalReports = await Report.count({
      where: { assignedBy: supervisorId, ...dateFilter }
    });

    // Reportes por estado
    const reportsByStatus = await Report.findAll({
      where: { assignedBy: supervisorId, ...dateFilter },
      attributes: [
        'status',
        [Report.sequelize.fn('COUNT', Report.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Reportes aprobados vs rechazados
    const approvedCount = await Report.count({
      where: { assignedBy: supervisorId, status: 'APROBADO', ...dateFilter }
    });

    const rejectedCount = await Report.count({
      where: { assignedBy: supervisorId, status: 'OBSERVADO', ...dateFilter }
    });

    // Reportes por brigadista
    const reportsByBrigadista = await Report.findAll({
      where: { assignedBy: supervisorId, ...dateFilter },
      attributes: [
        'assignedTo',
        [Report.sequelize.fn('COUNT', Report.sequelize.col('Report.id')), 'count']
      ],
      include: [{
        model: User,
        as: 'brigadista',
        attributes: ['username', 'fullName']
      }],
      group: ['assignedTo', 'brigadista.id', 'brigadista.username', 'brigadista.fullName']
    });

    // Tiempo promedio de completado (días)
    const completedReports = await Report.findAll({
      where: {
        assignedBy: supervisorId,
        status: 'APROBADO',
        ...dateFilter
      },
      attributes: ['createdAt', 'updatedAt']
    });

    let avgCompletionTime = 0;
    if (completedReports.length > 0) {
      const totalDays = completedReports.reduce((sum, report) => {
        const days = Math.ceil((new Date(report.updatedAt) - new Date(report.createdAt)) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      avgCompletionTime = Math.round(totalDays / completedReports.length);
    }

    // Reportes vencidos
    const overdueReports = await Report.count({
      where: {
        assignedBy: supervisorId,
        dueDate: { [Op.lt]: new Date() },
        status: { [Op.notIn]: ['APROBADO'] },
        ...dateFilter
      }
    });

    // Tendencia mensual (últimos 6 meses) - compatible con SQLite
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrendRaw = await Report.findAll({
      where: {
        assignedBy: supervisorId,
        createdAt: { [Op.gte]: sixMonthsAgo }
      },
      attributes: ['createdAt'],
      order: [['createdAt', 'ASC']]
    });

    // Agrupar por mes en JS (compatible con SQLite y MySQL)
    const monthlyMap = {};
    monthlyTrendRaw.forEach(r => {
      const d = new Date(r.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + 1;
    });
    const monthlyTrend = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));

    res.json({
      summary: {
        totalReports,
        approvedCount,
        rejectedCount,
        overdueReports,
        avgCompletionTime
      },
      reportsByStatus: reportsByStatus.map(r => ({
        status: r.status,
        count: parseInt(r.dataValues.count)
      })),
      reportsByBrigadista: reportsByBrigadista.map(r => ({
        brigadistaId: r.assignedTo,
        brigadistaName: r.brigadista?.fullName || r.brigadista?.username,
        count: parseInt(r.dataValues.count)
      })),
      monthlyTrend
    });
  } catch (error) {
    console.error('Error en getSupervisorAnalytics:', error);
    res.status(500).json({ message: 'Error al obtener analíticas', error: error.message });
  }
};

// Dashboard de analíticas para brigadistas
exports.getBrigadistaAnalytics = async (req, res) => {
  try {
    const brigadistaId = req.user.id;
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Total de reportes asignados
    const totalReports = await Report.count({
      where: { assignedTo: brigadistaId, ...dateFilter }
    });

    // Reportes por estado
    const reportsByStatus = await Report.findAll({
      where: { assignedTo: brigadistaId, ...dateFilter },
      attributes: [
        'status',
        [Report.sequelize.fn('COUNT', Report.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Reportes completados
    const completedCount = await Report.count({
      where: { assignedTo: brigadistaId, status: 'APROBADO', ...dateFilter }
    });

    // Reportes pendientes
    const pendingCount = await Report.count({
      where: {
        assignedTo: brigadistaId,
        status: { [Op.in]: ['ASIGNADO', 'EN_ELABORACION', 'OBSERVADO'] },
        ...dateFilter
      }
    });

    // Reportes vencidos
    const overdueCount = await Report.count({
      where: {
        assignedTo: brigadistaId,
        dueDate: { [Op.lt]: new Date() },
        status: { [Op.notIn]: ['APROBADO'] },
        ...dateFilter
      }
    });

    // Tasa de aprobación
    const approvedCount = await Report.count({
      where: { assignedTo: brigadistaId, status: 'APROBADO', ...dateFilter }
    });

    const reviewedCount = await Report.count({
      where: {
        assignedTo: brigadistaId,
        status: { [Op.in]: ['APROBADO', 'OBSERVADO'] },
        ...dateFilter
      }
    });

    const approvalRate = reviewedCount > 0 ? Math.round((approvedCount / reviewedCount) * 100) : 0;

    res.json({
      summary: {
        totalReports,
        completedCount,
        pendingCount,
        overdueCount,
        approvalRate
      },
      reportsByStatus: reportsByStatus.map(r => ({
        status: r.status,
        count: parseInt(r.dataValues.count)
      }))
    });
  } catch (error) {
    console.error('Error en getBrigadistaAnalytics:', error);
    res.status(500).json({ message: 'Error al obtener analíticas', error: error.message });
  }
};

// Exportar reportes a Excel
exports.exportReportsToExcel = async (req, res) => {
  try {
    const { startDate, endDate, status, assignedTo } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;

    // Construir filtros
    const where = {};
    
    if (userRole === 'supervisor') {
      where.assignedBy = userId;
    } else if (userRole === 'brigadista') {
      where.assignedTo = userId;
    }

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    if (status) {
      where.status = status;
    }

    if (assignedTo && userRole === 'supervisor') {
      where.assignedTo = assignedTo;
    }

    // Obtener reportes
    const reports = await Report.findAll({
      where,
      include: [
        { model: User, as: 'brigadista', attributes: ['username', 'fullName'] },
        { model: User, as: 'supervisor', attributes: ['username', 'fullName'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Crear libro de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reportes');

    // Definir columnas
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Título', key: 'title', width: 30 },
      { header: 'Descripción', key: 'description', width: 40 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Prioridad', key: 'priority', width: 12 },
      { header: 'Brigadista', key: 'brigadista', width: 20 },
      { header: 'Supervisor', key: 'supervisor', width: 20 },
      { header: 'Fecha Creación', key: 'createdAt', width: 18 },
      { header: 'Fecha Vencimiento', key: 'dueDate', width: 18 },
      { header: 'Fecha Actualización', key: 'updatedAt', width: 18 }
    ];

    // Estilo del encabezado
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Agregar datos
    reports.forEach(report => {
      worksheet.addRow({
        id: report.id,
        title: report.title,
        description: report.description,
        status: report.status,
        priority: report.priority || 'MEDIUM',
        brigadista: report.brigadista?.fullName || report.brigadista?.username || 'N/A',
        supervisor: report.supervisor?.fullName || report.supervisor?.username || 'N/A',
        createdAt: new Date(report.createdAt).toLocaleString('es-MX'),
        dueDate: new Date(report.dueDate).toLocaleString('es-MX'),
        updatedAt: new Date(report.updatedAt).toLocaleString('es-MX')
      });
    });

    // Configurar respuesta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=reportes_${Date.now()}.xlsx`);

    // Enviar archivo
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error en exportReportsToExcel:', error);
    res.status(500).json({ message: 'Error al exportar reportes', error: error.message });
  }
};

// Búsqueda avanzada de reportes
exports.advancedSearch = async (req, res) => {
  try {
    const {
      query,
      status,
      priority,
      startDate,
      endDate,
      assignedTo,
      assignedBy,
      page = 1,
      limit = 20
    } = req.query;

    const userRole = req.user.role;
    const userId = req.user.id;

    // Construir filtros
    const where = {};

    // Filtro por rol (roles en minúsculas según el modelo User)
    if (userRole === 'supervisor') {
      where.assignedBy = userId;
    } else if (userRole === 'brigadista') {
      where.assignedTo = userId;
    }

    // Búsqueda de texto
    if (query) {
      where[Op.or] = [
        { title: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } }
      ];
    }

    // Filtros adicionales
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo && userRole === 'supervisor') where.assignedTo = assignedTo;
    if (assignedBy && userRole === 'admin') where.assignedBy = assignedBy;

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Paginación
    const offset = (page - 1) * limit;

    const { count, rows: reports } = await Report.findAndCountAll({
      where,
      include: [
        { model: User, as: 'brigadista', attributes: ['id', 'username', 'fullName'] },
        { model: User, as: 'supervisor', attributes: ['id', 'username', 'fullName'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      reports,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error en advancedSearch:', error);
    res.status(500).json({ message: 'Error en búsqueda avanzada', error: error.message });
  }
};
