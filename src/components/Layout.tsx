import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Globe, Settings, Activity, Twitter, Facebook, Linkedin, Instagram, Youtube } from 'lucide-react';

export const Layout: React.FC = () => {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Activity size={24} />
          <span>TEQH Nexus</span>
        </div>
        <nav className="sidebar-nav" style={{ flex: 1 }}>
          <NavLink
            to="/"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/websites"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Globe size={20} />
            <span>Websites</span>
          </NavLink>
          <a href="https://www.google.com/adsense/start/" target="_blank" rel="noopener noreferrer" className="nav-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            <span>AdSense</span>
          </a>
          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '1rem 0', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="https://twitter.com/teqh" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }} title="Twitter"><Twitter size={18} /></a>
            <a href="https://facebook.com/teqh" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }} title="Facebook"><Facebook size={18} /></a>
            <a href="https://linkedin.com/company/teqh" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }} title="LinkedIn"><Linkedin size={18} /></a>
            <a href="https://instagram.com/teqh" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }} title="Instagram"><Instagram size={18} /></a>
            <a href="https://youtube.com/@teqh" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }} title="YouTube"><Youtube size={18} /></a>
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
            © 2026 TEQH SEO Nexus
          </div>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
