const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

router.post('/register', registerValidation, asyncHandler(authController.register));
router.post('/login', loginValidation, asyncHandler(authController.login));
router.post('/logout', asyncHandler(authController.logout));
router.get('/me', authenticate, asyncHandler(authController.getMe));
router.put('/me', authenticate, asyncHandler(authController.updateMe));
router.put('/me/password', authenticate, asyncHandler(authController.changePassword));

module.exports = router;
