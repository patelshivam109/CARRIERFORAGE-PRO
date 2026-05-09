import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';

const SectionHeader = ({ title, onAdd, addLabel, isOpen, onToggle }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isOpen ? 14 : 0 }}>
    <button onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, padding: 0 }}>
      {isOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
      {title}
    </button>
    {onAdd && isOpen && (
      <button onClick={onAdd} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: 12 }}>
        <Plus size={13} /> {addLabel || 'Add'}
      </button>
    )}
  </div>
);

const Section = ({ title, children, onAdd, addLabel, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
      <div style={{ padding: '12px 16px', background: 'var(--bg-card)' }}>
        <SectionHeader title={title} onAdd={onAdd} addLabel={addLabel} isOpen={open} onToggle={() => setOpen(!open)} />
      </div>
      {open && <div style={{ padding: '0 16px 16px', background: 'var(--bg-secondary)' }}>{children}</div>}
    </div>
  );
};

const Field = ({ label, children }) => (
  <div className="form-group" style={{ marginBottom: 10 }}>
    <label className="form-label">{label}</label>
    {children}
  </div>
);

export default function ResumeForm({ resume, onChange }) {
  const update = (path, value) => {
    const keys = path.split('.');
    const updated = JSON.parse(JSON.stringify(resume));
    let obj = updated;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = value;
    onChange(updated);
  };

  const pi = resume.personalInfo || {};

  // ── Experience helpers
  const addExp = () => {
    const updated = { ...resume, experience: [...(resume.experience || []), { company: '', position: '', location: '', startDate: '', endDate: 'Present', current: false, bullets: [''] }] };
    onChange(updated);
  };
  const removeExp = (i) => {
    const experience = resume.experience.filter((_, idx) => idx !== i);
    onChange({ ...resume, experience });
  };
  const updateExp = (i, field, value) => {
    const experience = resume.experience.map((e, idx) => idx === i ? { ...e, [field]: value } : e);
    onChange({ ...resume, experience });
  };
  const addBullet = (expIdx) => {
    const experience = resume.experience.map((e, idx) => idx === expIdx ? { ...e, bullets: [...(e.bullets || []), ''] } : e);
    onChange({ ...resume, experience });
  };
  const updateBullet = (expIdx, bIdx, val) => {
    const experience = resume.experience.map((e, idx) => {
      if (idx !== expIdx) return e;
      const bullets = e.bullets.map((b, bi) => bi === bIdx ? val : b);
      return { ...e, bullets };
    });
    onChange({ ...resume, experience });
  };
  const removeBullet = (expIdx, bIdx) => {
    const experience = resume.experience.map((e, idx) => {
      if (idx !== expIdx) return e;
      return { ...e, bullets: e.bullets.filter((_, bi) => bi !== bIdx) };
    });
    onChange({ ...resume, experience });
  };

  // ── Education helpers
  const addEdu = () => {
    onChange({ ...resume, education: [...(resume.education || []), { institution: '', degree: '', field: '', location: '', startDate: '', endDate: '', gpa: '' }] });
  };
  const removeEdu = (i) => onChange({ ...resume, education: resume.education.filter((_, idx) => idx !== i) });
  const updateEdu = (i, field, value) => onChange({ ...resume, education: resume.education.map((e, idx) => idx === i ? { ...e, [field]: value } : e) });

  // ── Skills helpers
  const skills = resume.skills || {};
  const addSkill = (cat, val) => {
    if (!val.trim()) return;
    const updated = { ...resume, skills: { ...skills, [cat]: [...(skills[cat] || []), val.trim()] } };
    onChange(updated);
  };
  const removeSkill = (cat, i) => {
    onChange({ ...resume, skills: { ...skills, [cat]: skills[cat].filter((_, idx) => idx !== i) } });
  };

  // ── Project helpers
  const addProject = () => onChange({ ...resume, projects: [...(resume.projects || []), { name: '', description: '', technologies: [], link: '', github: '' }] });
  const removeProject = (i) => onChange({ ...resume, projects: resume.projects.filter((_, idx) => idx !== i) });
  const updateProject = (i, field, value) => onChange({ ...resume, projects: resume.projects.map((p, idx) => idx === i ? { ...p, [field]: value } : p) });

  return (
    <div>
      {/* Personal Info */}
      <Section title="Personal Information" defaultOpen>
        <div style={{ paddingTop: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="First name">
              <input className="form-input" value={pi.firstName || ''} onChange={e => update('personalInfo.firstName', e.target.value)} placeholder="Jane" />
            </Field>
            <Field label="Last name">
              <input className="form-input" value={pi.lastName || ''} onChange={e => update('personalInfo.lastName', e.target.value)} placeholder="Smith" />
            </Field>
          </div>
          <Field label="Email">
            <input className="form-input" type="email" value={pi.email || ''} onChange={e => update('personalInfo.email', e.target.value)} placeholder="jane@example.com" />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Phone">
              <input className="form-input" value={pi.phone || ''} onChange={e => update('personalInfo.phone', e.target.value)} placeholder="+1 555 000 0000" />
            </Field>
            <Field label="Location">
              <input className="form-input" value={pi.location || ''} onChange={e => update('personalInfo.location', e.target.value)} placeholder="New York, NY" />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="LinkedIn URL">
              <input className="form-input" value={pi.linkedin || ''} onChange={e => update('personalInfo.linkedin', e.target.value)} placeholder="linkedin.com/in/jane" />
            </Field>
            <Field label="GitHub URL">
              <input className="form-input" value={pi.github || ''} onChange={e => update('personalInfo.github', e.target.value)} placeholder="github.com/jane" />
            </Field>
          </div>
          <Field label="Portfolio / Website">
            <input className="form-input" value={pi.website || ''} onChange={e => update('personalInfo.website', e.target.value)} placeholder="janesmith.dev" />
          </Field>
          <Field label="Professional Summary">
            <textarea className="form-textarea" rows={4} value={pi.summary || ''} onChange={e => update('personalInfo.summary', e.target.value)} placeholder="A results-driven software engineer with 5+ years of experience..." />
          </Field>
        </div>
      </Section>

      {/* Experience */}
      <Section title={`Experience (${(resume.experience || []).length})`} onAdd={addExp} addLabel="Add job" defaultOpen>
        {(resume.experience || []).map((exp, i) => (
          <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14, marginBottom: 12, marginTop: i === 0 ? 14 : 0, background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)' }}>Job #{i + 1}</span>
              <button onClick={() => removeExp(i)} className="btn btn-danger btn-sm" style={{ padding: '3px 8px' }}><Trash2 size={12} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Job title">
                <input className="form-input" value={exp.position} onChange={e => updateExp(i, 'position', e.target.value)} placeholder="Software Engineer" />
              </Field>
              <Field label="Company">
                <input className="form-input" value={exp.company} onChange={e => updateExp(i, 'company', e.target.value)} placeholder="Acme Corp" />
              </Field>
              <Field label="Start date">
                <input className="form-input" value={exp.startDate} onChange={e => updateExp(i, 'startDate', e.target.value)} placeholder="Jan 2022" />
              </Field>
              <Field label="End date">
                <input className="form-input" value={exp.endDate} onChange={e => updateExp(i, 'endDate', e.target.value)} placeholder="Present" disabled={exp.current} />
              </Field>
            </div>
            <Field label="Location">
              <input className="form-input" value={exp.location} onChange={e => updateExp(i, 'location', e.target.value)} placeholder="San Francisco, CA (Remote)" />
            </Field>
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label className="form-label" style={{ margin: 0 }}>Bullet points</label>
                <button onClick={() => addBullet(i)} className="btn btn-secondary btn-sm" style={{ padding: '3px 8px', fontSize: 12 }}><Plus size={12} /> Add</button>
              </div>
              {(exp.bullets || []).map((b, bi) => (
                <div key={bi} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                  <GripVertical size={14} color="var(--text-muted)" style={{ marginTop: 10, flexShrink: 0 }} />
                  <input className="form-input" value={b} onChange={e => updateBullet(i, bi, e.target.value)} placeholder="Led a team of 5 engineers to deliver..." style={{ flex: 1 }} />
                  <button onClick={() => removeBullet(i, bi)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0, padding: 6 }}><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Section>

      {/* Education */}
      <Section title={`Education (${(resume.education || []).length})`} onAdd={addEdu} addLabel="Add education">
        {(resume.education || []).map((edu, i) => (
          <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14, marginBottom: 12, marginTop: i === 0 ? 14 : 0, background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)' }}>Education #{i + 1}</span>
              <button onClick={() => removeEdu(i)} className="btn btn-danger btn-sm" style={{ padding: '3px 8px' }}><Trash2 size={12} /></button>
            </div>
            <Field label="Institution"><input className="form-input" value={edu.institution} onChange={e => updateEdu(i, 'institution', e.target.value)} placeholder="MIT" /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Degree"><input className="form-input" value={edu.degree} onChange={e => updateEdu(i, 'degree', e.target.value)} placeholder="B.S." /></Field>
              <Field label="Field of study"><input className="form-input" value={edu.field} onChange={e => updateEdu(i, 'field', e.target.value)} placeholder="Computer Science" /></Field>
              <Field label="Start date"><input className="form-input" value={edu.startDate} onChange={e => updateEdu(i, 'startDate', e.target.value)} placeholder="Sep 2018" /></Field>
              <Field label="End date"><input className="form-input" value={edu.endDate} onChange={e => updateEdu(i, 'endDate', e.target.value)} placeholder="May 2022" /></Field>
            </div>
            <Field label="GPA (optional)"><input className="form-input" value={edu.gpa} onChange={e => updateEdu(i, 'gpa', e.target.value)} placeholder="3.9 / 4.0" /></Field>
          </div>
        ))}
      </Section>

      {/* Skills */}
      <Section title="Skills">
        {['technical', 'soft', 'languages', 'certifications'].map(cat => (
          <div key={cat} style={{ marginTop: 14 }}>
            <label className="form-label" style={{ textTransform: 'capitalize', marginBottom: 8, display: 'block' }}>{cat}</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {(skills[cat] || []).map((s, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 10px', fontSize: 12 }}>
                  {s}
                  <button onClick={() => removeSkill(cat, i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}><Trash2 size={10} /></button>
                </span>
              ))}
            </div>
            <SkillInput onAdd={(val) => addSkill(cat, val)} placeholder={`Add ${cat} skill…`} />
          </div>
        ))}
      </Section>

      {/* Projects */}
      <Section title={`Projects (${(resume.projects || []).length})`} onAdd={addProject} addLabel="Add project">
        {(resume.projects || []).map((proj, i) => (
          <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14, marginBottom: 12, marginTop: i === 0 ? 14 : 0, background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)' }}>Project #{i + 1}</span>
              <button onClick={() => removeProject(i)} className="btn btn-danger btn-sm" style={{ padding: '3px 8px' }}><Trash2 size={12} /></button>
            </div>
            <Field label="Project name"><input className="form-input" value={proj.name} onChange={e => updateProject(i, 'name', e.target.value)} placeholder="AI Resume Builder" /></Field>
            <Field label="Description"><textarea className="form-textarea" rows={2} value={proj.description} onChange={e => updateProject(i, 'description', e.target.value)} placeholder="A full-stack web app that..." /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Live URL"><input className="form-input" value={proj.link} onChange={e => updateProject(i, 'link', e.target.value)} placeholder="https://..." /></Field>
              <Field label="GitHub URL"><input className="form-input" value={proj.github} onChange={e => updateProject(i, 'github', e.target.value)} placeholder="github.com/..." /></Field>
            </div>
            <Field label="Technologies (comma-separated)">
              <input className="form-input" value={(proj.technologies || []).join(', ')} onChange={e => updateProject(i, 'technologies', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} placeholder="React, Node.js, MongoDB" />
            </Field>
          </div>
        ))}
      </Section>
    </div>
  );
}

function SkillInput({ onAdd, placeholder }) {
  const [val, setVal] = useState('');
  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (val.trim()) { onAdd(val.replace(',', '').trim()); setVal(''); }
    }
  };
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <input className="form-input" value={val} onChange={e => setVal(e.target.value)} onKeyDown={handleKey} placeholder={placeholder} style={{ flex: 1 }} />
      <button onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal(''); } }} className="btn btn-secondary btn-sm"><Plus size={14} /></button>
    </div>
  );
}
