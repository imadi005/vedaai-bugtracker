const prisma = require('../utils/prisma');
const { createNotification } = require('../services/notification.service');
const { createAuditLog } = require('../services/audit.service');

exports.getAllBugs = async (req, res) => {
  const {
    status,
    severity,
    assigneeId,
    reporterId,
    module,
    search,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const where = {};
  if (status) where.status = status;
  if (severity) where.severity = severity;
  if (assigneeId) where.assigneeId = assigneeId;
  if (reporterId) where.reporterId = reporterId;
  if (module) where.module = { contains: module, mode: 'insensitive' };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [bugs, total] = await Promise.all([
    prisma.bug.findMany({
      where,
      include: {
        reporter: { select: { id: true, name: true, email: true, avatarUrl: true } },
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        _count: { select: { comments: true, attachments: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: parseInt(limit),
    }),
    prisma.bug.count({ where }),
  ]);

  res.json({
    bugs,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  });
};

exports.getBugById = async (req, res) => {
  const bug = await prisma.bug.findUnique({
    where: { id: req.params.id },
    include: {
      reporter: { select: { id: true, name: true, email: true, avatarUrl: true } },
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      comments: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      attachments: {
        include: {
          uploadedBy: { select: { id: true, name: true } },
        },
      },
      auditLogs: {
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!bug) {
    return res.status(404).json({ error: 'Bug not found' });
  }

  res.json({ bug });
};

exports.createBug = async (req, res) => {
  const { title, description, severity, module, category, assigneeId, dueDate } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  const bug = await prisma.bug.create({
    data: {
      title,
      description,
      severity: severity || 'MEDIUM',
      module,
      category,
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      reporterId: req.user.id,
    },
    include: {
      reporter: { select: { id: true, name: true, email: true, avatarUrl: true } },
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  await createAuditLog({ bugId: bug.id, userId: req.user.id, action: 'BUG_CREATED' });

  // Notify assignee
  if (assigneeId && assigneeId !== req.user.id) {
    await createNotification({
      userId: assigneeId,
      type: 'BUG_ASSIGNED',
      title: 'New bug assigned to you',
      message: `"${bug.title}" has been assigned to you`,
      payload: { bugId: bug.id },
    });
  }

  // Emit socket event
  const io = req.app.get('io');
  io.emit('bug:created', bug);

  res.status(201).json({ bug });
};

exports.updateBug = async (req, res) => {
  const { title, description, severity, module, category, dueDate } = req.body;
  const bugId = req.params.id;

  const existing = await prisma.bug.findUnique({ where: { id: bugId } });
  if (!existing) return res.status(404).json({ error: 'Bug not found' });

  const bug = await prisma.bug.update({
    where: { id: bugId },
    data: {
      title,
      description,
      severity,
      module,
      category,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
    include: {
      reporter: { select: { id: true, name: true, email: true, avatarUrl: true } },
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  await createAuditLog({ bugId, userId: req.user.id, action: 'BUG_UPDATED' });

  const io = req.app.get('io');
  io.to(`bug:${bugId}`).emit('bug:updated', bug);

  res.json({ bug });
};

exports.updateBugStatus = async (req, res) => {
  const { status } = req.body;
  const bugId = req.params.id;

  const validStatuses = ['OPEN', 'IN_PROGRESS', 'FIXED', 'CLOSED', 'REOPENED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const existing = await prisma.bug.findUnique({ where: { id: bugId } });
  if (!existing) return res.status(404).json({ error: 'Bug not found' });

  const bug = await prisma.bug.update({
    where: { id: bugId },
    data: {
      status,
      resolvedAt: status === 'FIXED' || status === 'CLOSED' ? new Date() : null,
    },
    include: {
      reporter: { select: { id: true, name: true, email: true, avatarUrl: true } },
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  await createAuditLog({
    bugId,
    userId: req.user.id,
    action: 'STATUS_CHANGED',
    field: 'status',
    oldValue: existing.status,
    newValue: status,
  });

  // Notify reporter of status change
  if (existing.reporterId !== req.user.id) {
    await createNotification({
      userId: existing.reporterId,
      type: 'BUG_STATUS_CHANGED',
      title: 'Bug status updated',
      message: `"${existing.title}" status changed to ${status}`,
      payload: { bugId, status },
    });
  }

  const io = req.app.get('io');
  io.to(`bug:${bugId}`).emit('bug:status_changed', { bugId, status, updatedBy: req.user });
  io.emit('dashboard:refresh');

  res.json({ bug });
};

exports.assignBug = async (req, res) => {
  const { assigneeId } = req.body;
  const bugId = req.params.id;

  const existing = await prisma.bug.findUnique({ where: { id: bugId } });
  if (!existing) return res.status(404).json({ error: 'Bug not found' });

  const bug = await prisma.bug.update({
    where: { id: bugId },
    data: { assigneeId },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  await createAuditLog({
    bugId,
    userId: req.user.id,
    action: 'BUG_ASSIGNED',
    field: 'assigneeId',
    oldValue: existing.assigneeId,
    newValue: assigneeId,
  });

  if (assigneeId) {
    await createNotification({
      userId: assigneeId,
      type: 'BUG_ASSIGNED',
      title: 'Bug assigned to you',
      message: `"${existing.title}" has been assigned to you`,
      payload: { bugId },
    });
  }

  const io = req.app.get('io');
  io.to(`bug:${bugId}`).emit('bug:assigned', bug);

  res.json({ bug });
};

exports.getMyBugs = async (req, res) => {
  const userId = req.user.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [assignedToMe, reportedByMe, dueToday, overdue] = await Promise.all([
    prisma.bug.findMany({
      where: { assigneeId: userId, status: { notIn: ['CLOSED'] } },
      include: { reporter: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.bug.findMany({
      where: { reporterId: userId },
      include: { assignee: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.bug.findMany({
      where: {
        assigneeId: userId,
        dueDate: { gte: today, lt: tomorrow },
        status: { notIn: ['CLOSED', 'FIXED'] },
      },
    }),
    prisma.bug.findMany({
      where: {
        assigneeId: userId,
        dueDate: { lt: today },
        status: { notIn: ['CLOSED', 'FIXED'] },
      },
    }),
  ]);

  res.json({ assignedToMe, reportedByMe, dueToday, overdue });
};

exports.getOverdueBugs = async (req, res) => {
  const now = new Date();
  const bugs = await prisma.bug.findMany({
    where: {
      dueDate: { lt: now },
      status: { notIn: ['FIXED', 'CLOSED'] },
    },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      reporter: { select: { id: true, name: true } },
    },
    orderBy: { dueDate: 'asc' },
  });
  res.json({ bugs });
};

exports.deleteBug = async (req, res) => {
  const bug = await prisma.bug.findUnique({ where: { id: req.params.id } });
  if (!bug) return res.status(404).json({ error: 'Bug not found' });

  await prisma.bug.delete({ where: { id: req.params.id } });

  const io = req.app.get('io');
  io.emit('bug:deleted', { bugId: req.params.id });

  res.json({ message: 'Bug deleted successfully' });
};
