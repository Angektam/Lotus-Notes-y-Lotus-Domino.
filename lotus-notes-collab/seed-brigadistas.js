require('dotenv').config();
const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');
const Report = require('./src/models/Report');
const Notification = require('./src/models/Notification');

const ZONAS = ['Norte', 'Sur', 'Este', 'Oeste', 'Centro'];
const EQUIPOS = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];
const DEPARTAMENTOS = ['Brigada Norte', 'Brigada Sur', 'Brigada Este', 'Brigada Oeste', 'Brigada Centro'];
const ESTADOS_REPORTE = ['ASIGNADO', 'EN_ELABORACION', 'ENVIADO', 'APROBADO', 'OBSERVADO'];

const NOMBRES = [
  'Carlos Mendoza','Ana García','Luis Hernández','María López','José Martínez',
  'Laura Rodríguez','Miguel Pérez','Sofía González','Diego Torres','Valentina Ramírez',
  'Andrés Flores','Camila Díaz','Fernando Morales','Isabella Vargas','Ricardo Jiménez',
  'Daniela Castro','Eduardo Romero','Natalia Ortiz','Alejandro Ruiz','Paola Gutiérrez',
  'Sebastián Reyes','Gabriela Sánchez','Mateo Álvarez','Valeria Núñez','Pablo Herrera',
  'Lucía Medina','Javier Aguilar','Mariana Vega','Nicolás Ramos','Fernanda Cruz',
  'Emilio Moreno','Adriana Suárez','Rodrigo Delgado','Claudia Fuentes','Tomás Paredes',
  'Verónica Ibáñez','Arturo Cabrera','Mónica Espinoza','Héctor Navarro','Patricia Ríos',
  'Ernesto Salinas','Beatriz Peña','Guillermo Lara','Silvia Campos','Raúl Contreras'
];

function slug(name) {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '.');
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysAgo, daysAhead = 0) {
  const now = Date.now();
  const from = now - daysAgo * 86400000;
  const to = now + daysAhead * 86400000;
  return new Date(from + Math.random() * (to - from));
}

async function seed() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✓ Conexión establecida\n');

    // Buscar o crear supervisor
    let supervisor = await User.findOne({ where: { role: 'supervisor' } });
    if (!supervisor) {
      supervisor = await User.create({
        username: 'supervisor',
        email: 'supervisor@example.com',
        password: 'admin123',
        fullName: 'Supervisor Principal',
        role: 'supervisor',
        department: 'Supervisión',
        supervisorProfile: { managedZones: ZONAS, department: 'Supervisión' }
      });
      console.log('✓ Supervisor creado');
    } else {
      console.log('✓ Supervisor existente encontrado:', supervisor.username);
    }

    // Crear 45 brigadistas
    const brigadistas = [];
    let creados = 0;
    let omitidos = 0;

    for (let i = 0; i < NOMBRES.length; i++) {
      const nombre = NOMBRES[i];
      const username = `${slug(nombre)}.${i + 1}`;
      const email = `${slug(nombre)}.${i + 1}@brigada.com`;
      const zona = randomItem(ZONAS);
      const equipo = randomItem(EQUIPOS);

      const existe = await User.findOne({ where: { email } });
      if (existe) {
        brigadistas.push(existe);
        omitidos++;
        continue;
      }

      const b = await User.create({
        username,
        email,
        password: 'brigada123',
        fullName: nombre,
        role: 'brigadista',
        department: `Brigada ${zona}`,
        status: Math.random() > 0.1 ? 'active' : 'away',
        brigadistaProfile: {
          zone: zona,
          team: equipo,
          supervisorId: supervisor.id,
          startDate: randomDate(180, 0)
        }
      });

      brigadistas.push(b);
      creados++;
    }

    console.log(`✓ Brigadistas creados: ${creados} | Existentes omitidos: ${omitidos}`);
    console.log(`  Total brigadistas disponibles: ${brigadistas.length}\n`);

    // Crear 2-3 reportes por brigadista
    let reportesCreados = 0;
    const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                   'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

    for (const b of brigadistas) {
      const numReportes = 2 + Math.floor(Math.random() * 2); // 2 o 3

      for (let r = 0; r < numReportes; r++) {
        const mesIdx = Math.floor(Math.random() * 12);
        const estado = randomItem(ESTADOS_REPORTE);
        const asignado = randomDate(90, 0);
        const vence = new Date(asignado.getTime() + 30 * 86400000);

        await Report.create({
          assignedTo: b.id,
          assignedBy: supervisor.id,
          assignedDate: asignado,
          dueDate: vence,
          title: `Informe ${MESES[mesIdx]} 2025 - ${b.brigadistaProfile?.zone || 'General'}`,
          description: `Reporte mensual de actividades de brigada zona ${b.brigadistaProfile?.zone}`,
          periodStart: asignado,
          periodEnd: vence,
          status: estado,
          brigadistaInfo: {
            name: b.fullName,
            zone: b.brigadistaProfile?.zone || '',
            team: b.brigadistaProfile?.team || ''
          },
          activities: [
            {
              date: asignado,
              description: 'Visita de campo y levantamiento de datos',
              location: `Zona ${b.brigadistaProfile?.zone}`,
              findings: 'Sin novedades relevantes'
            }
          ],
          totalHours: 20 + Math.floor(Math.random() * 60),
          reportMonth: MESES[mesIdx],
          reportYear: 2025,
          workflowHistory: [
            { state: 'ASIGNADO', date: asignado, by: supervisor.id, comments: 'Reporte asignado' }
          ],
          auditTrail: [
            { action: 'CREATE', by: supervisor.id, date: asignado, details: 'Creado por seed' }
          ]
        });

        reportesCreados++;
      }
    }

    console.log(`✓ Reportes creados: ${reportesCreados}`);

    // Crear notificaciones de muestra
    let notiCreadas = 0;
    for (const b of brigadistas.slice(0, 10)) {
      await Notification.create({
        userId: b.id,
        type: 'REPORT_ASSIGNED',
        title: 'Nuevo reporte asignado',
        message: `Se te ha asignado un reporte de brigada`,
        priority: 'MEDIUM',
        read: false
      });
      notiCreadas++;
    }

    console.log(`✓ Notificaciones de muestra: ${notiCreadas}`);

    console.log('\n✅ Seed completado exitosamente');
    console.log('─────────────────────────────────────');
    console.log(`  Brigadistas totales : ${brigadistas.length}`);
    console.log(`  Reportes totales    : ${reportesCreados}`);
    console.log('\n  Credenciales brigadistas:');
    console.log('  email   : <nombre>.<n>@brigada.com');
    console.log('  password: brigada123');
    console.log('─────────────────────────────────────');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seed();
