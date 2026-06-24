const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');
const prisma = require('../utils/prisma');

router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  const now = new Date();

  const [
    total,
    open,
    inProgress,
    fixed,
    closed,
    reopened,
    overdue,
    highSeverity,
    mediumSeverity,
    lowSeverity,
    recentBugs,
    memberStats,
  ] = await Promise.all([
    prisma.bug.count(),
    prisma.bug.count({ where: { status: 'OPEN' } }),
    prisma.bug.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.bug.count({ where: { status: 'FIXED' } }),
    prisma.bug.count({ where: { status: 'CLOSED' } }),
    prisma.bug.count({ where: { status: 'REOPENED' } }),
    prisma.bug.count({
      where: { dueDate: { lt: now }, status: { notIn: ['FIXED', 'CLOSED'] } },
    }),
    prisma.bug.count({ where: { severity: 'HIGH', status: { notIn: ['FIXED', 'CLOSED'] } } }),
    prisma.bug.count({ where: { severity: 'MEDIUM', status: { notIn: ['FIXED', 'CLOSED'] } } }),
    prisma.bug.count({ where: { severity: 'LOW', status: { notIn: ['FIXED', 'CLOSED'] } } }),
    prisma.bug.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        reporter: { select: { id: true, name: true, avatarUrl: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } },
      },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        role: true,
        assignedBugs: {
          select: { id: true, status: true },
        },
      },
    }),
  ]);

  const memberStatsFormatted = memberStats.map((u) => ({
    id: u.id,
    name: u.name,
    avatarUrl: u.avatarUrl,
    role: u.role,
    assigned: u.assignedBugs.length,
    resolved: u.assignedBugs.filter((b) => ['FIXED', 'CLOSED'].includes(b.status)).length,
    pending: u.assignedBugs.filter((b) => !['FIXED', 'CLOSED'].includes(b.status)).length,
  }));

  res.json({
    stats: { total, open, inProgress, fixed, closed, reopened, overdue },
    severity: { high: highSeverity, medium: mediumSeverity, low: lowSeverity },
    recentBugs,
    memberStats: memberStatsFormatted,
  });
}));

module.exports = router;
