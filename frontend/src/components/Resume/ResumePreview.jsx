import React from 'react';

export default function ResumePreview({ resume }) {
  const { personalInfo: pi = {}, experience = [], education = [], skills = {}, projects = [] } = resume;
  const template = resume.template || 'modern';

  const allSkills = [
    ...(skills.technical || []),
    ...(skills.soft || []),
    ...(skills.languages || []),
    ...(skills.certifications || []),
  ];

  const styles = {
    modern: {
      wrapper: { fontFamily: 'Georgia, serif', color: '#1a1a2e', background: '#fff', width: 794, minHeight: 1123, fontSize: 13 },
      header: { background: 'linear-gradient(135deg, #16213e 0%, #0f3460 100%)', color: '#fff', padding: '32px 40px 24px' },
      name: { fontSize: 28, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.3px' },
      contact: { fontSize: 11.5, opacity: 0.85, display: 'flex', flexWrap: 'wrap', gap: '4px 16px', marginTop: 12 },
      body: { padding: '24px 40px' },
      sectionTitle: { fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#0f3460', borderBottom: '2px solid #0f3460', paddingBottom: 5, margin: '24px 0 12px' },
      role: { fontWeight: 700, fontSize: 14.5 },
      company: { fontSize: 12.5, color: '#0f3460', margin: '2px 0 6px' },
      bullet: { fontSize: 12, lineHeight: 1.65, marginBottom: 3 },
      skillTag: { background: '#f0f4ff', color: '#0f3460', padding: '2px 10px', borderRadius: 12, fontSize: 11.5, display: 'inline-block', margin: '2px 3px' },
    },
    classic: {
      wrapper: { fontFamily: "'Times New Roman', serif", color: '#000', background: '#fff', width: 794, minHeight: 1123, fontSize: 13 },
      header: { textAlign: 'center', padding: '40px 48px 20px', borderBottom: '3px double #000' },
      name: { fontSize: 26, margin: '0 0 8px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700 },
      contact: { fontSize: 12, display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' },
      body: { padding: '20px 48px' },
      sectionTitle: { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '1px solid #000', paddingBottom: 3, margin: '20px 0 10px' },
      role: { fontWeight: 700, fontSize: 14 },
      company: { fontSize: 12.5, fontStyle: 'italic', margin: '2px 0 6px' },
      bullet: { fontSize: 12.5, lineHeight: 1.7, marginBottom: 2 },
      skillTag: { fontSize: 12 },
    },
    minimal: {
      wrapper: { fontFamily: "'Helvetica Neue', Helvetica, sans-serif", color: '#222', background: '#fff', width: 794, minHeight: 1123, fontSize: 13 },
      header: { padding: '44px 48px 28px' },
      name: { fontSize: 32, fontWeight: 300, margin: '0 0 4px', letterSpacing: '-1px' },
      contact: { fontSize: 12, color: '#888', display: 'flex', flexWrap: 'wrap', gap: '4px 14px', marginTop: 10 },
      body: { padding: '0 48px 40px' },
      sectionTitle: { fontSize: 10, fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: '#aaa', margin: '24px 0 12px' },
      role: { fontWeight: 600, fontSize: 14 },
      company: { fontSize: 12, color: '#888', margin: '2px 0 8px' },
      bullet: { fontSize: 12.5, lineHeight: 1.7, marginBottom: 3, paddingLeft: 14, position: 'relative' },
      skillTag: { background: '#f5f5f5', padding: '3px 12px', borderRadius: 4, fontSize: 12, color: '#555', display: 'inline-block', margin: '2px 3px' },
    },
  };

  const s = styles[template] || styles.modern;

  return (
    <div style={{ ...s.wrapper, boxShadow: '0 8px 48px rgba(0,0,0,0.5)', borderRadius: 4, overflow: 'hidden' }}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.name}>{pi.firstName || 'Your'} {pi.lastName || 'Name'}</div>
        <div style={s.contact}>
          {pi.email && <span>{pi.email}</span>}
          {pi.phone && <span>{pi.phone}</span>}
          {pi.location && <span>{pi.location}</span>}
          {pi.linkedin && <span>in/{pi.linkedin.replace(/.*linkedin\.com\/in\//,'')}</span>}
          {pi.github && <span>github/{pi.github.replace(/.*github\.com\//,'')}</span>}
          {pi.website && <span>{pi.website}</span>}
        </div>
      </div>

      <div style={s.body}>
        {/* Summary */}
        {pi.summary && (
          <>
            <div style={s.sectionTitle}>Professional Summary</div>
            <p style={{ fontSize: 12.5, lineHeight: 1.75, color: template === 'minimal' ? '#555' : 'inherit' }}>{pi.summary}</p>
          </>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <>
            <div style={s.sectionTitle}>Experience</div>
            {experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={s.role}>{exp.position}</span>
                  <span style={{ fontSize: 11.5, color: template === 'minimal' ? '#aaa' : '#666' }}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <div style={s.company}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                <ul style={{ margin: 0, paddingLeft: template === 'minimal' ? 0 : 18, listStyle: template === 'minimal' ? 'none' : 'disc' }}>
                  {(exp.bullets || []).filter(Boolean).map((b, bi) => (
                    <li key={bi} style={s.bullet}>
                      {template === 'minimal' && <span style={{ position: 'absolute', left: 0, color: '#ddd' }}>—</span>}
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}

        {/* Education */}
        {education.length > 0 && (
          <>
            <div style={s.sectionTitle}>Education</div>
            {education.map((edu, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</div>
                  <div style={{ fontSize: 12.5, color: template === 'modern' ? '#0f3460' : template === 'minimal' ? '#888' : '#555', fontStyle: template === 'classic' ? 'italic' : 'normal' }}>{edu.institution}</div>
                  {edu.gpa && <div style={{ fontSize: 12, color: '#888' }}>GPA: {edu.gpa}</div>}
                </div>
                <div style={{ textAlign: 'right', fontSize: 12, color: '#888' }}>
                  <div>{edu.startDate} – {edu.endDate}</div>
                  {edu.location && <div>{edu.location}</div>}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Skills */}
        {allSkills.length > 0 && (
          <>
            <div style={s.sectionTitle}>Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {template === 'classic' ? (
                <p style={{ fontSize: 12.5 }}>{allSkills.join(' · ')}</p>
              ) : (
                allSkills.map((sk, i) => <span key={i} style={s.skillTag}>{sk}</span>)
              )}
            </div>
          </>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <>
            <div style={s.sectionTitle}>Projects</div>
            {projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                {p.technologies?.length > 0 && <div style={{ fontSize: 11.5, color: template === 'modern' ? '#0f3460' : '#888', margin: '2px 0' }}>{p.technologies.join(' · ')}</div>}
                {p.description && <p style={{ fontSize: 12.5, lineHeight: 1.6, color: '#444' }}>{p.description}</p>}
              </div>
            ))}
          </>
        )}

        {/* Empty state */}
        {!pi.firstName && experience.length === 0 && education.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#ccc' }}>
            <p style={{ fontSize: 16, marginBottom: 8 }}>Your resume preview will appear here</p>
            <p style={{ fontSize: 13 }}>Start filling in the form on the left →</p>
          </div>
        )}
      </div>
    </div>
  );
}
