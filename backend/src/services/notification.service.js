const prisma = require('../utils/prisma');

const createNotification = async ({ userId, type, title, message, payload }) => {
  try {
    const notification = await prisma.notification.create({
      data: { userId, type, title, message, payload: payload || {} },
    });
    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};

module.exports = { createNotification };
