import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Target, FileText, TrendingUp, CheckCircle, Star } from 'lucide-react';

const features = [
  { icon: <Target size={22} />, title: 'JD Analysis Agent', desc: 'Paste any job description — our AI extracts, ranks, and maps every critical keyword in seconds.' },
  { icon: <Zap size={22} />, title: 'AI Bullet Rewriter', desc: 'Transform weak bullet points into ATS-optimised, metric-driven achievements with one click.' },
  { icon: <TrendingUp size={22} />, title: 'Live ATS Score', desc: 'Real-time scoring engine shows your match percentage and exactly what keywords you\'re missing.' },
  { icon: <FileText size={22} />, title: 'Pixel-perfect PDF', desc: 'Download a professionally formatted PDF rendered via headless Chrome — print-ready every time.' },
];

const plans = [
  {
    name: 'Free', price: '$0', period: 'forever', badge: null,
    features: ['1 resume', 'AI bullet rewriting', 'ATS scoring', 'PDF export (Modern template)'],
    cta: 'Start for free', href: '/register', style: 'secondary',
  },
  {
    name: 'Pro', price: '$12', period: '/month', badge: 'Most popular',
    features: ['Unlimited resumes', 'All 5 premium templates', 'Cover letter generator', 'Priority AI processing', 'Subscription management'],
    cta: 'Upgrade to Pro', href: '/register', style: 'gold',
  },
];

export default function Landing() {
  return (
    <div className="page" style={{ background: 'var(--bg-primary)' }}>
      {/* Hero */}
      <section style={{ padding: '100px 0 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,109,250,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="container">
          <div className="fade-up fade-up-1">
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(124,109,250,0.12)', border: '1px solid rgba(124,109,250,0.3)',
              color: 'var(--accent)', padding: '5px 14px', borderRadius: 99, fontSize: 13, marginBottom: 28,
            }}>
              <Zap size={13} fill="currentColor" /> Powered by Gemini 1.5 Flash
            </span>
          </div>

          <h1 className="fade-up fade-up-1" style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 700, marginBottom: 20, lineHeight: 1.1 }}>
            Land the job with an
            <br />
            <span className="serif gradient-text" style={{ fontStyle: 'italic' }}> AI-forged resume</span>
          </h1>

          <p className="fade-up fade-up-2" style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            CareerForge Pro analyses job descriptions, rewrites your experience with precision keywords, and exports a pixel-perfect PDF — all in under 2 minutes.
          </p>

          <div className="fade-up fade-up-3" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              <Zap size={18} fill="white" /> Build my resume free
            </Link>
            <Link to="/pricing" className="btn btn-secondary btn-lg">See pricing</Link>
          </div>

          <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
            No credit card required · Free plan forever
          </p>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: 36, marginBottom: 12 }}>
            Everything you need to <span className="gradient-text">get hired faster</span>
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 56, fontSize: 16 }}>
            Stop guessing what recruiters want. Let AI do the heavy lifting.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'rgba(124,109,250,0.12)', border: '1px solid rgba(124,109,250,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent)',
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '80px 0' }} id="pricing">
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: 36, marginBottom: 48 }}>Simple, transparent pricing</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, maxWidth: 720, margin: '0 auto' }}>
            {plans.map((plan, i) => (
              <div key={i} className="card" style={{
                position: 'relative',
                border: plan.badge ? '1px solid rgba(232,184,109,0.4)' : '1px solid var(--border)',
                background: plan.badge ? 'linear-gradient(135deg, #12121f, #1a1420)' : 'var(--bg-card)',
              }}>
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #e8b86d, #d4a054)',
                    color: '#0a0a12', padding: '3px 14px', borderRadius: 99,
                    fontSize: 11, fontWeight: 700,
                  }}>
                    {plan.badge}
                  </div>
                )}
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{plan.name}</span>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 42, fontWeight: 700 }}>{plan.price}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{plan.period}</span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                      <CheckCircle size={15} color="var(--success)" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to={plan.href} className={`btn btn-${plan.style}`} style={{ width: '100%', justifyContent: 'center' }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 0', textAlign: 'center' }}>
        <div className="container">
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            © {new Date().getFullYear()} CareerForge Pro · Built with ❤️ using MERN + Gemini AI
          </p>
        </div>
      </footer>
    </div>
  );
}
