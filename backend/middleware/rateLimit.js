const rateLimit = require('express-rate-limit');

function jsonRateLimitHandler(message) {
  return (req, res) => {
    res.status(429).json({
      success: false,
      error: message,
    });
  };
}

// Rate limiter global: 100 req/15min por IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: 'Demasiadas solicitudes desde esta IP, intenta más tarde.',
  standardHeaders: true, // Retorna RateLimit-* headers
  legacyHeaders: false, // Desactiva X-RateLimit-* headers
  skip: (req) => process.env.NODE_ENV !== 'production', // Desactiva en desarrollo
  keyGenerator: (req) => {
    // En Vercel, usar X-Forwarded-For para obtener IP real
    return req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
  },
  handler: jsonRateLimitHandler('Demasiadas solicitudes desde esta IP, intenta mas tarde.')
});

// Rate limiter para autenticación: 5 intentos/15min por IP (prevenir brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  message: 'Demasiados intentos de autenticación. Intenta más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV !== 'production',
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
  },
  handler: jsonRateLimitHandler('Demasiados intentos de autenticacion. Intenta mas tarde.')
});

// Rate limiter para muebles: 50 req/15min por usuario autenticado
const furnitureLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50,
  message: 'Límite de solicitudes alcanzado. Intenta más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV !== 'production',
  keyGenerator: (req) => {
    // Usar ID del usuario autenticado si está disponible
    if (req.user && req.user.id) {
      return `user-${req.user.id}`;
    }
    // Fallback a IP
    return req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
  },
  handler: jsonRateLimitHandler('Limite de solicitudes alcanzado. Intenta mas tarde.')
});

module.exports = {
  globalLimiter,
  authLimiter,
  furnitureLimiter
};
