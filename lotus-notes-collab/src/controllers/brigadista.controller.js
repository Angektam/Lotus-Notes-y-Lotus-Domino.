const { Report, User, Notification, Attachment } = require('../models');
const { Op } = require('sequelize');
const { createAndSendNotification } = require('../utils/notificationHelper');

// Obtener perfil propio del brigadista
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email', 'fullName', 'department', 'status', 'brigadistaProfile', 'notificationSettings', 'lastLogin', 'createdAt']
    });
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    const totalReports = await Report.count({ where: { assignedTo: req.user.id } });
    const approved = await Report.count({ where: { assignedTo: req.user.id, status: 'APROBADO' } });
    const pending = await Report.count({ where: { assignedTo: req.user.id, status: { [Op.in]: ['ASIGNADO', 'EN_ELABORACION', 'OBSERVADO'] } } });
    const overdue = await Report.count({ where: { assignedTo: req.user.id, dueDate: { [Op.lt]: new Date() }, status: { [Op.notIn]: ['APROBADO'] } } });

    res.json({ success: true, data: { ...user.toJSON(), stats: { totalReports, approved, pending, overdue } } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener perfil', error: error.message });
  }
};

// Actualizar perfil propio del brigadista
exports.updateMyProfile = async (req, res) => {
  try {
    const { fullName, department, zone, team, community, notificationSettings, currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    // Cambio de contraseña opcional
    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ success: false, message: 'Debes proporcionar tu contraseña actual' });
      if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'La nueva contraseña debe tener al menos 6 caracteres' });
      const valid = await user.comparePassword(currentPassword);
      if (!valid) return res.status(400).json({ success: false, message: 'La contraseña actual es incorrecta' });
      await user.update({ password: newPassword });
    }

    await user.update({
      fullName: fullName ?? user.fullName,
      department: department ?? user.department,
      brigadistaProfile: {
        ...user.brigadistaProfile,
        zone: zone ?? user.brigadistaProfile?.zone,
        team: team ?? user.brigadistaProfile?.team,
        community: community ?? user.brigadistaProfile?.community
      },
      notificationSettings: notificationSettings ?? user.notificationSettings
    });

    res.json({ success: true, message: newPassword ? 'Perfil y contraseña actualizados' : 'Perfil actualizado', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar perfil', error: error.message });
  }
};

// Crear reporte propio (brigadista)
exports.createReport = async (req, res) => {
  try {
    const {
      title, description, dueDate, periodStart, periodEnd,
      // Campos del formato oficial
      lugar, fecha, unidadAcademica, licenciatura, numeroCuenta,
      unidadReceptora, projectName, modalidad, numInforme, totalHours,
      objectives, participants, observations, evidences
    } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ success: false, message: 'Título y fecha límite son obligatorios' });
    }

    const report = await Report.create({
      assignedTo: req.user.id,
      assignedBy: req.user.id,
      assignedDate: new Date(),
      dueDate,
      title,
      description: description || '',
      periodStart: periodStart || null,
      periodEnd: periodEnd || null,
      // Campos del formato oficial
      studentName: req.user.fullName,
      academicUnit: unidadAcademica || '',
      career: licenciatura || '',
      accountNumber: numeroCuenta || '',
      dependencyName: unidadReceptora || '',
      projectName: projectName || '',
      totalHours: totalHours || 0,
      objectives: objectives || [],
      participants: participants || [],
      observations: observations || '',
      evidences: evidences || [],
      reportMonth: fecha ? new Date(fecha).toLocaleString('es', { month: 'long' }) : '',
      reportYear: fecha ? new Date(fecha).getFullYear() : new Date().getFullYear(),
      status: 'EN_ELABORACION',
      brigadistaInfo: {
        name: req.user.fullName,
        zone: req.user.brigadistaProfile?.zone || '',
        team: req.user.brigadistaProfile?.team || '',
        community: req.user.brigadistaProfile?.community || '',
        lugar: lugar || '',
        modalidad: modalidad || '',
        numInforme: numInforme || ''
      },
      workflowHistory: [{ state: 'EN_ELABORACION', date: new Date(), by: req.user.id, comments: 'Reporte creado por brigadista' }],
      auditTrail: [{ action: 'CREATE', by: req.user.id, date: new Date(), details: 'Reporte creado por brigadista' }]
    });

    res.status(201).json({ success: true, message: 'Reporte creado exitosamente', data: report });
  } catch (error) {
    console.error('Error al crear reporte:', error);
    res.status(500).json({ success: false, message: 'Error al crear reporte', error: error.message });
  }
};

