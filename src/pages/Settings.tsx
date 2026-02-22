import React from 'react';

export const Settings: React.FC = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Configuration</h1>

      <div className="dashboard-grid">
        <div className="stat-card" style={{ gridColumn: 'span 2' }}>
          <h3>API Keys</h3>
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>IndexNow API Key</label>
              <input type="password" value="************************" readOnly style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Google Search Console Service Account</label>
              <input type="password" value="************************" readOnly style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Bing Webmaster Tools API Key</label>
              <input type="password" value="************************" readOnly style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }} />
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
             <button className="btn btn-primary">Save Changes</button>
          </div>
        </div>

        <div className="stat-card">
          <h3>Crawler Settings</h3>
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
               <span>Auto-Push IndexNow</span>
               <input type="checkbox" checked readOnly />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
               <span>Daily Rank Check</span>
               <input type="checkbox" checked readOnly />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
               <span>Alert on Error</span>
               <input type="checkbox" checked readOnly />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
