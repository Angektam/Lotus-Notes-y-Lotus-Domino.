const { Report, User, Notification } = require('../models');
const { Op } = require('sequelize');
const { REPORT_STATUS } = require('../utils/reportStatus');
const { createAndSendNotification } = require('../utils/notificationHelper');
const { analyzeReport } = require('../services/aiReview');

// Registrar nuevo brigadista
exports.registerBrigadista = async (req, res) => {
  try {
    const { username, email, password, fullName, zone, team, community } = req.body;

    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { username }] }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'El usuario o email ya existe' });
    }

    const brigadista = await User.create({
      username, email, password, fullName,
      role: 'brigadista',
      brigadistaProfile: {
        zone, team, community: community || '',
        supervisorId: req.user.id,
        startDate: new Date()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Brigadista registrado exitosamente',
      data: { id: brigadista.id, username: brigadista.username, email: brigadista.email, fullName: brigadista.fullName, role: brigadista.role }
    });
  } catch (error) {
    console.error('Error al registrar brigadista:', error);
    res.status(500).json({ success: false, message: 'Error al registrar brigadista', error: error.message });
  }
};

// Actualizar brigadista
exports.updateBrigadista = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, zone, team, community } = req.body;

    const brigadista = await User.findOne({ where: { id, role: 'brigadista' } });
    if (!brigadista) return res.status(404).json({ success: false, message: 'Brigadista no encontrado' });

    await brigadista.update({
      fullName: fullName || brigadista.fullName,
      brigadistaProfile: {
        ...brigadista.brigadistaProfile,
        zone: zone ?? brigadista.brigadistaProfile?.zone,
        team: team ?? brigadista.brigadistaProfile?.team,
        community: community ?? brigadista.brigadistaProfile?.community
      }
    });

    res.json({ success: true, message: 'Brigadista actualizado', data: brigadista });
  } catch (error) {
    console.error('Error al actualizar brigadista:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar brigadista', error: error.message });
  }
};

// Eliminar brigadista
exports.deleteBrigadista = async (req, res) => {
  try {
    const { id } = req.params;
    const brigadista = await User.findOne({ where: { id, role: 'brigadista' } });
    if (!brigadista) return res.status(404).json({ success: false, message: 'Brigadista no encontrado' });
    await brigadista.destroy();
    res.json({ success: true, message: 'Brigadista eliminado' });
  } catch (error) {
    console.error('Error al eliminar brigadista:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar brigadista', error: error.message });
  }
};

// Listar brigadistas — cada supervisor solo ve los suyos (por supervisorId en brigadistaProfile)
exports.getBrigadistas = async (req, res) => {
  try {
    const { community } = req.query;
    const isAdmin = req.user.role === 'admin';

    const brigadistas = await User.findAll({
      where: { role: 'brigadista' },
      attributes: ['id', 'username', 'email', 'fullName', 'brigadistaProfile', 'status', 'createdAt'],
      include: [{ model: Report, as: 'assignedReports', attributes: ['id', 'status'] }]
    });

    let data = brigadistas
      // Filtrar por supervisorId salvo que sea admin
      .filter(b => isAdmin || b.brigadistaProfile?.supervisorId === req.user.id)
      .map(b => {
        const reports = b.assignedReports || [];
        const reportStats = {
          total: reports.length,
          asignado: reports.filter(r => r.status === 'ASIGNADO').length,
          enElaboracion: reports.filter(r => r.status === 'EN_ELABORACION').length,
          enviado: reports.filter(r => r.status === 'ENVIADO').length,
          aprobado: reports.filter(r => r.status === 'APROBADO').length,
          observado: reports.filter(r => r.status === 'OBSERVADO').length,
        };
        const { assignedReports, ...rest } = b.toJSON();
        return { ...rest, reportStats };
      });

    if (community) {
      data = data.filter(b => (b.brigadistaProfile?.community || '') === community);
    }

    const byCommunity = data.reduce((acc, b) => {
      const com = b.brigadistaProfile?.community || 'Sin comunidad';
      if (!acc[com]) acc[com] = [];
      acc[com].push(b);
      return acc;
    }, {});

    res.json({ success: true, data, byCommunity });
  } catch (error) {
    console.error('Error al obtener brigadistas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener brigadistas', error: error.message });
  }
};

// Asignar reporte a brigadista
exports.assignReport = async (req, res) => {
  try {
    const { brigadistaId, title, description, dueDate, periodStart, periodEnd } = req.body;

    // Verificar que el brigadista existe
    const brigadista = await User.findOne({
      where: { id: brigadistaId, role: 'brigadista' }
    });

    if (!brigadista) {
      return res.status(404).json({
        success: false,
        message: 'Brigadista no encontrado'
      });
    }

    const report = await Report.create({
      assignedTo: brigadistaId,
      assignedBy: req.user.id,
      assignedDate: new Date(),
      dueDate,
      title,
      description,
      periodStart,
      periodEnd,
      status: REPORT_STATUS.ASIGNADO,
      brigadistaInfo: {
        name: brigadista.fullName,
        zone: brigadista.brigadistaProfile?.zone || '',
        team: brigadista.brigadistaProfile?.team || '',
        community: brigadista.brigadistaProfile?.community || ''
      },
      workflowHistory: [{
        state: REPORT_STATUS.ASIGNADO,
        date: new Date(),
        by: req.user.id,
        comments: 'Reporte asignado'
      }],
      auditTrail: [{
        action: 'CREATE',
        by: req.user.id,
        date: new Date(),
        details: 'Reporte creado y asignado'
      }]
    });

    // Crear y enviar notificación en tiempo real al brigadista
    await createAndSendNotification({
      userId: brigadistaId,
      type: 'REPORT_ASSIGNED',
      title: 'Nuevo reporte asignado',
      message: `Se te ha asignado el reporte: ${title}`,
      relatedReportId: report.id,
      priority: 'MEDIUM'
    });

    res.status(201).json({
      success: true,
      message: 'Reporte asignado exitosamente',
      data: report
    });
  } catch (error) {
    console.error('Error al asignar reporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar reporte',
      error: error.message
    });
  }
};

