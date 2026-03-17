const User = require('./User');
const Note = require('./Note');
const Document = require('./Document');
const Task = require('./Task');
const Calendar = require('./Calendar');
const Message = require('./Message');
const Report = require('./Report');
const Attachment = require('./Attachment');
const Notification = require('./Notification');

// Relaciones existentes
User.hasMany(Note, { foreignKey: 'userId', as: 'notes' });
Note.belongsTo(User, { foreignKey: 'userId', as: 'author' });

User.hasMany(Document, { foreignKey: 'userId', as: 'documents' });
Document.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

User.hasMany(Task, { foreignKey: 'createdBy', as: 'createdTasks' });
User.hasMany(Task, { foreignKey: 'assignedTo', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

User.hasMany(Calendar, { foreignKey: 'userId', as: 'events' });
Calendar.belongsTo(User, { foreignKey: 'userId', as: 'organizer' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// Relaciones de Reportes (Workflow Lotus Domino)
// NOTA: Un FK solo puede tener UN alias en belongsTo para evitar conflictos en Sequelize.
// Usamos 'brigadista' como alias principal para assignedTo (el que elabora el reporte).
User.hasMany(Report, { foreignKey: 'assignedTo', as: 'assignedReports' });
User.hasMany(Report, { foreignKey: 'assignedBy', as: 'createdReports' });
User.hasMany(Report, { foreignKey: 'reviewedBy', as: 'reviewedReports' });
User.hasMany(Report, { foreignKey: 'assignedTo', as: 'reports' });

Report.belongsTo(User, { foreignKey: 'assignedTo', as: 'brigadista' });
Report.belongsTo(User, { foreignKey: 'assignedBy', as: 'supervisor' });
Report.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

// Relaciones de Attachments
Report.hasMany(Attachment, { foreignKey: 'reportId', as: 'attachments' });
Attachment.belongsTo(Report, { foreignKey: 'reportId', as: 'report' });
Attachment.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

// Relaciones de Notificaciones
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Notification.belongsTo(Report, { foreignKey: 'relatedReportId', as: 'relatedReport' });

module.exports = {
  User,
  Note,
  Document,
  Task,
  Calendar,
  Message,
  Report,
  Attachment,
  Notification
};
