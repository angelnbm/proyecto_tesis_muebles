const { validationResult } = require('express-validator');
const mongoSanitize = require('express-mongo-sanitize');
const jwt = require('jsonwebtoken');

// Middleware para verificar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Middleware para sanitizar inputs (prevenir NoSQL injection)
// Solo sanitiza req.body y req.params, NO req.query (que es getter en Express 5.x)
const sanitizeInputs = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️ Sanitización detectada en ${key}`);
  }
});

// Wrapper para sanitizar solo body y params, evitando error con query getter
const sanitizeInputsWrapper = (req, res, next) => {
  try {
    // Sanitiza solo body y params, no toca query
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeData(req.body);
    }
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeData(req.params);
    }
    next();
  } catch (err) {
    console.error('❌ Error en sanitización:', err.message);
    next();
  }
};

// Función auxiliar para sanitizar datos recursivamente
const sanitizeData = (data) => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized = Array.isArray(data) ? [] : {};

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      // Reemplazar caracteres peligrosos en la clave
      const safeKey = key.replace(/\$/g, '_').replace(/\./g, '_');
      
      // Recursivamente sanitizar valores
      if (typeof data[key] === 'object' && data[key] !== null) {
        sanitized[safeKey] = sanitizeData(data[key]);
      } else if (typeof data[key] === 'string') {
        // Sanitizar strings
        sanitized[safeKey] = data[key].replace(/\$/g, '_').replace(/\./g, '_');
      } else {
        sanitized[safeKey] = data[key];
      }
    }
  }

  return sanitized;
};

// Middleware para validar JWT
const verifyJWT = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    // Validar formato del token
    if (!token.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Middleware para validar estructura de payload
const validatePayload = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Payload inválido',
        details: error.details.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  handleValidationErrors,
  sanitizeInputsWrapper,
  verifyJWT,
  validatePayload
};