// Obtener reportes pendientes de revisión
exports.getPendingReports = async (req, res) => {
  try {
    const reports = await Report.findAll({
      where: {
        status: REPORT_STATUS.ENVIADO,
        assignedBy: req.user.id
      },
      include: [{
        model: User,
        as: 'brigadista',
        attributes: ['id', 'fullName', 'email', 'brigadistaProfile']
      }],
      order: [['dueDate', 'ASC']]
    });

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Error al obtener reportes pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reportes pendientes',
      error: error.message
    });
  }
};

// Revisar y aprobar/rechazar reporte
exports.reviewReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, comments, observations } = req.body; // action: 'APPROVE' | 'REJECT'

    const report = await Report.findOne({
      where: { id, assignedBy: req.user.id },
      include: [{
        model: User,
        as: 'brigadista',
        attributes: ['id', 'fullName', 'email']
      }]
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    if (report.status !== REPORT_STATUS.ENVIADO) {
      return res.status(400).json({
        success: false,
        message: 'El reporte no está disponible para revisión'
      });
    }

    const newStatus = action === 'APPROVE' ? REPORT_STATUS.APROBADO : REPORT_STATUS.OBSERVADO;

    // Actualizar reporte
    await report.update({
      status: newStatus,
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      reviewComments: comments,
      reviewObservations: observations || [],
      workflowHistory: [
        ...report.workflowHistory,
        {
          state: newStatus,
          date: new Date(),
          by: req.user.id,
          comments
        }
      ],
      auditTrail: [
        ...report.auditTrail,
        {
          action: action === 'APPROVE' ? 'APPROVE' : 'REJECT',
          by: req.user.id,
          date: new Date(),
          details: comments
        }
      ]
    });

    // Crear y enviar notificación en tiempo real al brigadista
    await createAndSendNotification({
      userId: report.assignedTo,
      type: action === 'APPROVE' ? 'REPORT_APPROVED' : 'REPORT_REJECTED',
      title: action === 'APPROVE' ? 'Reporte aprobado' : 'Reporte con observaciones',
      message: action === 'APPROVE'
        ? `Tu reporte "${report.title}" ha sido aprobado`
        : `Tu reporte "${report.title}" requiere correcciones: ${comments}`,
      relatedReportId: report.id,
      priority: action === 'APPROVE' ? 'LOW' : 'HIGH'
    });

    res.json({
      success: true,
      message: action === 'APPROVE' ? 'Reporte aprobado' : 'Reporte rechazado con observaciones',
      data: report
    });
  } catch (error) {
    console.error('Error al revisar reporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error al revisar reporte',
      error: error.message
    });
  }
};

// Obtener todos los reportes (dashboard)
exports.getAllReports = async (req, res) => {
  try {
    const { status, brigadistaId } = req.query;
    
    const where = { assignedBy: req.user.id };
    
    if (status) {
      where.status = status;
    }
    
    if (brigadistaId) {
      where.assignedTo = brigadistaId;
    }

    const reports = await Report.findAll({
      where,
      include: [{
        model: User,
        as: 'brigadista',
        attributes: ['id', 'fullName', 'email', 'brigadistaProfile']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reportes',
      error: error.message
    });
  }
};

// Analizar reporte con IA
exports.aiAnalyzeReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findOne({
      where: { id },
      include: [{ model: User, as: 'brigadista', attributes: ['id', 'fullName', 'email'] }]
    });
    if (!report) return res.status(404).json({ success: false, message: 'Reporte no encontrado' });

    const analysis = await analyzeReport(report);
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('[IA] Error:', error);
    res.status(500).json({ success: false, message: 'Error al analizar el reporte', error: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const supervisorId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const totalReports = await Report.count({ where: { assignedBy: supervisorId } });
    const pendingReview = await Report.count({ where: { assignedBy: supervisorId, status: REPORT_STATUS.ENVIADO } });
    const approved = await Report.count({ where: { assignedBy: supervisorId, status: REPORT_STATUS.APROBADO } });
    const overdue = await Report.count({
      where: { assignedBy: supervisorId, dueDate: { [Op.lt]: new Date() }, status: { [Op.notIn]: [REPORT_STATUS.APROBADO] } }
    });

    // Solo contar brigadistas de esta comunidad
    const allBrigadistas = await User.findAll({ where: { role: 'brigadista' }, attributes: ['id', 'brigadistaProfile'] });
    const myBrigadistas = isAdmin
      ? allBrigadistas
      : allBrigadistas.filter(b => b.brigadistaProfile?.supervisorId === supervisorId);

    // Nombre de la comunidad del supervisor
    const supUser = await User.findByPk(supervisorId, { attributes: ['supervisorProfile'] });
    const community = supUser?.supervisorProfile?.community || null;

    res.json({
      success: true,
      data: { totalReports, pendingReview, approved, overdue, totalBrigadistas: myBrigadistas.length, community }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas', error: error.message });
  }
};
