const express = require('express');
const router = express.Router();
const bugController = require('../controllers/bug.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');

// All routes require authentication
router.use(authenticate);

router.get('/', asyncHandler(bugController.getAllBugs));
router.post('/', asyncHandler(bugController.createBug));
router.get('/my', asyncHandler(bugController.getMyBugs));
router.get('/overdue', asyncHandler(bugController.getOverdueBugs));
router.get('/:id', asyncHandler(bugController.getBugById));
router.put('/:id', asyncHandler(bugController.updateBug));
router.patch('/:id/status', asyncHandler(bugController.updateBugStatus));
router.patch('/:id/assign', authorize('ADMIN', 'PM'), asyncHandler(bugController.assignBug));
router.delete('/:id', authorize('ADMIN'), asyncHandler(bugController.deleteBug));

module.exports = router;
