const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  documentType: {
    type: DataTypes.STRING,
    defaultValue: 'Report'
  },
  
  // Asignación (Workflow Lotus Domino)
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  assignedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  assignedDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  
  // Contenido del Reporte
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  periodStart: {
    type: DataTypes.DATE,
    allowNull: true
  },
  periodEnd: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Información del Brigadista
  brigadistaInfo: {
    type: DataTypes.JSON,
    defaultValue: {}
    // { name, zone, team, community }
  },
  
  // Actividades realizadas
  activities: {
    type: DataTypes.JSON,
    defaultValue: []
    // [{ date, description, location, findings }]
  },
  
  // Datos del Estudiante (compatibilidad con sistema anterior)
  studentName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  academicUnit: {
    type: DataTypes.STRING,
    allowNull: true
  },
  career: {
    type: DataTypes.STRING,
    allowNull: true
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dependencyName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  projectName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  totalHours: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  
  // II. Objetivos, Metas y Actividades (JSON)
  objectives: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  
  // III. Participantes y Beneficiados (JSON)
  participants: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  
  // IV. Observaciones
  observations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // V. Evidencias (JSON - URLs de archivos)
  evidences: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  
  // Workflow (Estados Lotus Domino)
  status: {
    type: DataTypes.ENUM(
      'ASIGNADO',
      'EN_ELABORACION',
      'ENVIADO',
      'EN_REVISION',
      'OBSERVADO',
      'APROBADO',
      'draft',
      'submitted',
      'approved',
      'rejected'
    ),
    defaultValue: 'ASIGNADO'
  },
  workflowHistory: {
    type: DataTypes.JSON,
    defaultValue: []
    // [{ state, date, by, comments }]
  },
  
  // Metadata
  reportMonth: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reportYear: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  
  // Revisión del Supervisor
  reviewedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reviewComments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reviewObservations: {
    type: DataTypes.JSON,
    defaultValue: []
    // [{ section, comment, resolved }]
  },
  
  // Versionado
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  previousVersionId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  
  // Auditoría
  auditTrail: {
    type: DataTypes.JSON,
    defaultValue: []
    // [{ action, by, date, details }]
  }
}, {
  tableName: 'reports',
  timestamps: true
});

module.exports = Report;
