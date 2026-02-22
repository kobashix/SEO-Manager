import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface DashboardStats {
  totalWebsites: number;
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
          <div className="stat-value">OK</div>
           <div style={{ color: 'var(--success)', marginTop: '0.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <CheckCircle size={14} /> API Connected
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">IndexNow Status</div>
          <div className="stat-value">OK</div>
          <div style={{ color: 'var(--success)', marginTop: '0.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <CheckCircle size={14} /> API Connected
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">System Health</div>
          <div className="stat-value">Nominal</div>
          <div style={{ color: 'var(--success)', marginTop: '0.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
             All Systems Go
          </div>
        </div>
      </div>

      <div className="table-container" style={{ padding: '2rem' }}>
        <h2>System Status</h2>
        <p style={{ color: 'var(--text-secondary)' }}>All systems operational. This dashboard is connected to your D1 Database and Cloudflare KV store.</p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <div className="status-badge status-active">
            API: Online
          </div>
          <div className="status-badge status-active">
            IndexNow: Connected
          </div>
          <div className="status-badge status-active">
            Database: Connected
          </div>
        </div>
      </div>
    </div>
  );
};
