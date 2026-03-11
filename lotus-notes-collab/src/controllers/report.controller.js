const { Report, User } = require('../models');
const { Op } = require('sequelize');

// Crear nuevo informe
exports.createReport = async (req, res) => {
  try {
    const {
      studentName,
      academicUnit,
      career,
      accountNumber,
      dependencyName,
      projectName,
      startDate,
      endDate,
      totalHours,
      objectives,
      participants,
      observations,
      reportMonth,
      reportYear
    } = req.body;

    const report = await Report.create({
      userId: req.user.id,
      studentName,
      academicUnit,
      career,
      accountNumber,
      dependencyName,
      projectName,
      startDate,
      endDate,
      totalHours,
      objectives: objectives || [],
      participants: participants || [],
      observations,
      reportMonth,
      reportYear,
      status: 'draft'
    });

    res.status(201).json({
      success: true,
      message: 'Informe creado exitosamente',
      data: report
    });
  } catch (error) {
    console.error('Error al crear informe:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el informe',
      error: error.message
    });
  }
};

// Obtener todos los informes del usuario
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.findAll({
      where: { userId: req.user.id },
      order: [['reportYear', 'DESC'], ['reportMonth', 'DESC']],
      include: [{
        model: User,
        as: 'student',
        attributes: ['id', 'fullName', 'email']
      }]
    });

    res.json({
      success: true,
      data: reports
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

// Obtener un informe específico
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [{
        model: User,
        as: 'student',
        attributes: ['id', 'fullName', 'email']
      }]
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Informe no encontrado'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error al obtener informe:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el informe',
      error: error.message
    });
  }
};

// Actualizar informe
exports.updateReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Informe no encontrado'
      });
    }

    const {
      studentName,
      academicUnit,
      career,
      accountNumber,
      dependencyName,
      projectName,
      startDate,
      endDate,
      totalHours,
      objectives,
      participants,
      observations,
      status
    } = req.body;

    await report.update({
      studentName,
      academicUnit,
      career,
      accountNumber,
      dependencyName,
      projectName,
      startDate,
      endDate,
      totalHours,
      objectives,
      participants,
      observations,
      status
    });

    res.json({
      success: true,
      message: 'Informe actualizado exitosamente',
      data: report
    });
  } catch (error) {
    console.error('Error al actualizar informe:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el informe',
      error: error.message
    });
  }
};

// Eliminar informe
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Informe no encontrado'
      });
    }

    await report.destroy();

    res.json({
      success: true,
      message: 'Informe eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar informe:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el informe',
      error: error.message
    });
  }
};

// Agregar evidencia al informe
exports.addEvidence = async (req, res) => {
  try {
    const report = await Report.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Informe no encontrado'
      });
    }

    const { filename, url, type } = req.body;
    
    const evidences = report.evidences || [];
    evidences.push({ filename, url, type });

    await report.update({ evidences });

    res.json({
      success: true,
      message: 'Evidencia agregada exitosamente',
      data: report
    });
  } catch (error) {
    console.error('Error al agregar evidencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar la evidencia',
      error: error.message
    });
  }
};

// Enviar informe (cambiar estado a submitted)
exports.submitReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Informe no encontrado'
      });
    }

    await report.update({ status: 'submitted' });

    res.json({
      success: true,
      message: 'Informe enviado exitosamente',
      data: report
    });
  } catch (error) {
    console.error('Error al enviar informe:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar el informe',
      error: error.message
    });
  }
};
