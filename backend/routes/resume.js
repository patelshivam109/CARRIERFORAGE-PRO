const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createResume, getResumes, getResume,
  updateResume, deleteResume, duplicateResume,
} = require('../controllers/resumeController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getResumes)
  .post(createResume);

router.route('/:id')
  .get(getResume)
  .put(updateResume)
  .delete(deleteResume);

router.post('/:id/duplicate', duplicateResume);

module.exports = router;
