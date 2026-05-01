const Resume = require('../models/Resume');
const geminiService = require('../services/geminiService');
const { generateResumePDF, generateCoverLetterPDF } = require('../services/pdfService');

// @desc    Analyze Job Description
// @route   POST /api/ai/analyze-jd
// @access  Private
const analyzeJD = async (req, res) => {
  try {
    const { jobDescription, resumeId } = req.body;

    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({ success: false, message: 'Please provide a valid job description (at least 50 characters).' });
    }

    const analysis = await geminiService.analyzeJobDescription(jobDescription);

    // If resumeId provided, calculate ATS score
    if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
      if (resume) {
        const atsResult = await geminiService.calculateATSScore(
          { personalInfo: resume.personalInfo, skills: resume.skills, experience: resume.experience },
          jobDescription
        );

        await Resume.findByIdAndUpdate(resumeId, {
          targetJobDescription: jobDescription,
          atsScore: atsResult.score,
          extractedKeywords: analysis.allKeywords,
          matchedKeywords: atsResult.matchedKeywords,
          missingKeywords: atsResult.missingKeywords,
        });

        return res.json({
          success: true,
          analysis,
          atsResult,
        });
      }
    }

    res.json({ success: true, analysis });
  } catch (error) {
    console.error('Analyze JD error:', error?.message || error);
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to analyze job description. Please try again.',
    });
  }
};

// @desc    Rewrite all experience bullets with AI
// @route   POST /api/ai/rewrite-experience/:resumeId
// @access  Private
const rewriteExperience = async (req, res) => {
  try {
    const { experienceIndex } = req.body;
    const resume = await Resume.findOne({ _id: req.params.resumeId, user: req.user._id });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    if (!resume.targetJobDescription) {
      return res.status(400).json({ success: false, message: 'Please analyze a job description first.' });
    }

    const experience = resume.experience[experienceIndex];
    if (!experience) {
      return res.status(400).json({ success: false, message: 'Experience entry not found.' });
    }

    // Defensive: ensure bullets is always an array
    if (!Array.isArray(experience.bullets) || experience.bullets.length === 0) {
      return res.status(400).json({ success: false, message: 'This experience has no bullet points to rewrite. Add some bullets first.' });
    }

    // Store originals before rewrite
    const originalBullets = [...experience.bullets];

    const jdAnalysis = await geminiService.analyzeJobDescription(resume.targetJobDescription);

    // Defensive: handle missing allKeywords from JD analysis
    const targetKeywords = Array.isArray(jdAnalysis?.allKeywords)
      ? jdAnalysis.allKeywords.slice(0, 8)
      : [];
    const jobTitle = jdAnalysis?.jobTitle || 'the role';

    const rewrittenBullets = await geminiService.rewriteExperienceBullets(
      experience,
      targetKeywords,
      jobTitle
    );

    // Validate AI returned an array of the same length
    if (!Array.isArray(rewrittenBullets) || rewrittenBullets.length === 0) {
      return res.status(500).json({ success: false, message: 'AI returned invalid bullets. Please try again.' });
    }

    resume.experience[experienceIndex].bullets = rewrittenBullets;
    resume.experience[experienceIndex].originalBullets = originalBullets;
    await resume.save();

    res.json({
      success: true,
      message: 'Bullets rewritten successfully!',
      rewrittenBullets,
      originalBullets,
    });
  } catch (error) {
    console.error('Rewrite experience error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Failed to rewrite experience. Please try again.' });
  }
};

