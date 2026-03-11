const { Notification, Report } = require('../models');
const { sendNotificationToUser } = require('../config/socket');

// Obtener notificaciones del usuario
exports.getNotifications = async (req, res) => {
  try {
    const { read } = req.query;
    
    const where = { userId: req.user.id };
    
    if (read !== undefined) {
      where.read = read === 'true';
    }

    const notifications = await Notification.findAll({
      where,
      include: [{
        model: Report,
        as: 'relatedReport',
        attributes: ['id', 'title', 'status']
      }],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones',
      error: error.message
    });
  }
};

// Marcar notificación como leída
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    await notification.update({
      read: true,
      readAt: new Date()
    });

    res.json({
      success: true,
      message: 'Notificación marcada como leída',
      data: notification
    });
  } catch (error) {
    console.error('Error al marcar notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar notificación',
      error: error.message
    });
  }
};

// Marcar todas como leídas
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { read: true, readAt: new Date() },
      { where: { userId: req.user.id, read: false } }
    );

    res.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas'
    });
  } catch (error) {
    console.error('Error al marcar notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar notificaciones',
      error: error.message
    });
  }
};

// Eliminar notificación
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    await notification.destroy();

    res.json({
      success: true,
      message: 'Notificación eliminada'
    });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar notificación',
      error: error.message
    });
  }
};

// Obtener contador de notificaciones no leídas
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({
      where: {
        userId: req.user.id,
        read: false
      }
    });

    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('Error al obtener contador:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener contador',
      error: error.message
    });
  }
};
