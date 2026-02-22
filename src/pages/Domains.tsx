import React, { useState } from 'react';
import { mockDomains } from '../services/mockData';
import { RefreshCw, Zap, Search, CheckCircle, AlertTriangle } from 'lucide-react';

type PushStatus = 'idle' | 'pushing' | 'success' | 'error';

interface FeedbackState {
  [domainId: string]: {
    status: PushStatus;
    message: string;
  };
}

export const Domains: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState>({});

  const handleIndexNowPush = async (domainId: string, url: string) => {
    setFeedback(prev => ({
      ...prev,
      [domainId]: { status: 'pushing', message: 'Submitting...' }
    }));

    try {
      const response = await fetch('/index-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Request failed with status ${response.status}`);
      }

      setFeedback(prev => ({
        ...prev,
        [domainId]: { status: 'success', message: 'Successfully Submitted!' }
      }));

    } catch (error: any) {
      setFeedback(prev => ({
        ...prev,
        [domainId]: { status: 'error', message: error.message || 'An error occurred.' }
      }));
    } finally {
        setTimeout(() => {
            setFeedback(prev => ({ ...prev, [domainId]: { status: 'idle', message: '' } }));
        }, 5000); // Reset feedback after 5 seconds
    }
  };

  const filteredDomains = mockDomains.filter(domain => 
    domain.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    domain.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Domain Portfolio</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search domains..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                padding: '0.5rem 1rem 0.5rem 2.5rem', 
                borderRadius: '0.5rem', 
                border: '1px solid var(--border-color)', 
                backgroundColor: 'var(--bg-card)', 
                color: 'var(--text-primary)' 
              }} 
            />
          </div>
          <button className="btn btn-primary">
            <RefreshCw size={16} /> Force Re-index All
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Domain</th>
              <th>Status</th>
              <th>Google</th>
              <th>Bing</th>
              <th>Yandex</th>
              <th>IndexNow</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDomains.map(domain => (
              <tr key={domain.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{domain.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{domain.url}</div>
                </td>
                <td>
                  <span className={`status-badge status-${domain.status}`}>
                    {domain.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ color: domain.engines.google.indexed ? 'var(--success)' : 'var(--error)' }}>
                      {domain.engines.google.indexed ? 'Indexed' : 'Not Indexed'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      Rank: {domain.engines.google.rank || '-'}
                    </span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ color: domain.engines.bing.indexed ? 'var(--success)' : 'var(--error)' }}>
                      {domain.engines.bing.indexed ? 'Indexed' : 'Not Indexed'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      Rank: {domain.engines.bing.rank || '-'}
                    </span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ color: domain.engines.yandex.indexed ? 'var(--success)' : 'var(--error)' }}>
                      {domain.engines.yandex.indexed ? 'Indexed' : 'Not Indexed'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      Rank: {domain.engines.yandex.rank || '-'}
                    </span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      backgroundColor: domain.indexNow.status === 'success' ? 'var(--success)' : 'var(--warning)'
                    }}></span>
                    {domain.indexNow.status === 'success' ? 'Synced' : 'Pending'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    {new Date(domain.indexNow.lastPush).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <button 
                    className="btn btn-outline" 
                    style={{ padding: '0.25rem 0.5rem' }}
                    onClick={() => handleIndexNowPush(domain.id, domain.url)}
                    disabled={feedback[domain.id]?.status === 'pushing'}
                  >
                    <Zap size={14} /> Push
                  </button>
                  {feedback[domain.id] && feedback[domain.id].status !== 'idle' && (
                    <div style={{ fontSize: '0.7rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {feedback[domain.id].status === 'success' && <CheckCircle size={12} color="var(--success)" />}
                      {feedback[domain.id].status === 'error' && <AlertTriangle size={12} color="var(--error)" />}
                      {feedback[domain.id].message}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
