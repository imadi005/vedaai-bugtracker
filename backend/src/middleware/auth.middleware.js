const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const authenticate = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired, please login again' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
};

// Roles hierarchy
const ROLE_PERMISSIONS = {
  ADMIN: ['create', 'read', 'update', 'delete', 'assign', 'close', 'analytics_full'],
  PM: ['create', 'read', 'update', 'assign', 'close', 'analytics_team'],
  DEVELOPER: ['create', 'read', 'update', 'analytics_own'],
  QA: ['create', 'read', 'analytics_own'],
  VIEWER: ['read'],
};

const can = (permission) => {
  return (req, res, next) => {
    const userPermissions = ROLE_PERMISSIONS[req.user?.role] || [];
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticate, authorize, can };
