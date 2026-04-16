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
 * En desarrollo se usa un límite más alto para evitar 429 con React StrictMode.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 200 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.'
  }
});

module.exports = { authLimiter, apiLimiter };
