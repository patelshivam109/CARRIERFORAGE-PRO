import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap, LayoutDashboard, LogOut, Menu, X, Crown } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isBuilder = location.pathname.startsWith('/builder/');

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 64, zIndex: 1000,
      background: 'rgba(7,7,15,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #7c6dfa, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text-primary)' }}>
            Career<span style={{ color: 'var(--accent)' }}>Forge</span>
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', letterSpacing: 1 }}>PRO</span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="hide-mobile">
          {!isBuilder && (
            <Link to="/pricing" className="btn btn-secondary btn-sm">Pricing</Link>
          )}
          {user ? (
            <>
              {user.plan === 'pro' && (
                <span className="badge badge-pro"><Crown size={10} /> Pro</span>
              )}
              <Link to="/dashboard" className="btn btn-secondary btn-sm">
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                <LogOut size={15} /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Sign in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get started free</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: 'none' }}
          aria-label="Menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: 64, left: 0, right: 0,
          background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
          padding: 16, display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <Link to="/pricing" className="btn btn-secondary" onClick={() => setMenuOpen(false)}>Pricing</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-secondary" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} className="btn btn-danger">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link to="/register" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Get started free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
