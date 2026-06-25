const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET no está configurado o es demasiado corto — el servidor no puede arrancar de forma segura')
}

function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado. Token requerido.',
      error: 'TOKEN_REQUIRED',
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    req.user = decoded
    req.userId = decoded.id
    req.userName = decoded.nombre || decoded.name || ''
    req.userEmail = decoded.email || ''

    next()
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Token invalido o expirado',
      error: 'INVALID_OR_EXPIRED_TOKEN',
    })
  }
}

module.exports = authenticateToken
