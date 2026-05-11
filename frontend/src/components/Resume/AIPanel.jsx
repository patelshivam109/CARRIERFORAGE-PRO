import React, { useState } from 'react';
import { aiAPI, downloadBlob } from '../../services/api';
import toast from 'react-hot-toast';
import { Zap, Crown, RotateCcw, Check, Loader, Sparkles, FileText, Lightbulb } from 'lucide-react';

const ProGate = ({ children, userPlan, feature }) => {
  if (userPlan !== 'pro') {
    return (
      <div style={{ border: '1px solid rgba(232,184,109,0.3)', borderRadius: 10, padding: 16, background: 'rgba(232,184,109,0.05)', textAlign: 'center' }}>
        <Crown size={20} color="var(--gold)" style={{ margin: '0 auto 8px' }} />
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{feature} is Pro only</p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>Upgrade to unlock unlimited AI rewrites, cover letters, and more.</p>
        <a href="/pricing" className="btn btn-gold btn-sm" style={{ display: 'inline-flex' }}>
          <Crown size={13} /> Upgrade to Pro
        </a>
      </div>
    );
  }
  return children;
};

export default function AIPanel({ resume, resumeId, onUpdate, userPlan }) {
  const [rewritingExp, setRewritingExp] = useState(null);
  const [rewritingSummary, setRewritingSummary] = useState(false);
  const [generatingCL, setGeneratingCL] = useState(false);
  const [exportingCL, setExportingCL] = useState(false);
  const [suggestingSkills, setSuggestingSkills] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [clForm, setClForm] = useState({ jobTitle: resume.coverLetterJobTitle || '', company: resume.coverLetterCompany || '' });
  const [showCLForm, setShowCLForm] = useState(false);

  const hasJD = !!resume.targetJobDescription;

  const handleRewriteExp = async (idx) => {
    if (!hasJD) { toast.error('Please analyse a job description first (ATS Score tab).'); return; }
    setRewritingExp(idx);
    try {
      const { data } = await aiAPI.rewriteExperience(resumeId, { experienceIndex: idx });
      const updated = { ...resume };
      updated.experience[idx].bullets = data.rewrittenBullets;
      updated.experience[idx].originalBullets = data.originalBullets;
      onUpdate(updated);
      toast.success('Bullets rewritten!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rewrite failed.');
    } finally {
      setRewritingExp(null);
    }
  };

  const handleRestoreExp = (idx) => {
    if (!resume.experience[idx].originalBullets?.length) { toast('No original version to restore.'); return; }
    const updated = { ...resume };
    updated.experience[idx].bullets = [...updated.experience[idx].originalBullets];
    onUpdate(updated);
    toast.success('Restored original bullets.');
  };

  const handleRewriteSummary = async () => {
    if (!hasJD) { toast.error('Please analyse a job description first.'); return; }
    setRewritingSummary(true);
    try {
      const { data } = await aiAPI.rewriteSummary(resumeId);
      onUpdate({ ...resume, personalInfo: { ...resume.personalInfo, summary: data.summary } });
      toast.success('Summary rewritten!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rewrite failed.');
    } finally {
      setRewritingSummary(false);
    }
  };

  const handleSuggestSkills = async () => {
    if (!hasJD) { toast.error('Please analyse a job description first.'); return; }
    setSuggestingSkills(true);
    try {
      const { data } = await aiAPI.suggestSkills(resumeId);
      setSuggestions(data.suggestions);
      toast.success('Skills suggestions ready!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to suggest skills.');
    } finally {
      setSuggestingSkills(false);
    }
  };

  const addSuggestedSkill = (cat, skill) => {
    const skillsCat = cat === 'technicalSkills' ? 'technical' : cat === 'softSkills' ? 'soft' : 'certifications';
    const current = resume.skills?.[skillsCat] || [];
    if (current.includes(skill)) return;
    onUpdate({ ...resume, skills: { ...resume.skills, [skillsCat]: [...current, skill] } });
    toast.success(`Added "${skill}"`);
  };

  const handleGenerateCL = async () => {
    setGeneratingCL(true);
    try {
      const { data } = await aiAPI.generateCoverLetter(resumeId, clForm);
      onUpdate({ ...resume, coverLetter: data.coverLetter, coverLetterJobTitle: clForm.jobTitle, coverLetterCompany: clForm.company });
      setShowCLForm(false);
      toast.success('Cover letter generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate cover letter.');
    } finally {
      setGeneratingCL(false);
    }
  };

  const handleExportCL = async () => {
    setExportingCL(true);
    try {
      const { data } = await aiAPI.exportCoverLetterPDF(resumeId);
      downloadBlob(data, `Cover_Letter_${resume.personalInfo?.firstName || ''}.pdf`);
      toast.success('Cover letter PDF downloaded!');
    } catch {
      toast.error('Export failed.');
    } finally {
      setExportingCL(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!hasJD && (
        <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 10, padding: 12, fontSize: 13, color: 'var(--warning)' }}>
          ⚠️ Analyse a job description in the <strong>ATS Score</strong> tab first to enable AI features.
        </div>
      )}

      {/* Rewrite Summary */}
      <div className="card" style={{ padding: 16, gap: 12, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={16} color="var(--accent)" />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Rewrite Summary</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>AI rewrites your professional summary to match the JD with power keywords.</p>
        <button onClick={handleRewriteSummary} className="btn btn-primary btn-sm" disabled={rewritingSummary || !hasJD} style={{ justifyContent: 'center' }}>
          {rewritingSummary ? <><Loader size={14} /> Rewriting…</> : <><Zap size={14} /> Rewrite Summary</>}
        </button>
      </div>

      {/* Rewrite Experience bullets */}
      <div className="card" style={{ padding: 16, gap: 12, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={16} color="var(--accent)" />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Rewrite Experience Bullets</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Transform each job's bullets into ATS-optimised, metric-driven achievements.</p>
        {(resume.experience || []).length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Add experience entries in the Editor tab first.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {resume.experience.map((exp, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.position || `Job #${i + 1}`}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{exp.company}</p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {exp.originalBullets?.length > 0 && (
                    <button onClick={() => handleRestoreExp(i)} className="btn btn-secondary btn-sm" data-tooltip="Restore original" style={{ padding: '5px 8px' }}>
                      <RotateCcw size={12} />
                    </button>
                  )}
                  <button onClick={() => handleRewriteExp(i)} className="btn btn-primary btn-sm" disabled={rewritingExp === i || !hasJD}>
                    {rewritingExp === i ? <Loader size={13} /> : <Zap size={13} />}
                    {rewritingExp === i ? 'Rewriting…' : 'Rewrite'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skill Suggestions */}
      <div className="card" style={{ padding: 16, gap: 12, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lightbulb size={16} color="var(--accent)" />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Skill Suggestions</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>AI finds skills from the JD that are missing from your resume.</p>
        <button onClick={handleSuggestSkills} className="btn btn-secondary btn-sm" disabled={suggestingSkills || !hasJD} style={{ justifyContent: 'center' }}>
          {suggestingSkills ? <><Loader size={14} /> Analysing…</> : <><Lightbulb size={14} /> Suggest Missing Skills</>}
        </button>

        {suggestions && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(suggestions).map(([cat, skillList]) => (
              skillList?.length > 0 && (
                <div key={cat}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'capitalize', marginBottom: 6 }}>
                    {cat.replace('Skills', ' Skills').replace('Certifications', 'Certifications')}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {skillList.map((skill, i) => {
                      const cat2 = cat === 'technicalSkills' ? 'technical' : cat === 'softSkills' ? 'soft' : 'certifications';
                      const alreadyAdded = (resume.skills?.[cat2] || []).includes(skill);
                      return (
                        <button key={i} onClick={() => !alreadyAdded && addSuggestedSkill(cat, skill)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            background: alreadyAdded ? 'rgba(74,222,128,0.1)' : 'rgba(124,109,250,0.1)',
                            border: `1px solid ${alreadyAdded ? 'rgba(74,222,128,0.3)' : 'rgba(124,109,250,0.3)'}`,
                            color: alreadyAdded ? 'var(--success)' : 'var(--accent)',
                            padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: alreadyAdded ? 'default' : 'pointer',
                            fontFamily: 'var(--font-body)',
                          }}>
                          {alreadyAdded ? <Check size={11} /> : <Zap size={11} />} {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Cover Letter - Pro only */}
      <ProGate userPlan={userPlan} feature="Cover Letter Generator">
        <div className="card" style={{ padding: 16, gap: 12, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} color="var(--gold)" />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Cover Letter Generator</span>
            <span className="badge badge-pro" style={{ marginLeft: 'auto' }}><Crown size={10} /> Pro</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Generate a personalised, tailored cover letter based on your resume and the JD.</p>

          {!showCLForm ? (
            <button onClick={() => setShowCLForm(true)} className="btn btn-gold btn-sm" style={{ justifyContent: 'center' }}>
              <Crown size={14} /> Generate Cover Letter
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="form-group">
                <label className="form-label">Job title</label>
                <input className="form-input" value={clForm.jobTitle} onChange={e => setClForm(p => ({ ...p, jobTitle: e.target.value }))} placeholder="Senior Software Engineer" />
              </div>
              <div className="form-group">
                <label className="form-label">Company name</label>
                <input className="form-input" value={clForm.company} onChange={e => setClForm(p => ({ ...p, company: e.target.value }))} placeholder="Google" />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowCLForm(false)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Cancel</button>
                <button onClick={handleGenerateCL} className="btn btn-gold btn-sm" disabled={generatingCL} style={{ flex: 1, justifyContent: 'center' }}>
                  {generatingCL ? <><Loader size={13} /> Generating…</> : <><Zap size={13} /> Generate</>}
                </button>
              </div>
            </div>
          )}

          {resume.coverLetter && (
            <div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 14, marginBottom: 10, maxHeight: 200, overflow: 'auto' }}>
                <p className="prose" style={{ fontSize: 12 }}>{resume.coverLetter}</p>
              </div>
              <button onClick={handleExportCL} className="btn btn-secondary btn-sm" disabled={exportingCL} style={{ width: '100%', justifyContent: 'center' }}>
                {exportingCL ? <><Loader size={13} /> Generating PDF…</> : <><FileText size={13} /> Download Cover Letter PDF</>}
              </button>
            </div>
          )}
        </div>
      </ProGate>
    </div>
  );
}
