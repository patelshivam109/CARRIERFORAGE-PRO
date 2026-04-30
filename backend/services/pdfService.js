const puppeteer = require('puppeteer');

/**
 * Generate resume HTML template
 */
const generateResumeHTML = (resume) => {
  const { personalInfo, experience, education, skills, projects, template } = resume;

  const styles = {
    modern: `
      body { font-family: 'Georgia', serif; color: #1a1a2e; margin: 0; padding: 0; }
      .container { max-width: 800px; margin: 0 auto; padding: 40px; }
      .header { background: linear-gradient(135deg, #16213e 0%, #0f3460 100%); color: white; padding: 36px 40px; margin: -40px -40px 32px; }
      .header h1 { margin: 0 0 6px; font-size: 32px; font-weight: 700; letter-spacing: -0.5px; }
      .header .tagline { font-size: 14px; opacity: 0.85; margin: 0 0 16px; }
      .contact-row { display: flex; flex-wrap: wrap; gap: 16px; font-size: 12px; opacity: 0.9; }
      .contact-row span::before { content: '• '; }
      .contact-row span:first-child::before { content: ''; }
      h2.section-title { font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #0f3460; border-bottom: 2px solid #0f3460; padding-bottom: 6px; margin: 28px 0 14px; }
      .summary { font-size: 13px; line-height: 1.7; color: #444; }
      .exp-item { margin-bottom: 20px; }
      .exp-header { display: flex; justify-content: space-between; align-items: baseline; }
      .exp-header .role { font-weight: 700; font-size: 15px; }
      .exp-header .date { font-size: 12px; color: #666; }
      .exp-company { font-size: 13px; color: #0f3460; margin: 2px 0 8px; }
      .exp-bullets { margin: 0; padding-left: 18px; }
      .exp-bullets li { font-size: 12.5px; line-height: 1.6; margin-bottom: 3px; color: #333; }
      .edu-item { display: flex; justify-content: space-between; margin-bottom: 14px; }
      .edu-left .degree { font-weight: 700; font-size: 14px; }
      .edu-left .institution { font-size: 12.5px; color: #0f3460; }
      .edu-left .field { font-size: 12px; color: #666; }
      .edu-right { text-align: right; font-size: 12px; color: #666; }
      .skills-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .skill-cat label { font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #444; }
      .skill-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 5px; }
      .skill-tag { background: #f0f4ff; color: #0f3460; padding: 3px 10px; border-radius: 12px; font-size: 11.5px; }
      .project-item { margin-bottom: 16px; }
      .project-name { font-weight: 700; font-size: 14px; }
      .project-tech { font-size: 11.5px; color: #0f3460; margin: 3px 0; }
      .project-desc { font-size: 12.5px; color: #444; line-height: 1.6; }
    `,
    classic: `
      body { font-family: 'Times New Roman', Times, serif; color: #000; margin: 0; padding: 0; }
      .container { max-width: 800px; margin: 0 auto; padding: 48px; }
      .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 20px; margin-bottom: 24px; }
      .header h1 { font-size: 28px; margin: 0 0 8px; letter-spacing: 3px; text-transform: uppercase; }
      .contact-row { display: flex; justify-content: center; gap: 16px; font-size: 12px; flex-wrap: wrap; }
      .contact-row span { color: #333; }
      h2.section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #000; padding-bottom: 4px; margin: 24px 0 12px; }
      .summary { font-size: 13px; line-height: 1.8; }
      .exp-item { margin-bottom: 18px; }
      .exp-header { display: flex; justify-content: space-between; }
      .exp-header .role { font-weight: 700; font-size: 14px; }
      .exp-header .date { font-size: 12px; font-style: italic; }
      .exp-company { font-size: 13px; font-style: italic; margin: 2px 0 6px; }
      .exp-bullets { margin: 0; padding-left: 20px; }
      .exp-bullets li { font-size: 12.5px; line-height: 1.7; margin-bottom: 2px; }
      .edu-item { display: flex; justify-content: space-between; margin-bottom: 12px; }
      .edu-left .degree { font-weight: 700; font-size: 13.5px; }
      .edu-left .institution { font-style: italic; font-size: 12.5px; }
      .edu-right { font-size: 12px; text-align: right; }
      .skills-grid { columns: 2; gap: 20px; }
      .skill-cat { margin-bottom: 8px; }
      .skill-cat label { font-weight: 700; font-size: 12px; }
      .skill-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
      .skill-tag { font-size: 11.5px; }
      .skill-tag::after { content: ', '; }
      .skill-tag:last-child::after { content: ''; }
    `,
    minimal: `
      body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #222; margin: 0; padding: 0; }
      .container { max-width: 800px; margin: 0 auto; padding: 48px; }
      .header { margin-bottom: 32px; }
      .header h1 { font-size: 34px; font-weight: 300; margin: 0 0 4px; letter-spacing: -1px; color: #111; }
      .header .tagline { font-size: 14px; color: #888; margin: 0 0 12px; font-weight: 300; }
      .contact-row { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; color: #888; }
      h2.section-title { font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #999; margin: 28px 0 14px; }
      .summary { font-size: 13px; line-height: 1.8; color: #444; font-weight: 300; }
      .exp-item { margin-bottom: 24px; border-left: 2px solid #eee; padding-left: 16px; }
      .exp-header { display: flex; justify-content: space-between; }
      .exp-header .role { font-weight: 600; font-size: 14px; }
      .exp-header .date { font-size: 12px; color: #aaa; }
      .exp-company { font-size: 12px; color: #888; margin: 2px 0 8px; }
      .exp-bullets { margin: 0; padding-left: 0; list-style: none; }
      .exp-bullets li { font-size: 12.5px; line-height: 1.7; margin-bottom: 3px; color: #555; padding-left: 12px; position: relative; }
      .exp-bullets li::before { content: '—'; position: absolute; left: 0; color: #ccc; }
      .edu-item { display: flex; justify-content: space-between; margin-bottom: 12px; }
      .edu-left .degree { font-weight: 600; font-size: 13.5px; }
      .edu-left .institution { font-size: 12.5px; color: #888; }
      .edu-right { font-size: 12px; color: #aaa; text-align: right; }
      .skills-grid { display: flex; flex-wrap: wrap; gap: 8px; }
      .skill-tag { background: #f5f5f5; padding: 4px 12px; border-radius: 4px; font-size: 12px; color: #555; }
    `,
  };

  const css = styles[template] || styles.modern;

  const experienceHTML = (experience || []).map(exp => `
    <div class="exp-item">
      <div class="exp-header">
        <span class="role">${exp.position}</span>
        <span class="date">${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}</span>
      </div>
      <div class="exp-company">${exp.company}${exp.location ? ` · ${exp.location}` : ''}</div>
      <ul class="exp-bullets">
        ${(exp.bullets || []).map(b => `<li>${b}</li>`).join('')}
      </ul>
    </div>
  `).join('');

  const educationHTML = (education || []).map(edu => `
    <div class="edu-item">
      <div class="edu-left">
        <div class="degree">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</div>
        <div class="institution">${edu.institution}</div>
        ${edu.gpa ? `<div class="field">GPA: ${edu.gpa}</div>` : ''}
      </div>
      <div class="edu-right">
        <div>${edu.startDate} – ${edu.endDate}</div>
        ${edu.location ? `<div>${edu.location}</div>` : ''}
      </div>
    </div>
  `).join('');

  const allSkills = [
    ...(skills?.technical || []),
    ...(skills?.soft || []),
    ...(skills?.languages || []),
    ...(skills?.certifications || []),
  ];

  const skillsHTML = allSkills.length > 0 ? `
    <div class="skills-grid">
      ${skills?.technical?.length ? `<div class="skill-cat"><label>Technical</label><div class="skill-tags">${skills.technical.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div></div>` : ''}
      ${skills?.soft?.length ? `<div class="skill-cat"><label>Soft Skills</label><div class="skill-tags">${skills.soft.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div></div>` : ''}
      ${skills?.languages?.length ? `<div class="skill-cat"><label>Languages</label><div class="skill-tags">${skills.languages.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div></div>` : ''}
      ${skills?.certifications?.length ? `<div class="skill-cat"><label>Certifications</label><div class="skill-tags">${skills.certifications.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div></div>` : ''}
    </div>
  ` : '';

  const projectsHTML = (projects || []).map(p => `
    <div class="project-item">
      <div class="project-name">${p.name} ${p.link ? `<a href="${p.link}" style="font-size:11px; color:#0f3460;">[Live]</a>` : ''} ${p.github ? `<a href="${p.github}" style="font-size:11px; color:#0f3460;">[GitHub]</a>` : ''}</div>
      ${p.technologies?.length ? `<div class="project-tech">${p.technologies.join(' · ')}</div>` : ''}
      <div class="project-desc">${p.description}</div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${personalInfo?.firstName} ${personalInfo?.lastName} - Resume</title>
  <style>
    ${css}
    * { box-sizing: border-box; }
    @page { margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${personalInfo?.firstName || 'Your'} ${personalInfo?.lastName || 'Name'}</h1>
      ${personalInfo?.summary ? `<p class="tagline">${personalInfo.summary.substring(0, 120)}...</p>` : ''}
      <div class="contact-row">
        ${personalInfo?.email ? `<span>${personalInfo.email}</span>` : ''}
        ${personalInfo?.phone ? `<span>${personalInfo.phone}</span>` : ''}
        ${personalInfo?.location ? `<span>${personalInfo.location}</span>` : ''}
        ${personalInfo?.linkedin ? `<span>LinkedIn: ${personalInfo.linkedin}</span>` : ''}
        ${personalInfo?.github ? `<span>GitHub: ${personalInfo.github}</span>` : ''}
        ${personalInfo?.website ? `<span>${personalInfo.website}</span>` : ''}
      </div>
    </div>

    ${personalInfo?.summary ? `
    <h2 class="section-title">Professional Summary</h2>
    <p class="summary">${personalInfo.summary}</p>
    ` : ''}

    ${experience?.length ? `
    <h2 class="section-title">Experience</h2>
    ${experienceHTML}
    ` : ''}

    ${education?.length ? `
    <h2 class="section-title">Education</h2>
    ${educationHTML}
    ` : ''}

    ${allSkills.length ? `
    <h2 class="section-title">Skills</h2>
    ${skillsHTML}
    ` : ''}

    ${projects?.length ? `
    <h2 class="section-title">Projects</h2>
    ${projectsHTML}
    ` : ''}
  </div>
</body>
</html>`;
};

/**
 * Generate PDF from resume data using Puppeteer
 */
const generateResumePDF = async (resume) => {
  const html = generateResumeHTML(resume);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('print');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
};

/**
 * Generate cover letter PDF
 */
const generateCoverLetterPDF = async (resume, coverLetterText) => {
  const { personalInfo } = resume;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'Georgia', serif; color: #1a1a2e; margin: 0; padding: 0; }
  .container { max-width: 720px; margin: 0 auto; padding: 60px 48px; }
  .header { margin-bottom: 40px; }
  .name { font-size: 22px; font-weight: 700; color: #0f3460; }
  .contact { font-size: 12px; color: #666; margin-top: 6px; }
  .date { font-size: 13px; color: #444; margin-bottom: 28px; }
  .body-text { font-size: 13.5px; line-height: 1.9; color: #333; white-space: pre-wrap; }
  .signature { margin-top: 32px; font-size: 13.5px; }
  .sig-name { font-weight: 700; font-size: 15px; color: #0f3460; margin-top: 8px; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="name">${personalInfo?.firstName} ${personalInfo?.lastName}</div>
    <div class="contact">${[personalInfo?.email, personalInfo?.phone, personalInfo?.location].filter(Boolean).join(' · ')}</div>
  </div>
  <div class="date">${today}</div>
  <div class="body-text">${coverLetterText}</div>
  <div class="signature">
    <div>Sincerely,</div>
    <div class="sig-name">${personalInfo?.firstName} ${personalInfo?.lastName}</div>
  </div>
</div>
</body>
</html>`;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '0', right: '0', bottom: '0', left: '0' } });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
};

module.exports = { generateResumePDF, generateCoverLetterPDF, generateResumeHTML };
