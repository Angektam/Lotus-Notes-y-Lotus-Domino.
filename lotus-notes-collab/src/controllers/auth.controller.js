const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Validar formato de email
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName, department } = req.body;

    // Validaciones de entrada
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ error: 'El usuario debe tener al menos 3 caracteres' });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Correo electrónico inválido' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() }
    });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const existingUsername = await User.findOne({ where: { username: username.trim() } });
    if (existingUsername) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase(),
      password,
      fullName: fullName?.trim(),
      department: department?.trim()
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'La contraseña es requerida' });
    }
    if (!email && !username) {
      return res.status(400).json({ error: 'Email o usuario es requerido' });
    }

    // Buscar por email o username
    const whereClause = email
      ? { email: email.toLowerCase() }
      : { username };

    const user = await User.findOne({ where: whereClause });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Cuenta desactivada. Contacta al administrador' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    await user.update({ lastLogin: new Date() });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Escribe al menos 2 caracteres para buscar' });
    }
    const { Op } = require('sequelize');
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { fullName: { [Op.like]: `%${q}%` } },
          { username: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } }
        ],
        id: { [Op.ne]: req.user.id }
      },
      attributes: ['id', 'username', 'fullName', 'email', 'role'],
      limit: 10
    });
    res.json({ users });
  } catch (error) {
    console.error('Error en searchUsers:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        fullName: req.user.fullName,
        role: req.user.role,
        department: req.user.department,
        status: req.user.status,
        lastLogin: req.user.lastLogin
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
