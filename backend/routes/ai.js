const express = require('express');
const { protect, requirePro } = require('../middleware/auth');
const {
  analyzeJD, rewriteExperience, rewriteSummary,
  generateCoverLetter, exportResumePDF,
  exportCoverLetterPDF, suggestSkills,
} = require('../controllers/aiController');

const router = express.Router();

router.use(protect);

router.post('/analyze-jd', analyzeJD);
router.post('/rewrite-experience/:resumeId', rewriteExperience);
router.post('/rewrite-summary/:resumeId', rewriteSummary);
router.post('/suggest-skills/:resumeId', suggestSkills);
router.get('/export/:resumeId', exportResumePDF);

// Pro-only routes
router.post('/cover-letter/:resumeId', requirePro, generateCoverLetter);
router.get('/export-cover-letter/:resumeId', requirePro, exportCoverLetterPDF);

module.exports = router;
