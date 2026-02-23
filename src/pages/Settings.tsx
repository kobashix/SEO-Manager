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
            {/* Future settings for other APIs like Bing/Yandex can go here */}
            <p>No API keys are currently required for this configuration.</p>
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
