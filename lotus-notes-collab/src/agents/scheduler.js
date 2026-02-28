const cron = require('node-cron');
const reminderAgent = require('./reminderAgent');
const overdueAgent = require('./overdueAgent');

// Inicializar agentes programados
exports.initAgents = () => {
  console.log('[Scheduler] Inicializando agentes automáticos...');
  
  // Recordatorios diarios a las 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('[Scheduler] Ejecutando agente de recordatorios...');
    await reminderAgent.run();
  });
  
  // Alertas de vencimiento diarias a las 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('[Scheduler] Ejecutando agente de alertas...');
    await overdueAgent.run();
  });
  
  // Para desarrollo: ejecutar cada hora
  if (process.env.NODE_ENV === 'development') {
    cron.schedule('0 * * * *', async () => {
      console.log('[Scheduler] Ejecutando agentes (modo desarrollo)...');
      await reminderAgent.run();
      await overdueAgent.run();
    });
  }
  
  console.log('[Scheduler] Agentes automáticos configurados correctamente');
};