// @desc    Rewrite professional summary
// @route   POST /api/ai/rewrite-summary/:resumeId
// @access  Private
const rewriteSummary = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.resumeId, user: req.user._id });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }
    if (!resume.targetJobDescription) {
      return res.status(400).json({ success: false, message: 'Please analyze a job description first.' });
    }

    const jdAnalysis = await geminiService.analyzeJobDescription(resume.targetJobDescription);
    const experienceYears = resume.experience.length > 0 ? `${resume.experience.length * 2}+` : '2+';

    // Defensive: handle missing allKeywords from JD analysis
    const keywords = Array.isArray(jdAnalysis?.allKeywords) ? jdAnalysis.allKeywords.slice(0, 6) : [];
    const jobTitle = jdAnalysis?.jobTitle || 'the role';

    const rewrittenSummary = await geminiService.rewriteSummary(
      resume.personalInfo.summary || '',
      jobTitle,
      keywords,
      experienceYears
    );

    resume.personalInfo.summary = rewrittenSummary;
    await resume.save();

    res.json({ success: true, summary: rewrittenSummary });
  } catch (error) {
    console.error('Rewrite summary error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Failed to rewrite summary.' });
  }
};

// @desc    Generate cover letter
// @route   POST /api/ai/cover-letter/:resumeId
// @access  Private (Pro only handled in route)
const generateCoverLetter = async (req, res) => {
  try {
    const { jobTitle, company } = req.body;
    const resume = await Resume.findOne({ _id: req.params.resumeId, user: req.user._id });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }
    if (!resume.targetJobDescription) {
      return res.status(400).json({ success: false, message: 'Please analyze a job description first.' });
    }

    const coverLetter = await geminiService.generateCoverLetter(
      resume.toObject(),
      jobTitle || 'the position',
      company || 'your company',
      resume.targetJobDescription
    );

    resume.coverLetter = coverLetter;
    resume.coverLetterJobTitle = jobTitle;
    resume.coverLetterCompany = company;
    await resume.save();

    res.json({ success: true, coverLetter });
  } catch (error) {
    console.error('Cover letter error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Failed to generate cover letter.' });
  }
};

// @desc    Export resume as PDF
// @route   GET /api/ai/export/:resumeId
// @access  Private
const exportResumePDF = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.resumeId, user: req.user._id });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    const pdfBuffer = await generateResumePDF(resume.toObject());

    const fileName = `${resume.personalInfo?.firstName || 'Resume'}_${resume.personalInfo?.lastName || ''}_${resume.title}.pdf`
      .replace(/\s+/g, '_');

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': pdfBuffer.length,
    });

    await Resume.findByIdAndUpdate(resume._id, { lastExportedAt: new Date() });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate PDF. Please try again.' });
  }
};

// @desc    Export cover letter as PDF
// @route   GET /api/ai/export-cover-letter/:resumeId
// @access  Private (Pro only)
const exportCoverLetterPDF = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.resumeId, user: req.user._id });

    if (!resume || !resume.coverLetter) {
      return res.status(404).json({ success: false, message: 'Cover letter not found. Please generate one first.' });
    }

    const pdfBuffer = await generateCoverLetterPDF(resume.toObject(), resume.coverLetter);
    const fileName = `Cover_Letter_${resume.personalInfo?.firstName || ''}_${resume.coverLetterCompany || ''}.pdf`.replace(/\s+/g, '_');

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Cover letter PDF error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate cover letter PDF.' });
  }
};

// @desc    Suggest skills based on JD
// @route   POST /api/ai/suggest-skills/:resumeId
// @access  Private
const suggestSkills = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.resumeId, user: req.user._id });
    if (!resume || !resume.targetJobDescription) {
      return res.status(400).json({ success: false, message: 'Resume or job description not found.' });
    }

    const currentSkills = [
      ...(resume.skills?.technical || []),
      ...(resume.skills?.soft || []),
    ];

    const suggestions = await geminiService.suggestSkills(currentSkills, resume.targetJobDescription);
    res.json({ success: true, suggestions });
  } catch (error) {
    console.error('Suggest skills error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Failed to suggest skills.' });
  }
};

module.exports = {
  analyzeJD,
  rewriteExperience,
  rewriteSummary,
  generateCoverLetter,
  exportResumePDF,
  exportCoverLetterPDF,
  suggestSkills,
};
