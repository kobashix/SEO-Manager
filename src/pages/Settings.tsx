import React from 'react';

export const Settings: React.FC = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Configuration</h1>
      
      <div className="dashboard-grid">
        <div className="stat-card" style={{ gridColumn: 'span 2' }}>
          <h3>API Keys</h3>
          <p style={{color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem'}}>
            This is where API keys for services like Bing or other third-party tools would be configured.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <p>No API keys are currently required for this application's configuration.</p>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <button className="btn btn-primary" disabled>
                Save Changes
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
