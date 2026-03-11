const { Sequelize } = require('sequelize');
const path = require('path');

// Usar SQLite con archivo local
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Conexión a SQLite establecida');
    console.log('✓ Base de datos: database.sqlite');
    
    await sequelize.sync({ alter: false });
    console.log('✓ Modelos sincronizados');
  } catch (error) {
    console.error('✗ Error de conexión:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
