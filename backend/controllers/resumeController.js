const Resume = require('../models/Resume');
const User = require('../models/User');

const FREE_TEMPLATES = ['modern'];
const PRO_TEMPLATES = ['classic', 'minimal', 'executive', 'creative'];
const ALL_TEMPLATES = [...FREE_TEMPLATES, ...PRO_TEMPLATES];

/**
 * Returns an error response if the given template requires Pro and the user is not Pro.
 * Returns null if the template is allowed.
 */
const checkTemplateAccess = (template, user, res) => {
  if (template && PRO_TEMPLATES.includes(template) && user.plan !== 'pro') {
    res.status(403).json({
      success: false,
      message: `The "${template}" template is a Pro feature. Please upgrade to use it.`,
      requiresUpgrade: true,
    });
    return true; // blocked
  }
  if (template && !ALL_TEMPLATES.includes(template)) {
    res.status(400).json({ success: false, message: 'Invalid template.' });
    return true; // blocked
  }
  return false; // allowed
};

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

    const requestedTemplate = req.body.template || 'modern';
    if (checkTemplateAccess(requestedTemplate, user, res)) return;

    const resume = await Resume.create({
      user: req.user._id,
      title: req.body.title || 'My Resume',
      template: requestedTemplate,
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
    // If the request attempts to change the template, enforce plan access server-side.
    if (req.body.template !== undefined) {
      const user = await User.findById(req.user._id);
      if (checkTemplateAccess(req.body.template, user, res)) return;
    }

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