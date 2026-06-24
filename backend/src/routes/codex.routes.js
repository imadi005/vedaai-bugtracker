const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');
const codexController = require('../controllers/codex.controller');

router.use(authenticate);

// Summarize a single bug with Codex
router.post('/summarize/:bugId', asyncHandler(codexController.summarizeBug));

// Auto-triage all open bugs (admin only)
router.post('/triage', authorize('ADMIN', 'PM'), asyncHandler(codexController.triageAllBugs));

// Get Codex usage logs
router.get('/usage', authorize('ADMIN', 'PM'), asyncHandler(codexController.getUsageLogs));

module.exports = router;
