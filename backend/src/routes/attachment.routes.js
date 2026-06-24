const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');
const prisma = require('../utils/prisma');

router.use(authenticate);

// Use memory storage for now (switch to S3 in production)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/zip'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  },
});

// Upload attachment for a bug
router.post('/bug/:bugId', upload.array('files', 5), asyncHandler(async (req, res) => {
  const bug = await prisma.bug.findUnique({ where: { id: req.params.bugId } });
  if (!bug) return res.status(404).json({ error: 'Bug not found' });

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  // In production: upload to S3 and get real URLs
  // For now: store file metadata (you'd integrate AWS S3 here)
  const attachments = await Promise.all(
    req.files.map(async (file) => {
      const s3Key = `bugs/${req.params.bugId}/${Date.now()}-${file.originalname}`;
      return prisma.attachment.create({
        data: {
          fileName: file.originalname,
          originalName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          s3Key,
          s3Url: `https://your-bucket.s3.amazonaws.com/${s3Key}`,
          bugId: req.params.bugId,
          uploadedById: req.user.id,
        },
        include: { uploadedBy: { select: { id: true, name: true } } },
      });
    })
  );

  res.status(201).json({ attachments });
}));

// Delete attachment
router.delete('/:id', asyncHandler(async (req, res) => {
  const attachment = await prisma.attachment.findUnique({ where: { id: req.params.id } });
  if (!attachment) return res.status(404).json({ error: 'Attachment not found' });
  if (attachment.uploadedById !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Cannot delete this attachment' });
  }
  await prisma.attachment.delete({ where: { id: req.params.id } });
  res.json({ message: 'Attachment deleted' });
}));

module.exports = router;
