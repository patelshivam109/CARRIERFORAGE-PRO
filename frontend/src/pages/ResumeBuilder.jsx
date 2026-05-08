import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resumeAPI, aiAPI, downloadBlob } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ResumeForm from '../components/Resume/ResumeForm';
import ResumePreview from '../components/Resume/ResumePreview';
import ATSPanel from '../components/Resume/ATSPanel';
import AIPanel from '../components/Resume/AIPanel';
import { Save, Download, FileText, Target, Zap, ArrowLeft, Crown, Loader } from 'lucide-react';

const TABS = [
  { id: 'edit', label: 'Editor', icon: <FileText size={15} /> },
  { id: 'ats', label: 'ATS Score', icon: <Target size={15} /> },
  { id: 'ai', label: 'AI Magic', icon: <Zap size={15} /> },
];

export default function ResumeBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');
  const [showPreview, setShowPreview] = useState(true);
  const saveTimer = useRef(null);

  useEffect(() => {
    fetchResume();
  }, [id]); // eslint-disable-line

  const fetchResume = async () => {
    try {
      const { data } = await resumeAPI.getOne(id);
      setResume(data.resume);
    } catch {
      toast.error('Resume not found.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Debounced auto-save
  const handleChange = useCallback((updatedResume) => {
    setResume(updatedResume);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await resumeAPI.update(id, updatedResume);
      } catch {
        // Silent fail for auto-save
      }
    }, 1500);
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await resumeAPI.update(id, resume);
      toast.success('Saved!');
    } catch {
      toast.error('Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await aiAPI.exportResumePDF(id);
      const filename = `${resume.personalInfo?.firstName || 'Resume'}_${resume.personalInfo?.lastName || ''}.pdf`;
      downloadBlob(data, filename);
      toast.success('PDF downloaded!');
    } catch {
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleResumeUpdate = (updated) => {
    setResume(updated);
    handleChange(updated);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 12px' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading your resume…</p>
      </div>
    </div>
  );

  if (!resume) return null;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', paddingTop: 64 }}>
      {/* Builder Toolbar */}
      <div style={{
        height: 56, background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, flexShrink: 0,
      }}>
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary btn-sm">
          <ArrowLeft size={15} /> Dashboard
        </button>

        <div style={{ height: 20, width: 1, background: 'var(--border)' }} />

        {/* Resume title */}
        <input
          type="text"
          value={resume.title}
          onChange={e => handleChange({ ...resume, title: e.target.value })}
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
            fontSize: 15, fontWeight: 600, minWidth: 0, flex: 1, maxWidth: 280,
          }}
        />

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* ATS Score pill */}
          {resume.atsScore > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px',
              borderRadius: 99, border: '1px solid rgba(124,109,250,0.3)',
              background: 'rgba(124,109,250,0.1)', fontSize: 13, fontWeight: 600,
              color: 'var(--accent)',
            }}>
              <Target size={13} />
              ATS {resume.atsScore}%
            </div>
          )}

          <button onClick={handleSave} className="btn btn-secondary btn-sm" disabled={saving}>
            {saving ? <Loader size={14} className="spin" /> : <Save size={14} />}
            {saving ? 'Saving…' : 'Save'}
          </button>

          <button onClick={handleExport} className="btn btn-primary btn-sm" disabled={exporting}>
            {exporting ? <Loader size={14} /> : <Download size={14} />}
            {exporting ? 'Generating…' : 'Export PDF'}
          </button>

          {user?.plan !== 'pro' && (
            <button onClick={() => navigate('/pricing')} className="btn btn-gold btn-sm">
              <Crown size={14} /> Upgrade
            </button>
          )}
        </div>
      </div>

      {/* Main builder area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left panel - tabs */}
        <div style={{
          width: 420, flexShrink: 0, background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Tabs */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <div className="tabs">
              {TABS.map(tab => (
                <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
            {activeTab === 'edit' && (
              <ResumeForm resume={resume} onChange={handleResumeUpdate} />
            )}
            {activeTab === 'ats' && (
              <ATSPanel resume={resume} resumeId={id} onUpdate={handleResumeUpdate} />
            )}
            {activeTab === 'ai' && (
              <AIPanel resume={resume} resumeId={id} onUpdate={handleResumeUpdate} userPlan={user?.plan} />
            )}
          </div>
        </div>

        {/* Right panel - live preview */}
        {showPreview && (
          <div style={{ flex: 1, overflow: 'auto', background: '#1a1a24', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 0' }}>
            <ResumePreview resume={resume} />
          </div>
        )}
      </div>
    </div>
  );
}
