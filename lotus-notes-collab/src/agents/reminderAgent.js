const { Report, User, Notification } = require('../models');
const { Op } = require('sequelize');
const { createAndSendNotification } = require('../utils/notificationHelper');

exports.run = async () => {
  try {
    console.log('[Agente Recordatorios] Ejecutando...');
    
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    // Buscar reportes próximos a vencer
    const reportsDueSoon = await Report.findAll({
      where: {
        dueDate: { 
          [Op.between]: [today, threeDaysFromNow] 
        },
        status: { 
          [Op.in]: ['ASIGNADO', 'EN_ELABORACION', 'OBSERVADO'] 
        }
      },
      include: [{
        model: User,
        as: 'brigadista',
        attributes: ['id', 'fullName', 'email']
      }]
    });
    
    for (const report of reportsDueSoon) {
      try {
        const daysRemaining = Math.ceil(
          (report.dueDate - today) / (1000 * 60 * 60 * 24)
        );

        await createAndSendNotification({
          userId: report.assignedTo,
          type: 'REMINDER',
          title: 'Recordatorio de entrega',
          message: `El reporte "${report.title}" vence en ${daysRemaining} día(s)`,
          relatedReportId: report.id,
          priority: daysRemaining <= 1 ? 'HIGH' : 'MEDIUM'
        });

        console.log(`[Agente Recordatorios] Notificación enviada a ${report.brigadista?.fullName || report.assignedTo}`);
      } catch (innerError) {
        console.error(`[Agente Recordatorios] Error procesando reporte ${report.id}:`, innerError.message);
      }
    }
    
    console.log(`[Agente Recordatorios] Completado. ${reportsDueSoon.length} recordatorios enviados.`);
  } catch (error) {
    console.error('[Agente Recordatorios] Error:', error);
  }
};
