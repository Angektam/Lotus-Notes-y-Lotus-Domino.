const rateLimit = require('express-rate-limit');

/**
 * Rate limiter para rutas de autenticación.
 * Máximo 10 intentos por IP en 15 minutos.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.'
  },
  skipSuccessfulRequests: true // solo cuenta los fallidos
});

/**
 * Rate limiter general para la API.
 * Máximo 200 requests por IP en 15 minutos.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.'
  }
});

module.exports = { authLimiter, apiLimiter };
