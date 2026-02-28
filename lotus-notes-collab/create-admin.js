require('dotenv').config();
const { User } = require('./src/models');
const { connectDB } = require('./src/config/database');

async function createAdmin() {
  try {
    await connectDB();
    
    // Crear usuario administrador
    const admin = await User.create({
      username: 'admin',
      email: 'admin@serviciosocial.com',
      password: 'admin123',
      fullName: 'Administrador del Sistema',
      department: 'Administración',
      role: 'admin'
    });

    console.log('✅ Usuario administrador creado exitosamente:');
    console.log('   Email: admin@serviciosocial.com');
    console.log('   Password: admin123');
    console.log('   Rol: admin');
    
    // Crear usuario estudiante de prueba
    const student = await User.create({
      username: 'estudiante1',
      email: 'estudiante@serviciosocial.com',
      password: 'estudiante123',
      fullName: 'Juan Pérez García',
      department: 'Ingeniería',
      role: 'student'
    });

    console.log('\n✅ Usuario estudiante creado exitosamente:');
    console.log('   Email: estudiante@serviciosocial.com');
    console.log('   Password: estudiante123');
    console.log('   Rol: student');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear usuarios:', error.message);
    process.exit(1);
  }
}

createAdmin();
