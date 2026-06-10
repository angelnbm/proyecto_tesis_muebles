const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Mueblista = require('../models/mueblista.js')

const router = express.Router()

// Registro
router.post('/register', async (req, res, next) => {
  try {
    const { nombre, email, contrasena } = req.body

    if (!nombre?.trim() || !email?.trim() || !contrasena) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos', error: 'MISSING_FIELDS' })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Email inválido', error: 'INVALID_EMAIL' })
    }
    if (contrasena.length < 6) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres', error: 'PASSWORD_TOO_SHORT' })
    }

    // Verifica si el usuario ya existe
    const existingUser = await Mueblista.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya esta registrado',
        error: 'EMAIL_ALREADY_REGISTERED',
      })
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10)

    // Crear usuario
    const newUser = new Mueblista({
      nombre,
      email,
      contrasena: hashedPassword,
    })

    await newUser.save()

    // Generar token JWT
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      token,
      user: {
        id: newUser._id,
        nombre: newUser.nombre,
        email: newUser.email,
      },
    })
  } catch (err) {
    return next(err)
  }
})

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, contrasena } = req.body

    if (!email?.trim() || !contrasena) {
      return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos', error: 'MISSING_FIELDS' })
    }

    // Busca el usuario
    const user = await Mueblista.findOne({ email })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas',
        error: 'INVALID_CREDENTIALS',
      })
    }

    // Verifica la contraseña
    const isMatch = await bcrypt.compare(contrasena, user.contrasena)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas',
        error: 'INVALID_CREDENTIALS',
      })
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
      },
    })
  } catch (err) {
    return next(err)
  }
})

// Verificar token (opcional, para validar sesión)
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        error: 'TOKEN_NOT_PROVIDED',
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await Mueblista.findById(decoded.id).select('-contrasena')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        error: 'USER_NOT_FOUND',
      })
    }

    res.json({ success: true, user })
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Token invalido',
      error: 'INVALID_TOKEN',
    })
  }
})

module.exports = router
