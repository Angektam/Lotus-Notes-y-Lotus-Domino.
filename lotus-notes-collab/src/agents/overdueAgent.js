const { Report, User, Notification } = require('../models');
const { Op } = require('sequelize');

exports.run = async () => {
  try {
    console.log('[Agente Vencimientos] Ejecutando...');
    
    const today = new Date();
    
    // Buscar reportes vencidos
    const overdueReports = await Report.findAll({
      where: {
        dueDate: { [Op.lt]: today },
        status: { [Op.notIn]: ['APROBADO'] }
      },
      include: [
        {
          model: User,
          as: 'brigadista',
          attributes: ['id', 'fullName', 'email']
        },
        {
          model: User,
          as: 'supervisor',
          attributes: ['id', 'fullName', 'email']
        }
      ]
    });
    
    for (const report of overdueReports) {
      const daysOverdue = Math.ceil(
        (today - report.dueDate) / (1000 * 60 * 60 * 24)
      );
      
      // Notificar al brigadista
      await Notification.create({
        userId: report.assignedTo,
        type: 'OVERDUE',
        title: 'Reporte vencido',
        message: `El reporte "${report.title}" está vencido por ${daysOverdue} día(s)`,
        relatedReportId: report.id,
        priority: 'HIGH'
      });
      
      // Notificar al supervisor
      await Notification.create({
        userId: report.assignedBy,
        type: 'OVERDUE',
        title: 'Reporte vencido - Alerta',
        message: `Reporte de ${report.brigadista.fullName} vencido por ${daysOverdue} día(s)`,
        relatedReportId: report.id,
        priority: 'HIGH'
      });
      
      console.log(`[Agente Vencimientos] Alertas enviadas para reporte ${report.id}`);
    }
    
    console.log(`[Agente Vencimientos] Completado. ${overdueReports.length} alertas enviadas.`);
  } catch (error) {
    console.error('[Agente Vencimientos] Error:', error);
  }
};
