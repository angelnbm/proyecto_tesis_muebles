const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro'

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
