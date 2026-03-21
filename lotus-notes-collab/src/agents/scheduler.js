const cron = require('node-cron');
const reminderAgent = require('./reminderAgent');
const overdueAgent = require('./overdueAgent');

// Inicializar agentes programados
exports.initAgents = () => {
  console.log('[Scheduler] Inicializando agentes automáticos...');

  const safeRun = async (name, fn) => {
    try {
      await fn();
    } catch (error) {
      console.error(`[Scheduler] Error en agente "${name}":`, error.message);
    }
  };

  // Recordatorios diarios a las 8:00 AM
  cron.schedule('0 8 * * *', () => safeRun('recordatorios', () => reminderAgent.run()));

  // Alertas de vencimiento diarias a las 9:00 AM
  cron.schedule('0 9 * * *', () => safeRun('vencimientos', () => overdueAgent.run()));

  // Para desarrollo: ejecutar cada hora
  if (process.env.NODE_ENV === 'development') {
    cron.schedule('0 * * * *', async () => {
      await safeRun('recordatorios-dev', () => reminderAgent.run());
      await safeRun('vencimientos-dev', () => overdueAgent.run());
    });
  }

  console.log('[Scheduler] Agentes automáticos configurados correctamente');
};
