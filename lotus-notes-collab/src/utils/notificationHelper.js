const { Notification } = require('../models');
const { sendNotificationToUser } = require('../config/socket');

// Helper para crear y enviar notificaciones
const createAndSendNotification = async (notificationData) => {
  try {
    // Crear notificación en BD
    const notification = await Notification.create(notificationData);

    // Enviar en tiempo real via Socket.io
    sendNotificationToUser(notificationData.userId, {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      relatedReportId: notification.relatedReportId,
      createdAt: notification.createdAt
    });

    return notification;
  } catch (error) {
    console.error('Error al crear notificación:', error);
    throw error;
  }
};

module.exports = { createAndSendNotification };
