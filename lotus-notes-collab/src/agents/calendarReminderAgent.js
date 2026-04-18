const { Calendar } = require('../models');
const { Op } = require('sequelize');
const { createAndSendNotification } = require('../utils/notificationHelper');

exports.run = async () => {
  try {
    const now = new Date();
    const in15 = new Date(now.getTime() + 15 * 60 * 1000);

    const upcoming = await Calendar.findAll({
      where: {
        eventType: 'reminder',
        startDate: { [Op.between]: [now, in15] },
        notified: false
      }
    });

    for (const event of upcoming) {
      await createAndSendNotification({
        userId: event.userId,
        type: 'REMINDER',
        title: 'Recordatorio: ' + event.title,
        message: event.description || 'Tienes un recordatorio programado',
        priority: 'MEDIUM'
      });
      await event.update({ notified: true });
    }

    if (upcoming.length > 0) console.log('[Recordatorios] ' + upcoming.length + ' notificaciones enviadas');
  } catch(err) {
    console.error('[Recordatorios] Error:', err.message);
  }
};
