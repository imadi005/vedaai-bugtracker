const prisma = require('../utils/prisma');

const createAuditLog = async ({ bugId, userId, action, field, oldValue, newValue }) => {
  try {
    return await prisma.auditLog.create({
      data: {
        bugId,
        userId,
        action,
        field: field || null,
        oldValue: oldValue ? String(oldValue) : null,
        newValue: newValue ? String(newValue) : null,
      },
    });
  } catch (err) {
    console.error('Failed to create audit log:', err);
  }
};

module.exports = { createAuditLog };
