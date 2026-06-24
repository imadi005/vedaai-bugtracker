const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');
const prisma = require('../utils/prisma');

router.use(authenticate);

// Get comments for a bug
router.get('/bug/:bugId', asyncHandler(async (req, res) => {
  const comments = await prisma.comment.findMany({
    where: { bugId: req.params.bugId },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: 'asc' },
  });
  res.json({ comments });
}));

// Add comment
router.post('/bug/:bugId', asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Comment cannot be empty' });

  const bug = await prisma.bug.findUnique({ where: { id: req.params.bugId } });
  if (!bug) return res.status(404).json({ error: 'Bug not found' });

  const comment = await prisma.comment.create({
    data: { content, bugId: req.params.bugId, userId: req.user.id },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });

  // Notify bug assignee/reporter
  const notifyUsers = [bug.reporterId, bug.assigneeId].filter(
    (id) => id && id !== req.user.id
  );
  const { createNotification } = require('../services/notification.service');
  for (const userId of notifyUsers) {
    await createNotification({
      userId,
      type: 'NEW_COMMENT',
      title: 'New comment on bug',
      message: `${req.user.name} commented on "${bug.title}"`,
      payload: { bugId: bug.id, commentId: comment.id },
    });
  }

  const io = req.app.get('io');
  io.to(`bug:${req.params.bugId}`).emit('comment:new', comment);

  res.status(201).json({ comment });
}));

// Update comment
router.put('/:id', asyncHandler(async (req, res) => {
  const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  if (comment.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Cannot edit this comment' });
  }

  const updated = await prisma.comment.update({
    where: { id: req.params.id },
    data: { content: req.body.content },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });

  const io = req.app.get('io');
  io.to(`bug:${comment.bugId}`).emit('comment:updated', updated);

  res.json({ comment: updated });
}));

// Delete comment
router.delete('/:id', asyncHandler(async (req, res) => {
  const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  if (comment.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Cannot delete this comment' });
  }

  await prisma.comment.delete({ where: { id: req.params.id } });

  const io = req.app.get('io');
  io.to(`bug:${comment.bugId}`).emit('comment:deleted', { commentId: req.params.id });

  res.json({ message: 'Comment deleted' });
}));

module.exports = router;
