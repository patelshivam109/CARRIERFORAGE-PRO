import React, { useState } from 'react';
import { aiAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Target, CheckCircle, XCircle, AlertCircle, Loader, ChevronRight } from 'lucide-react';

const ATSRing = ({ score }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? '#4ade80' : score >= 50 ? '#fbbf24' : '#f87171';

  return (
    <div className="ats-ring" style={{ width: 130, height: 130 }}>
      <svg width="130" height="130">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle cx="65" cy="65" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="score-text">
        <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ATS Score</div>
      </div>
    </div>
  );
};

export default function ATSPanel({ resume, resumeId, onUpdate }) {
  const [jd, setJd] = useState(resume.targetJobDescription || '');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(
    resume.atsScore > 0 ? {
      score: resume.atsScore,
      matchedKeywords: resume.matchedKeywords || [],
      missingKeywords: resume.missingKeywords || [],
    } : null
  );

  const handleAnalyze = async () => {
    if (jd.trim().length < 50) {
      toast.error('Please paste a complete job description (at least 50 characters).');
      return;
    }
    setAnalyzing(true);
    try {
      const { data } = await aiAPI.analyzeJD({ jobDescription: jd, resumeId });

      if (!data.atsResult) {
        // JD was analysed but no resume match — still save the JD
        onUpdate({ ...resume, targetJobDescription: jd });
        toast.success('Job description analysed! Open the AI Magic tab to use AI rewrites.');
        return;
      }

      setResult(data.atsResult);
      onUpdate({
        ...resume,
        targetJobDescription: jd,
        atsScore: data.atsResult.score,
        matchedKeywords: data.atsResult.matchedKeywords || [],
        missingKeywords: data.atsResult.missingKeywords || [],
      });
      toast.success(`ATS Score: ${data.atsResult.score}%`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Analysis failed. Please try again.';
      toast.error(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>ATS Score Analyser</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Paste the target job description to get your keyword match score and find gaps.
        </p>
      </div>

      <div className="form-group">
        <label className="form-label">Job Description</label>
        <textarea className="form-textarea" rows={7} value={jd} onChange={e => setJd(e.target.value)}
          placeholder="Paste the full job description here…" />
      </div>

      <button onClick={handleAnalyze} className="btn btn-primary" disabled={analyzing} style={{ justifyContent: 'center' }}>
        {analyzing ? <><Loader size={15} /> Analysing with AI…</> : <><Target size={15} /> Analyse JD & Score Resume</>}
      </button>

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeUp 0.4s ease forwards' }}>
          {/* Score ring */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
            <ATSRing score={result.score} />
          </div>

          {/* Summary */}
          {result.summary && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.summary}</p>
            </div>
          )}

          {/* Matched keywords */}
          {result.matchedKeywords?.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <CheckCircle size={15} color="var(--success)" />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Matched keywords ({result.matchedKeywords.length})</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.matchedKeywords.map((kw, i) => (
                  <span key={i} style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', color: 'var(--success)', padding: '3px 10px', borderRadius: 6, fontSize: 12 }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing keywords */}
          {result.missingKeywords?.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <XCircle size={15} color="var(--danger)" />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Missing keywords ({result.missingKeywords.length})</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.missingKeywords.map((kw, i) => (
                  <span key={i} style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: 'var(--danger)', padding: '3px 10px', borderRadius: 6, fontSize: 12 }}>
                    {kw}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
                <AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                Switch to <strong>AI Magic</strong> tab to auto-add these to your resume.
              </p>
            </div>
          )}

          {/* Strengths & improvements */}
          {result.strengths?.length > 0 && (
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>💪 Strengths</p>
              {result.strengths.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <ChevronRight size={14} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} /> {s}
                </div>
              ))}
            </div>
          )}

          {result.improvements?.length > 0 && (
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>🎯 Improvements</p>
              {result.improvements.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <ChevronRight size={14} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} /> {s}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
