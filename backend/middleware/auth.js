const jwt = require('jsonwebtoken')

function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token requerido.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro')
    req.user = decoded // contiene { id, email }
    next()
  } catch (err) {
    res.status(403).json({ error: 'Token inválido o expirado' })
  }
}

module.exports = authenticateToken