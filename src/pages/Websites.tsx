import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Eye, Zap } from 'lucide-react';
import type { BaseWebsite } from '../types';

// --- Reusable Modal Component ---
const WebsiteFormModal = ({ website, onClose, onSave }: { website: Partial<BaseWebsite> | null, onClose: () => void, onSave: (w: Partial<BaseWebsite>) => void }) => {
    const [formData, setFormData] = useState<Partial<BaseWebsite>>({});

    useEffect(() => {
        setFormData(website || {});
    }, [website]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.url) {
            alert("URL is a required field.");
            return;
        }
        onSave(formData);
    };
    
    if (!website) return null;

    return (
        <div style={styles.modalBackdrop}>
            <div style={styles.modalContent}>
                <h2>{website.id ? 'Edit' : 'Add'} Base Website</h2>
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label htmlFor="name">Name</label>
                        <input id="name" name="name" value={formData.name || ''} onChange={handleChange} style={styles.input} placeholder="e.g., My Awesome Blog" />
                    </div>
                    <div style={styles.formGroup}>
                        <label htmlFor="url">URL</label>
                        <input id="url" name="url" value={formData.url || ''} onChange={handleChange} style={styles.input} placeholder="https://example.com" required />
                    </div>
                    <div style={styles.modalActions}>
                        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
                        <button type="submit" className="btn btn-primary">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Main Websites Page Component ---
export const Websites: React.FC = () => {
    const [websites, setWebsites] = useState<BaseWebsite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingWebsite, setEditingWebsite] = useState<Partial<BaseWebsite> | null>(null);
    const [actionStatus, setActionStatus] = useState<{ [websiteId: string]: { type?: 'check' | 'push'; status: 'loading' | 'error' | 'success'; message?: string; } }>({});

    const API_URL_BASE = '/api/websites';

    useEffect(() => {
        fetchWebsites();
    }, []);

    const setActionFeedback = (websiteId: string, type: 'check' | 'push', status: 'loading' | 'error' | 'success', message?: string) => {
        setActionStatus(prev => ({ ...prev, [websiteId]: { type, status, message } }));
        if (status === 'success' || status === 'error') {
            setTimeout(() => {
                setActionStatus(prev => {
                    const newState = { ...prev };
                    delete newState[websiteId];
                    return newState;
                });
            }, 5000);
        }
    };

    const fetchWebsites = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL_BASE);
            if (!response.ok) throw new Error('Failed to fetch your websites. Please try again.');
            const data: BaseWebsite[] = await response.json();
            setWebsites(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveWebsite = async (websiteData: Partial<BaseWebsite>) => {
        const isUpdating = !!websiteData.id;
        const url = isUpdating ? `${API_URL_BASE}/${websiteData.id}` : API_URL_BASE;
        const method = isUpdating ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(websiteData),
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || 'Failed to save website.');
            }
            await fetchWebsites();
            setEditingWebsite(null);
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleDeleteWebsite = async (websiteId: string) => {
        if (!window.confirm("Are you sure you want to delete this website? This action cannot be undone.")) return;
        try {
            const response = await fetch(`${API_URL_BASE}/${websiteId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete website.');
            setWebsites(prev => prev.filter(w => w.id !== websiteId));
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };
    
    const handleGoogleCheck = async (website: BaseWebsite) => {
        setActionFeedback(website.id, 'check', 'loading');
        try {
            const response = await fetch(`/api/check-indexing?domain=${website.url}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Check failed');
            }
            const result = await response.json();
            setActionFeedback(website.id, 'check', 'success', `${result.indexedCount} indexed`);
        } catch (err: any) {
            setActionFeedback(website.id, 'check', 'error', err.message);
        }
    };

    const handleIndexNowPush = async (website: BaseWebsite) => {
        setActionFeedback(website.id, 'push', 'loading');
        try {
            const response = await fetch('/index-now', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: website.url }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Push failed');
            }
            const result = await response.json();
            setActionFeedback(website.id, 'push', 'success', result.message || 'Submitted!');
        } catch (err: any) {
            setActionFeedback(website.id, 'push', 'error', err.message);
        }
    };

    const renderActionStatus = (websiteId: string) => {
        const status = actionStatus[websiteId];
        if (!status) return null;
        const color = status.status === 'error' ? 'var(--error)' : 'var(--success)';
        return <div style={{ fontSize: '0.7rem', color, marginTop: '4px' }}>{status.status === 'loading' ? 'Loading...' : status.message}</div>;
    };

    return (
        <div>
            <WebsiteFormModal website={editingWebsite} onClose={() => setEditingWebsite(null)} onSave={handleSaveWebsite} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Base Websites</h1>
                <button className="btn btn-primary" onClick={() => setEditingWebsite({})}>
                    <Plus size={16} /> Add Website
                </button>
            </div>

            {isLoading && <p>Loading websites...</p>}
            {error && <p style={{color: 'var(--error)'}}>Error: {error}</p>}
            
            {!isLoading && !error && websites.length === 0 && (
                <div className="stat-card">
                    <h3>Welcome to Teqh SEO Nexus!</h3>
                    <p>You haven't added any websites yet. Click the "Add Website" button to get started.</p>
                </div>
            )}

            {!isLoading && !error && websites.length > 0 && (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Website</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th style={{width: '250px'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {websites.map(website => (
                                <tr key={website.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{website.name}</div>
                                        <div style={{ fontSize: '0.75rem' }}><a href={website.url} target="_blank" rel="noopener noreferrer" style={{color: 'var(--text-secondary)'}}>{website.url}</a></div>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${website.status}`}>{website.status.toUpperCase()}</span>
                                    </td>
                                    <td>{new Date(website.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <button title="Edit" className="btn btn-outline" onClick={() => setEditingWebsite(website)}><Edit size={14} /></button>
                                            <button title="Delete" className="btn btn-outline" style={{color: 'var(--error)'}} onClick={() => handleDeleteWebsite(website.id)}><Trash2 size={14} /></button>
                                            <button title="Check Google Index" className="btn btn-outline" onClick={() => handleGoogleCheck(website)} disabled={actionStatus[website.id]?.status === 'loading'}><Eye size={14} /></button>
                                            <button title="Push to IndexNow" className="btn btn-outline" onClick={() => handleIndexNowPush(website)} disabled={actionStatus[website.id]?.status === 'loading'}><Zap size={14} /></button>
                                        </div>
                                        {renderActionStatus(website.id)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    modalBackdrop: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '500px' },
    formGroup: { marginBottom: '1rem' },
    input: { width: '100%', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' },
    modalActions: { marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }
};
