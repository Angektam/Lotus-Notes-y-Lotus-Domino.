const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('admin', 'student', 'supervisor', 'brigadista'),
    defaultValue: 'student'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'away'),
    defaultValue: 'active'
  },
  // Perfil de Brigadista
  brigadistaProfile: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null
    // { zone, team, supervisorId, startDate, community }
  },
  // Perfil de Supervisor
  supervisorProfile: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null
    // { managedZones, department }
  },
  // Configuración de notificaciones
  notificationSettings: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: { email: true, inApp: true, sms: false }
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

User.prototype.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;
