const Resume = require('../models/Resume');
const User = require('../models/User');

// @desc    Create a new resume
// @route   POST /api/resume
// @access  Private
const createResume = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.canCreateResume()) {
      return res.status(403).json({
        success: false,
        message: 'Free plan allows only 1 resume. Please upgrade to Pro for unlimited resumes.',
        requiresUpgrade: true,
      });
    }

    const resume = await Resume.create({
      user: req.user._id,
      title: req.body.title || 'My Resume',
      template: req.body.template || 'modern',
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { resumeCount: 1 } });

    res.status(201).json({ success: true, resume });
  } catch (error) {
    console.error('Create resume error:', error);
    res.status(500).json({ success: false, message: 'Failed to create resume.' });
  }
};

// @desc    Get all resumes for current user
// @route   GET /api/resume
// @access  Private
const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id })
      .select('title template atsScore updatedAt createdAt targetJobDescription')
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: resumes.length, resumes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch resumes.' });
  }
};

// @desc    Get single resume
// @route   GET /api/resume/:id
// @access  Private
const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    res.json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch resume.' });
  }
};

// @desc    Update resume
// @route   PUT /api/resume/:id
// @access  Private
const updateResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    res.json({ success: true, resume });
  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({ success: false, message: 'Failed to update resume.' });
  }
};

// @desc    Delete resume
// @route   DELETE /api/resume/:id
// @access  Private
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    await User.findByIdAndUpdate(req.user._id, { $inc: { resumeCount: -1 } });

    res.json({ success: true, message: 'Resume deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete resume.' });
  }
};

// @desc    Duplicate resume
// @route   POST /api/resume/:id/duplicate
// @access  Private
const duplicateResume = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.canCreateResume()) {
      return res.status(403).json({
        success: false,
        message: 'Upgrade to Pro to create more resumes.',
        requiresUpgrade: true,
      });
    }

    const original = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!original) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    const duplicateData = original.toObject();
    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    duplicateData.title = `${original.title} (Copy)`;

    const duplicate = await Resume.create(duplicateData);
    await User.findByIdAndUpdate(req.user._id, { $inc: { resumeCount: 1 } });

    res.status(201).json({ success: true, resume: duplicate });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to duplicate resume.' });
  }
};

module.exports = { createResume, getResumes, getResume, updateResume, deleteResume, duplicateResume };
