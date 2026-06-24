const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');
const prisma = require('../utils/prisma');

router.use(authenticate);

// Get all users (for assignment dropdown)
router.get('/', asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, email: true, role: true, avatarUrl: true },
    orderBy: { name: 'asc' },
  });
  res.json({ users });
}));

// Get user by id
router.get('/:id', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, name: true, email: true, role: true, avatarUrl: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
}));

// Update user role (admin only)
router.patch('/:id/role', authorize('ADMIN'), asyncHandler(async (req, res) => {
  const { role } = req.body;
  const validRoles = ['DEVELOPER', 'QA', 'PM', 'ADMIN', 'VIEWER'];
  if (!validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role' });

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });
  res.json({ user });
}));

// Deactivate user (admin only)
router.patch('/:id/deactivate', authorize('ADMIN'), asyncHandler(async (req, res) => {
  await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ message: 'User deactivated' });
}));

module.exports = router;
