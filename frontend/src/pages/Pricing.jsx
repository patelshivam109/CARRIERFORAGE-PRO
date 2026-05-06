import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { paymentAPI } from '../services/api';
import toast from 'react-hot-toast';
import { CheckCircle, Crown, Zap } from 'lucide-react';

const FREE_FEATURES = ['1 resume', 'AI bullet rewriting', 'ATS score analyser', 'PDF export (Modern template)', 'Skills suggestions'];
const PRO_FEATURES = ['Everything in Free', 'Unlimited resumes', 'All 5 premium templates', 'Cover letter generator', 'Cover letter PDF export', 'Priority AI processing', 'Subscription management portal'];

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleUpgrade = async () => {
    if (!user) { navigate('/register'); return; }
    setLoading(true);
    try {
      const { data } = await paymentAPI.createCheckout();
      window.location.href = data.url;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not open checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 72, paddingBottom: 80 }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h1 style={{ fontSize: 44, marginBottom: 12 }}>Simple, <span className="gradient-text">honest</span> pricing</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 17 }}>Start for free. Upgrade when you need more.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, maxWidth: 740, margin: '0 auto' }}>
          {/* Free */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>Free</span>
            </div>
            <div style={{ marginBottom: 28 }}>
              <span style={{ fontSize: 48, fontWeight: 700 }}>$0</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}> / forever</span>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, flex: 1, marginBottom: 28 }}>
              {FREE_FEATURES.map((f, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  <CheckCircle size={16} color="var(--success)" style={{ flexShrink: 0 }} /> {f}
                </li>
              ))}
            </ul>
            {user ? (
              <Link to="/dashboard" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/register" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                Get started free
              </Link>
            )}
          </div>

          {/* Pro */}
          <div className="card" style={{
            display: 'flex', flexDirection: 'column', gap: 0, position: 'relative',
            border: '1px solid rgba(232,184,109,0.4)',
            background: 'linear-gradient(135deg, #12121f 0%, #1a1420 100%)',
          }}>
            <div style={{
              position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #e8b86d, #d4a054)',
              color: '#0a0a12', padding: '4px 18px', borderRadius: 99,
              fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <Crown size={12} /> Most Popular
            </div>

            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: 1 }}>Pro</span>
            </div>
            <div style={{ marginBottom: 28 }}>
              <span style={{ fontSize: 48, fontWeight: 700 }}>$12</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}> / month</span>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, flex: 1, marginBottom: 28 }}>
              {PRO_FEATURES.map((f, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  <CheckCircle size={16} color="var(--gold)" style={{ flexShrink: 0 }} /> {f}
                </li>
              ))}
            </ul>

            {user?.plan === 'pro' ? (
              <div className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', opacity: 0.7, cursor: 'default' }}>
                <Crown size={16} /> Current plan
              </div>
            ) : (
              <button onClick={handleUpgrade} className="btn btn-gold" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? <><span className="spinner spinner-sm" /> Redirecting…</> : <><Zap size={16} fill="#0a0a12" /> Upgrade to Pro</>}
              </button>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 32, color: 'var(--text-muted)', fontSize: 13 }}>
          Cancel anytime · Secure payments via Stripe · 30-day money-back guarantee
        </p>
      </div>
    </div>
  );
}
