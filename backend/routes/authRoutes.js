const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Mueblista = require('../models/mueblista.js')

const router = express.Router()

// Registro
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, contrasena } = req.body

    // Verifica si el usuario ya existe
    const existingUser = await Mueblista.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' })
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
      process.env.JWT_SECRET || 'secreto_super_seguro',
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      token,
      user: {
        id: newUser._id,
        nombre: newUser.nombre,
        email: newUser.email,
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, contrasena } = req.body

    // Busca el usuario
    const user = await Mueblista.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    // Verifica la contraseña
    const isMatch = await bcrypt.compare(contrasena, user.contrasena)
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'secreto_super_seguro',
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Verificar token (opcional, para validar sesión)
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro')
    const user = await Mueblista.findById(decoded.id).select('-contrasena')

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    res.json({ user })
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' })
  }
})

module.exports = router