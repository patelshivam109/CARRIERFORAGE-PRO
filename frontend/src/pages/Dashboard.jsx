import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resumeAPI, paymentAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, FileText, Trash2, Copy, Edit3, Crown, TrendingUp, Clock, ChevronRight } from 'lucide-react';

const TEMPLATES = ['modern', 'classic', 'minimal', 'executive', 'creative'];

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newResume, setNewResume] = useState({ title: 'My Resume', template: 'modern' });

  useEffect(() => {
    fetchResumes();
    if (searchParams.get('payment') === 'success') {
      toast.success('🎉 Welcome to Pro! Enjoy unlimited resumes.');
      refreshUser();
    }
  }, []); // eslint-disable-line

  const fetchResumes = async () => {
    try {
      const { data } = await resumeAPI.getAll();
      setResumes(data.resumes);
    } catch {
      toast.error('Failed to load resumes.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const { data } = await resumeAPI.create(newResume);
      toast.success('Resume created!');
      setShowNewModal(false);
      navigate(`/builder/${data.resume._id}`);
    } catch (err) {
      if (err.response?.data?.requiresUpgrade) {
        toast.error('Free plan limit reached. Upgrade to Pro for unlimited resumes.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to create resume.');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume? This cannot be undone.')) return;
    try {
      await resumeAPI.delete(id);
      setResumes(prev => prev.filter(r => r._id !== id));
      toast.success('Resume deleted.');
    } catch {
      toast.error('Failed to delete resume.');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const { data } = await resumeAPI.duplicate(id);
      setResumes(prev => [data.resume, ...prev]);
      toast.success('Resume duplicated!');
    } catch (err) {
      if (err.response?.data?.requiresUpgrade) {
        toast.error('Upgrade to Pro to create more resumes.');
      } else {
        toast.error('Failed to duplicate.');
      }
    }
  };

  const handleUpgrade = async () => {
    try {
      const { data } = await paymentAPI.createCheckout();
      window.location.href = data.url;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not open checkout. Please try again.');
    }
  };

  const getATSColor = (score) => {
    if (score >= 75) return 'var(--success)';
    if (score >= 50) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 48, paddingBottom: 60 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 32, marginBottom: 6 }}>
              Good to see you, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {resumes.length} resume{resumes.length !== 1 ? 's' : ''} · {' '}
              <span className={`badge badge-${user?.plan === 'pro' ? 'pro' : 'free'}`}>
                {user?.plan === 'pro' ? <><Crown size={10} /> Pro</> : 'Free plan'}
              </span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {user?.plan !== 'pro' && (
              <button onClick={handleUpgrade} className="btn btn-gold">
                <Crown size={16} /> Upgrade to Pro
              </button>
            )}
            <button onClick={() => setShowNewModal(true)} className="btn btn-primary">
              <Plus size={18} /> New Resume
            </button>
          </div>
        </div>

        {/* Pro upgrade banner */}
        {user?.plan !== 'pro' && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(232,184,109,0.08), rgba(124,109,250,0.08))',
            border: '1px solid rgba(232,184,109,0.25)',
            borderRadius: 'var(--radius-lg)', padding: '18px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 32, flexWrap: 'wrap', gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Crown size={20} color="var(--gold)" />
              <div>
                <p style={{ fontWeight: 600, fontSize: 15 }}>You're on the Free plan</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Upgrade to Pro for unlimited resumes, cover letters & premium templates</p>
              </div>
            </div>
            <button onClick={handleUpgrade} className="btn btn-gold btn-sm">
              Upgrade · $12/mo <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Resumes grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div className="spinner" />
          </div>
        ) : resumes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>No resumes yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Create your first AI-powered resume to get started.</p>
            <button onClick={() => setShowNewModal(true)} className="btn btn-primary">
              <Plus size={18} /> Create my first resume
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {resumes.map(resume => (
              <div key={resume._id} className="card" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 16 }}
                onClick={() => navigate(`/builder/${resume._id}`)}>
                {/* Card header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resume.title}</h3>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize', fontWeight: 500 }}>
                      {resume.template} template
                    </span>
                  </div>
                  {/* ATS score badge */}
                  {resume.atsScore > 0 && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: `${getATSColor(resume.atsScore)}18`,
                      border: `1px solid ${getATSColor(resume.atsScore)}44`,
                      borderRadius: 8, padding: '4px 10px',
                      color: getATSColor(resume.atsScore),
                      fontSize: 13, fontWeight: 700, flexShrink: 0,
                    }}>
                      <TrendingUp size={12} />
                      {resume.atsScore}%
                    </div>
                  )}
                </div>

                {/* JD indicator */}
                {resume.targetJobDescription && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="glow-dot" style={{ width: 6, height: 6 }} />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>JD loaded · ATS scored</span>
                  </div>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} />
                    {new Date(resume.updatedAt).toLocaleDateString()}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/builder/${resume._id}`)} data-tooltip="Edit">
                      <Edit3 size={14} />
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleDuplicate(resume._id)} data-tooltip="Duplicate">
                      <Copy size={14} />
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(resume._id)} data-tooltip="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New resume modal */}
      {showNewModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 24,
        }} onClick={() => setShowNewModal(false)}>
          <div className="card" style={{ width: '100%', maxWidth: 440, padding: 32 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 22, marginBottom: 24 }}>New resume</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 28 }}>
              <div className="form-group">
                <label className="form-label">Resume title</label>
                <input type="text" className="form-input" placeholder="e.g. Software Engineer – Google"
                  value={newResume.title} onChange={e => setNewResume(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Template {user?.plan !== 'pro' && <span style={{ color: 'var(--text-muted)' }}>(Pro unlocks all)</span>}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {TEMPLATES.map(t => {
                    const isPro = t !== 'modern' && user?.plan !== 'pro';
                    return (
                      <button key={t} onClick={() => !isPro && setNewResume(p => ({ ...p, template: t }))}
                        style={{
                          padding: '10px 8px', borderRadius: 8, border: `2px solid ${newResume.template === t ? 'var(--accent)' : 'var(--border)'}`,
                          background: newResume.template === t ? 'rgba(124,109,250,0.12)' : 'var(--bg-secondary)',
                          color: isPro ? 'var(--text-muted)' : 'var(--text-primary)',
                          cursor: isPro ? 'not-allowed' : 'pointer',
                          fontSize: 12, fontWeight: 500, textTransform: 'capitalize',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                          fontFamily: 'var(--font-body)',
                        }}>
                        {t}
                        {isPro && <Crown size={10} color="var(--gold)" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowNewModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleCreate} className="btn btn-primary" style={{ flex: 1 }} disabled={creating || !newResume.title.trim()}>
                {creating ? <><span className="spinner spinner-sm" /> Creating…</> : 'Create resume'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
