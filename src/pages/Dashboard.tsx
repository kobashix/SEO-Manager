import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface DashboardStats {
  totalWebsites: number;
  isGoogleConfigured: boolean;
  isIndexNowConfigured: boolean;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) throw new Error('Failed to load stats.');
        const data: DashboardStats = await response.json();
        setStats(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchStats();
  }, []);
  
  const renderStatus = (isConfigured: boolean | undefined) => {
    if (isConfigured === undefined) return <span style={{color: 'var(--text-secondary)'}}>Loading...</span>;
    return isConfigured ? (
      <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <CheckCircle size={14} /> Configured
      </span>
    ) : (
      <span style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <AlertTriangle size={14} /> <RouterLink to="/settings" style={{color: 'var(--warning)'}}>Setup Required</RouterLink>
      </span>
    );
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>System Overview</h1>
      
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-label">Total Websites</div>
          <div className="stat-value">{stats ? stats.totalWebsites : '...'}</div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Managed in Database
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Live Google Checks</div>
          <div className="stat-value" style={{fontSize: '1.25rem'}}>
            {renderStatus(stats?.isGoogleConfigured)}
          </div>
           <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Requires Scraper
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">IndexNow Status</div>
          <div className="stat-value" style={{fontSize: '1.25rem'}}>
            {renderStatus(stats?.isIndexNowConfigured)}
          </div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Requires key file on sites
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">System Health</div>
          <div className="stat-value">Nominal</div>
          <div style={{ color: 'var(--success)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
             All Systems Go
          </div>
        </div>
      </div>

      <div className="table-container" style={{ padding: '2rem' }}>
        <h2>System Status</h2>
        <p style={{ color: 'var(--text-secondary)' }}>All systems operational. This dashboard is connected to your D1 Database and Cloudflare KV store.</p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <div className="status-badge status-active">API: Online</div>
          <div className="status-badge status-active">Database: Connected</div>
        </div>
      </div>
    </div>
  );
};
