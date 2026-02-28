require('dotenv').config();
const { User } = require('./src/models');
const { connectDB } = require('./src/config/database');

async function createInitialUsers() {
  try {
    await connectDB();
    
    console.log('Creando usuarios iniciales...\n');
    
    // Crear Supervisor
    const supervisor = await User.create({
      username: 'supervisor1',
      email: 'supervisor@example.com',
      password: 'supervisor123',
      fullName: 'Juan Pérez Supervisor',
      role: 'supervisor',
      supervisorProfile: {
        managedZones: ['Zona Norte', 'Zona Centro'],
        department: 'Operaciones'
      }
    });
    console.log('✓ Supervisor creado:', supervisor.username);
    
    // Crear Brigadista 1
    const brigadista1 = await User.create({
      username: 'brigadista1',
      email: 'brigadista1@example.com',
      password: 'brigadista123',
      fullName: 'María García Brigadista',
      role: 'brigadista',
      brigadistaProfile: {
        zone: 'Zona Norte',
        team: 'Equipo A',
        supervisorId: supervisor.id,
        startDate: new Date()
      }
    });
    console.log('✓ Brigadista 1 creado:', brigadista1.username);
    
    // Crear Brigadista 2
    const brigadista2 = await User.create({
      username: 'brigadista2',
      email: 'brigadista2@example.com',
      password: 'brigadista123',
      fullName: 'Carlos López Brigadista',
      role: 'brigadista',
      brigadistaProfile: {
        zone: 'Zona Centro',
        team: 'Equipo B',
        supervisorId: supervisor.id,
        startDate: new Date()
      }
    });
    console.log('✓ Brigadista 2 creado:', brigadista2.username);
    
    // Crear Admin
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      fullName: 'Administrador Sistema',
      role: 'admin'
    });
    console.log('✓ Admin creado:', admin.username);
    
    console.log('\n✅ Usuarios creados exitosamente!');
    console.log('\nCredenciales:');
    console.log('─────────────────────────────────────');
    console.log('Supervisor:');
    console.log('  Usuario: supervisor1');
    console.log('  Password: supervisor123');
    console.log('\nBrigadista 1:');
    console.log('  Usuario: brigadista1');
    console.log('  Password: brigadista123');
    console.log('\nBrigadista 2:');
    console.log('  Usuario: brigadista2');
    console.log('  Password: brigadista123');
    console.log('\nAdmin:');
    console.log('  Usuario: admin');
    console.log('  Password: admin123');
    console.log('─────────────────────────────────────\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error al crear usuarios:', error);
    process.exit(1);
  }
}

createInitialUsers();
