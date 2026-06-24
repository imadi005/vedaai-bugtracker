const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');
const prisma = require('../utils/prisma');

router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  const unreadCount = notifications.filter((n) => !n.readAt).length;
  res.json({ notifications, unreadCount });
}));

router.patch('/:id/read', asyncHandler(async (req, res) => {
  await prisma.notification.update({
    where: { id: req.params.id, userId: req.user.id },
    data: { readAt: new Date() },
  });
  res.json({ message: 'Marked as read' });
}));

router.patch('/read-all', asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, readAt: null },
    data: { readAt: new Date() },
  });
  res.json({ message: 'All marked as read' });
}));

module.exports = router;
