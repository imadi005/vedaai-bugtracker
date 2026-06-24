const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const prisma = require('../utils/prisma');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || 'DEVELOPER',
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const token = generateToken(user.id);
  setTokenCookie(res, token);

  res.status(201).json({ user, token });
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(user.id);
  setTokenCookie(res, token);

  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, token });
};

exports.logout = async (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, avatarUrl: true, createdAt: true },
  });
  res.json({ user });
};

exports.updateMe = async (req, res) => {
  const { name, avatarUrl } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, avatarUrl },
    select: { id: true, name: true, email: true, role: true, avatarUrl: true },
  });
  res.json({ user });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashedPassword },
  });

  res.json({ message: 'Password changed successfully' });
};
