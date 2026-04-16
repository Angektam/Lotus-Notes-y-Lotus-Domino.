const { Report, User, Notification } = require('../models');
const { Op } = require('sequelize');
const { createAndSendNotification } = require('../utils/notificationHelper');

exports.run = async () => {
  try {
    console.log('[Agente Vencimientos] Ejecutando...');
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    const overdueReports = await Report.findAll({
      where: {
        dueDate: { [Op.lt]: today },
        status: { [Op.notIn]: ['APROBADO'] }
      },
      include: [
        { model: User, as: 'brigadista', attributes: ['id', 'fullName', 'email'] },
        { model: User, as: 'supervisor', attributes: ['id', 'fullName', 'email'] }
      ]
    });

    let alertCount = 0;

    for (const report of overdueReports) {
      try {
        const daysOverdue = Math.ceil((today - report.dueDate) / (1000 * 60 * 60 * 24));

        // Verificar si ya se envió notificación hoy para este reporte al brigadista
        const existingBrig = await Notification.findOne({
          where: {
            userId: report.assignedTo,
            type: 'OVERDUE',
            relatedReportId: report.id,
            createdAt: { [Op.gte]: new Date(todayStr) }
          }
        });

        if (!existingBrig) {
          await createAndSendNotification({
            userId: report.assignedTo,
            type: 'OVERDUE',
            title: 'Reporte vencido',
            message: `El reporte "${report.title}" está vencido por ${daysOverdue} día(s)`,
            relatedReportId: report.id,
            priority: 'HIGH'
          });
          alertCount++;
        }

        // Notificar al supervisor solo si existe y no se notificó hoy
        if (report.assignedBy) {
          const existingSup = await Notification.findOne({
            where: {
              userId: report.assignedBy,
              type: 'OVERDUE',
              relatedReportId: report.id,
              createdAt: { [Op.gte]: new Date(todayStr) }
            }
          });

          if (!existingSup) {
            await createAndSendNotification({
              userId: report.assignedBy,
              type: 'OVERDUE',
              title: 'Reporte vencido - Alerta',
              message: `Reporte de ${report.brigadista?.fullName || 'brigadista'} vencido por ${daysOverdue} día(s)`,
              relatedReportId: report.id,
              priority: 'HIGH'
            });
            alertCount++;
          }
        }
      } catch (innerError) {
        console.error(`[Agente Vencimientos] Error procesando reporte ${report.id}:`, innerError.message);
      }
    }

    console.log(`[Agente Vencimientos] Completado. ${alertCount} alertas nuevas (${overdueReports.length} reportes vencidos).`);
  } catch (error) {
    console.error('[Agente Vencimientos] Error:', error);
  }
};
