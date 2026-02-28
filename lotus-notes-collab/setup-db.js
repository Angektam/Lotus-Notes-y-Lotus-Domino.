require('dotenv').config();
const mysql = require('mysql2/promise');

async function setupDatabase() {
  console.log('==========================================');
  console.log('Setup Base de Datos Lotus Domino');
  console.log('==========================================\n');

  try {
    // Conectar a MySQL sin especificar base de datos
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('✓ Conectado a MySQL');

    // Crear base de datos si no existe
    const dbName = process.env.DB_NAME || 'lotus_domino_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    
    console.log(`✓ Base de datos '${dbName}' creada/verificada`);

    await connection.end();

    console.log('\n==========================================');
    console.log('✅ Setup completado exitosamente');
    console.log('==========================================\n');
    console.log('Siguiente paso:');
    console.log('  npm run dev\n');

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error al configurar base de datos:', error.message);
    console.error('\nVerifica:');
    console.error('  1. MySQL está corriendo');
    console.error('  2. Credenciales en .env son correctas');
    console.error('  3. Usuario tiene permisos para crear bases de datos\n');
    process.exit(1);
  }
}

setupDatabase();
