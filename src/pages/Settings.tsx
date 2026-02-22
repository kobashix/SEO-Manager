import React, { useState, useEffect } from 'react';
import type { AppSettings } from '../types';

type Status = 'idle' | 'loading' | 'success' | 'error';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({ googleApiKey: '', googleCxId: '' });
  const [status, setStatus] = useState<Status>('loading');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      setStatus('loading');
      try {
        const response = await fetch('/api/settings');
        if (!response.ok) throw new Error('Failed to load settings.');
        const data: AppSettings = await response.json();
        setSettings(data);
        setStatus('idle');
      } catch (error) {
        setStatus('error');
        setFeedbackMessage('Could not load settings.');
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setStatus('loading');
    setFeedbackMessage('');
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) {
        throw new Error('Failed to save. Please check your inputs.');
      }
      setStatus('success');
      setFeedbackMessage('Settings saved successfully!');
    } catch (error: any) {
      setStatus('error');
      setFeedbackMessage(error.message || 'An unknown error occurred.');
    } finally {
        setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev: AppSettings) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Configuration</h1>
      
      <div className="dashboard-grid">
        <div className="stat-card" style={{ gridColumn: 'span 2' }}>
          <h3>API Keys</h3>
          <p style={{color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem'}}>
            These keys are required for live data fetching and are stored securely in the backend.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label htmlFor="googleApiKey" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Google Custom Search API Key
              </label>
              <input
                id="googleApiKey"
                name="googleApiKey"
                type="password"
                placeholder="Enter Google API Key..."
                value={settings.googleApiKey || ''}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                Required to check indexing status on Google. 
                <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', marginLeft: '4px' }}>
                  Get your API Key here.
                </a>
              </p>
            </div>
            <div>
              <label htmlFor="googleCxId" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Google Programmable Search Engine ID (CX)
              </label>
              <input
                id="googleCxId"
                name="googleCxId"
                type="text"
                placeholder="Enter Search Engine ID..."
                value={settings.googleCxId || ''}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                This tells Google which search engine to use. 
                <a href="https://programmablesearchengine.google.com/controlpanel/all" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', marginLeft: '4px' }}>
                  Create a Search Engine here.
                </a>
                <span style={{ display: 'block', marginTop: '4px' }}>Important: In the setup, ensure "Search the entire web" is enabled.</span>
              </p>
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <button className="btn btn-primary" onClick={handleSave} disabled={status === 'loading'}>
                {status === 'loading' ? 'Saving...' : 'Save Changes'}
             </button>
             {status === 'success' && <span style={{ color: 'var(--success)' }}>{feedbackMessage}</span>}
             {status === 'error' && <span style={{ color: 'var(--error)' }}>{feedbackMessage}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
