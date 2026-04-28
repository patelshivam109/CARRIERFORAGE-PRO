const mongoose = require('mongoose');

const ExperienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  position: { type: String, required: true },
  location: { type: String, default: '' },
  startDate: { type: String, required: true },
  endDate: { type: String, default: 'Present' },
  current: { type: Boolean, default: false },
  bullets: [{ type: String }],
  originalBullets: [{ type: String }], // Store originals before AI rewrite
});

const EducationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String, default: '' },
  location: { type: String, default: '' },
  startDate: { type: String, required: true },
  endDate: { type: String, default: 'Present' },
  gpa: { type: String, default: '' },
  achievements: [{ type: String }],
});

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  technologies: [{ type: String }],
  link: { type: String, default: '' },
  github: { type: String, default: '' },
  bullets: [{ type: String }],
});

const ResumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Resume title is required'],
      default: 'My Resume',
    },
    template: {
      type: String,
      enum: ['classic', 'modern', 'minimal', 'executive', 'creative'],
      default: 'modern',
    },
    // Personal Info
    personalInfo: {
      firstName: { type: String, default: '' },
      lastName: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      website: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      summary: { type: String, default: '' },
    },
    experience: [ExperienceSchema],
    education: [EducationSchema],
    skills: {
      technical: [{ type: String }],
      soft: [{ type: String }],
      languages: [{ type: String }],
      certifications: [{ type: String }],
    },
    projects: [ProjectSchema],
    // ATS & AI features
    targetJobDescription: { type: String, default: '' },
    atsScore: { type: Number, default: 0 },
    extractedKeywords: [{ type: String }],
    matchedKeywords: [{ type: String }],
    missingKeywords: [{ type: String }],
    // Cover letter
    coverLetter: { type: String, default: '' },
    coverLetterJobTitle: { type: String, default: '' },
    coverLetterCompany: { type: String, default: '' },
    // Meta
    isPublic: { type: Boolean, default: false },
    lastExportedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', ResumeSchema);
