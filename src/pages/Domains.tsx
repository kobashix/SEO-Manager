import React, { useState } from 'react';
import { mockDomains } from '../services/mockData';
import { RefreshCw, Zap, Search, CheckCircle, AlertTriangle, ExternalLink, Eye } from 'lucide-react';
import type { Domain } from '../types';

type PushStatus = 'idle' | 'pushing' | 'success' | 'error';
type CheckStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface FeedbackState {
  [domainId: string]: {
    push?: { status: PushStatus; message: string; };
    googleCheck?: { status: CheckStatus; indexedCount?: number; message?: string; };
  };
}

export const Domains: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState>({});
  const [currentDomains, setCurrentDomains] = useState<Domain[]>(mockDomains);

  const updateDomainFeedback = (domainId: string, type: 'push' | 'googleCheck', data: any) => {
    setFeedback(prev => ({
      ...prev,
      [domainId]: {
        ...prev[domainId],
        [type]: data,
      },
    }));
  };

  const handleIndexNowPush = async (domainId: string, url: string) => {
    updateDomainFeedback(domainId, 'push', { status: 'pushing', message: 'Submitting...' });

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

      updateDomainFeedback(domainId, 'push', { status: 'success', message: 'Submitted!' });

    } catch (error: any) {
      updateDomainFeedback(domainId, 'push', { status: 'error', message: error.message || 'An error occurred.' });
    } finally {
        setTimeout(() => {
            updateDomainFeedback(domainId, 'push', { status: 'idle', message: '' });
        }, 5000); // Reset feedback after 5 seconds
    }
  };

  const handleGoogleCheck = async (domainId: string, url: string) => {
    updateDomainFeedback(domainId, 'googleCheck', { status: 'loading', message: 'Checking...' });

    try {
      const response = await fetch(`/api/check-indexing?domain=${url}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `API failed with status ${response.status}`);
      }

      updateDomainFeedback(domainId, 'googleCheck', { status: 'loaded', indexedCount: result.indexedCount });

    } catch (error: any) {
      updateDomainFeedback(domainId, 'googleCheck', { status: 'error', message: error.message || 'Check failed.' });
    }
  };

  const handleBingYandexManualCheck = (url: string) => {
    window.open(`https://www.bing.com/search?q=site:${url}`, '_blank');
    window.open(`https://yandex.com/search/?text=site:${url}`, '_blank');
  };

  const handleRefreshAll = async () => {
    for (const domain of filteredDomains) {
      // Trigger Google check for all
      await handleGoogleCheck(domain.id, domain.url);
      // Optional: Add a small delay to avoid hitting rate limits too fast
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };


  const filteredDomains = currentDomains.filter(domain => 
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
          <button className="btn btn-primary" onClick={handleRefreshAll}>
            <RefreshCw size={16} /> Refresh All Google Status
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Domain</th>
              <th>Status</th>
              <th>
                <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                  Google 
                  <RefreshCw size={14} style={{cursor: 'pointer'}} onClick={handleRefreshAll} title="Refresh all Google status" />
                </div>
              </th>
              <th>Bing</th>
              <th>Yandex</th>
              <th>IndexNow</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDomains.map(domain => {
              const domainFeedback = feedback[domain.id];
              const googleCheckFeedback = domainFeedback?.googleCheck;
              const pushFeedback = domainFeedback?.push;

              return (
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
                    {googleCheckFeedback?.status === 'loading' && <span style={{color: 'var(--text-secondary)'}}>Loading...</span>}
                    {googleCheckFeedback?.status === 'error' && <span style={{color: 'var(--error)'}} title={googleCheckFeedback.message}>Error</span>}
                    {googleCheckFeedback?.status === 'loaded' && (
                      <span style={{color: googleCheckFeedback.indexedCount > 0 ? 'var(--success)' : 'var(--error)'}}>
                        {googleCheckFeedback.indexedCount} Indexed
                      </span>
                    )}
                    {googleCheckFeedback?.status === 'idle' && '-'}
                    {!googleCheckFeedback && '-'} {/* Default if no check has been run */}
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '0.25rem 0.5rem', marginLeft: '8px' }}
                      onClick={() => handleGoogleCheck(domain.id, domain.url)}
                      disabled={googleCheckFeedback?.status === 'loading'}
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <span>-</span>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.25rem 0.5rem' }}
                        onClick={() => window.open(`https://www.bing.com/search?q=site:${domain.url}`, '_blank')}
                      >
                        <ExternalLink size={14} /> Bing
                      </button>
                    </div>
                  </td>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <span>-</span>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.25rem 0.5rem' }}
                        onClick={() => window.open(`https://yandex.com/search/?text=site:${domain.url}`, '_blank')}
                      >
                        <ExternalLink size={14} /> Yandex
                      </button>
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
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {new Date(domain.indexNow.lastPush).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '0.25rem 0.5rem' }}
                      onClick={() => handleIndexNowPush(domain.id, domain.url)}
                      disabled={pushFeedback?.status === 'pushing'}
                    >
                      <Zap size={14} /> Push
                    </button>
                    {pushFeedback && pushFeedback.status !== 'idle' && (
                      <div style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {pushFeedback.status === 'success' && <CheckCircle size={12} color="var(--success)" />}
                        {pushFeedback.status === 'error' && <AlertTriangle size={12} color="var(--error)" />}
                        {pushFeedback.message}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
