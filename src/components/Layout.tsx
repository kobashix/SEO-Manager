import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Globe, Settings, Activity } from 'lucide-react';

export const Layout: React.FC = () => {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Activity size={24} />
          <span>TEQH Nexus</span>
        </div>
        <nav className="sidebar-nav">
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
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
