import React from 'react';
import { mockStats } from '../services/mockData';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>System Overview</h1>
      
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-label">Total Domains</div>
          <div className="stat-value">{mockStats.totalDomains}</div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Active Portfolio
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Indexed URLs</div>
          <div className="stat-value">{mockStats.indexedUrls}</div>
          <div style={{ color: 'var(--success)', marginTop: '0.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <CheckCircle size={14} /> 98% Healthy
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Warnings</div>
          <div className="stat-value">{mockStats.warnings}</div>
          <div style={{ color: 'var(--warning)', marginTop: '0.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <AlertTriangle size={14} /> Attention Needed
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Critical Errors</div>
          <div className="stat-value">{mockStats.errors}</div>
          <div style={{ color: 'var(--error)', marginTop: '0.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <XCircle size={14} /> Immediate Action
          </div>
        </div>
      </div>

      <div className="table-container" style={{ padding: '2rem' }}>
        <h2>System Status</h2>
        <p style={{ color: 'var(--text-secondary)' }}>All systems operational. IndexNow gateway is active.</p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <div className="status-badge status-active">
            API: Online
          </div>
          <div className="status-badge status-active">
            IndexNow: Connected
          </div>
          <div className="status-badge status-active">
            Crawlers: Active
          </div>
        </div>
      </div>
    </div>
  );
};
