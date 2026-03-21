require('dotenv').config();
const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');
const Report = require('./src/models/Report');
const Note = require('./src/models/Note');
const Task = require('./src/models/Task');
const Calendar = require('./src/models/Calendar');
const Message = require('./src/models/Message');
const Notification = require('./src/models/Notification');

async function initDatabase() {
  try {
    console.log('🔄 Inicializando base de datos SQLite...');

    // Deshabilitar foreign key checks para poder borrar tablas
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✓ Tablas creadas exitosamente');

    // Crear usuarios de prueba (sin hashear, el modelo lo hace automáticamente)
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      fullName: 'Administrador',
      role: 'admin',
      department: 'Administración'
    });

    const supervisor = await User.create({
      username: 'supervisor',
      email: 'supervisor@example.com',
      password: 'admin123',
      fullName: 'Supervisor Principal',
      role: 'supervisor',
      department: 'Supervisión'
    });

    const brigadista = await User.create({
      username: 'brigadista',
      email: 'brigadista@example.com',
      password: 'admin123',
      fullName: 'Brigadista de Prueba',
      role: 'brigadista',
      department: 'Brigada'
    });

    const student = await User.create({
      username: 'estudiante',
      email: 'estudiante@example.com',
      password: 'admin123',
      fullName: 'Estudiante de Prueba',
      role: 'student',
      department: 'Servicio Social'
    });

    console.log('✓ Usuarios creados:');
    console.log('  - admin / admin123 (Administrador)');
    console.log('  - supervisor / admin123 (Supervisor)');
    console.log('  - brigadista / admin123 (Brigadista)');
    console.log('  - estudiante / admin123 (Estudiante)');

    // Crear un reporte de ejemplo
    await Report.create({
      // Campos requeridos del workflow
      assignedTo: student.id,
      assignedBy: admin.id,
      assignedDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      title: 'Informe Mensual - Enero 2024',
      description: 'Informe de actividades del servicio social',
      
      // Información del estudiante
      studentName: 'Estudiante de Prueba',
      academicUnit: 'Facultad de Ingeniería',
      career: 'Ingeniería en Sistemas',
      accountNumber: '123456789',
      dependencyName: 'Departamento de Desarrollo',
      projectName: 'Sistema de Gestión de Servicio Social',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      totalHours: 40,
      objectives: [
        {
          objective: 'Desarrollar sistema web',
          goals: 'Completar módulo de reportes',
          activities: 'Programación y pruebas'
        }
      ],
      participants: [
        {
          activity: 'Capacitación',
          count: 15
        }
      ],
      observations: 'Proyecto en desarrollo exitoso',
      reportMonth: 'Enero',
      reportYear: 2024,
      status: 'submitted'
    });

    console.log('✓ Reporte de ejemplo creado');

    // Crear una nota de ejemplo
    await Note.create({
      userId: student.id,
      title: 'Nota de Bienvenida',
      content: 'Esta es una nota de ejemplo para probar el sistema',
      category: 'General',
      priority: 'medium',
      isPublic: false
    });

    console.log('✓ Nota de ejemplo creada');

    // Crear una tarea de ejemplo
    await Task.create({
      title: 'Completar informe mensual',
      description: 'Entregar el informe de actividades del mes',
      priority: 'high',
      status: 'pending',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdBy: admin.id,
      assignedTo: student.id
    });

    console.log('✓ Tarea de ejemplo creada');

    // Crear un evento de calendario
    await Calendar.create({
      userId: student.id,
      title: 'Reunión de seguimiento',
      description: 'Revisión de avances del servicio social',
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      location: 'Sala de juntas',
      eventType: 'meeting'
    });

    console.log('✓ Evento de calendario creado');

    console.log('\n✅ Base de datos SQLite inicializada correctamente');
    console.log('📁 Archivo: database.sqlite');
    console.log('\n🚀 Puedes iniciar el servidor con: npm start');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    process.exit(1);
  }
}

initDatabase();
