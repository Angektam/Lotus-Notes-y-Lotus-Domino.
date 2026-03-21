const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'lotus_notes',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Conexión a MySQL establecida');
    console.log(`✓ Base de datos: ${process.env.DB_NAME || 'lotus_notes'}`);
    
    await sequelize.sync({ alter: false });
    console.log('✓ Modelos sincronizados');
  } catch (error) {
    console.error('✗ Error de conexión:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