// Obtener mis reportes asignados
exports.getMyReports = async (req, res) => {
  try {
    const { status } = req.query;
    
    const where = { assignedTo: req.user.id };
    
    if (status) {
      where.status = status;
    }

    const reports = await Report.findAll({
      where,
      include: [
        {
          model: User,
          as: 'supervisor',
          attributes: ['id', 'fullName', 'email']
        },
        {
          model: Attachment,
          as: 'attachments'
        }
      ],
      order: [['dueDate', 'ASC']]
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

// Obtener reporte específico
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findOne({
      where: {
        id,
        assignedTo: req.user.id
      },
      include: [
        {
          model: User,
          as: 'supervisor',
          attributes: ['id', 'fullName', 'email']
        },
        {
          model: Attachment,
          as: 'attachments'
        }
      ]
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error al obtener reporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reporte',
      error: error.message
    });
  }
};

// Actualizar reporte (elaborar/corregir)
exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, activities, observations, brigadistaInfo,
      unidadAcademica, licenciatura, numeroCuenta, unidadReceptora,
      projectName, totalHours, objectives, participants, evidences } = req.body;

    const report = await Report.findOne({
      where: {
        id,
        assignedTo: req.user.id,
        status: { [Op.in]: ['ASIGNADO', 'EN_ELABORACION', 'OBSERVADO'] }
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado o no editable'
      });
    }

    // Workflow:
    // - ASIGNADO -> EN_ELABORACION (inicia elaboración)
    // - OBSERVADO -> EN_ELABORACION (inicia correcciones)
    const shouldMoveToElaboracion = report.status === 'ASIGNADO' || report.status === 'OBSERVADO';
    const newStatus = shouldMoveToElaboracion ? 'EN_ELABORACION' : report.status;
    const workflowUpdate = shouldMoveToElaboracion
      ? [
          ...report.workflowHistory,
          {
            state: 'EN_ELABORACION',
            date: new Date(),
            by: req.user.id,
            comments:
              report.status === 'OBSERVADO'
                ? 'Brigadista inició correcciones'
                : 'Brigadista inició elaboración'
          }
        ]
      : report.workflowHistory;

    await report.update({
      description,
      activities,
      observations,
      brigadistaInfo: brigadistaInfo || report.brigadistaInfo,
      academicUnit: unidadAcademica ?? report.academicUnit,
      career: licenciatura ?? report.career,
      accountNumber: numeroCuenta ?? report.accountNumber,
      dependencyName: unidadReceptora ?? report.dependencyName,
      projectName: projectName ?? report.projectName,
      totalHours: totalHours ?? report.totalHours,
      objectives: objectives ?? report.objectives,
      participants: participants ?? report.participants,
      evidences: evidences ?? report.evidences,
      status: newStatus,
      version: report.version + 1,
      workflowHistory: workflowUpdate,
      auditTrail: [
        ...report.auditTrail,
        {
          action: 'EDIT',
          by: req.user.id,
          date: new Date(),
          details: 'Reporte actualizado'
        }
      ]
    });

    res.json({
      success: true,
      message: 'Reporte actualizado exitosamente',
      data: report
    });
  } catch (error) {
    console.error('Error al actualizar reporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar reporte',
      error: error.message
    });
  }
};

// Enviar reporte para revisión
exports.submitReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findOne({
      where: {
        id,
        assignedTo: req.user.id,
        status: { [Op.in]: ['EN_ELABORACION', 'OBSERVADO'] }
      },
      include: [{
        model: User,
        as: 'supervisor',
        attributes: ['id', 'fullName', 'email']
      }]
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado o no enviable'
      });
    }

    await report.update({
      status: 'ENVIADO',
      workflowHistory: [
        ...report.workflowHistory,
        {
          state: 'ENVIADO',
          date: new Date(),
          by: req.user.id,
          comments: 'Reporte enviado para revisión'
        }
      ],
      auditTrail: [
        ...report.auditTrail,
        {
          action: 'SUBMIT',
          by: req.user.id,
          date: new Date(),
          details: 'Reporte enviado para revisión'
        }
      ]
    });

    // Notificar al supervisor en tiempo real
    await createAndSendNotification({
      userId: report.assignedBy,
      type: 'REPORT_SUBMITTED',
      title: 'Reporte enviado para revisión',
      message: `${req.user.fullName} ha enviado el reporte: ${report.title}`,
      relatedReportId: report.id,
      priority: 'MEDIUM'
    });

    res.json({
      success: true,
      message: 'Reporte enviado para revisión',
      data: report
    });
  } catch (error) {
    console.error('Error al enviar reporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar reporte',
      error: error.message
    });
  }
};

// Subir evidencias/archivos adjuntos
exports.uploadAttachment = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findOne({
      where: {
        id,
        assignedTo: req.user.id
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }

    const attachment = await Attachment.create({
      reportId: report.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Archivo subido exitosamente',
      data: attachment
    });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir archivo',
      error: error.message
    });
  }
};

// Obtener estadísticas del brigadista
exports.getMyStats = async (req, res) => {
  try {
    const brigadistaId = req.user.id;

    const totalAssigned = await Report.count({
      where: { assignedTo: brigadistaId }
    });

    const pending = await Report.count({
      where: {
        assignedTo: brigadistaId,
        status: { [Op.in]: ['ASIGNADO', 'EN_ELABORACION', 'OBSERVADO'] }
      }
    });

    const approved = await Report.count({
      where: {
        assignedTo: brigadistaId,
        status: 'APROBADO'
      }
    });

    const overdue = await Report.count({
      where: {
        assignedTo: brigadistaId,
        dueDate: { [Op.lt]: new Date() },
        status: { [Op.notIn]: ['APROBADO'] }
      }
    });

    res.json({
      success: true,
      data: {
        totalAssigned,
        pending,
        approved,
        overdue
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
