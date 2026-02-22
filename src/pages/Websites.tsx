import React, { useState, useEffect } from 'react';
import { RefreshCw, Zap, Search, CheckCircle, AlertTriangle, ExternalLink, Eye, Plus, Trash2, Edit } from 'lucide-react';
import type { BaseWebsite } from '../types';

// TODO: Create a separate modal component
const WebsiteFormModal = ({ website, onClose, onSave, api_url_base }: { website: Partial<BaseWebsite> | null, onClose: () => void, onSave: (w: Partial<BaseWebsite>) => void, api_url_base: string }) => {
    const [formData, setFormData] = useState(website || {});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    
    if (!website) return null;

    return (
        <div style={styles.modalBackdrop}>
            <div style={styles.modalContent}>
                <h2>{website.id ? 'Edit' : 'Add'} Website</h2>
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label htmlFor="name">Name</label>
                        <input id="name" name="name" value={formData.name || ''} onChange={handleChange} style={styles.input} placeholder="e.g., My Blog" />
                    </div>
                    <div style={styles.formGroup}>
                        <label htmlFor="url">URL</label>
                        <input id="url" name="url" value={formData.url || ''} onChange={handleChange} style={styles.input} placeholder="https://example.com" required />
                    </div>
                    <div style={styles.modalActions}>
                        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Website</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const Websites: React.FC = () => {
    const [websites, setWebsites] = useState<BaseWebsite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingWebsite, setEditingWebsite] = useState<Partial<BaseWebsite> | null>(null);
    const [feedback, setFeedback] = useState<any>({}); // Simplified for brevity

    const API_URL_BASE = '/api/websites';

    useEffect(() => {
        fetchWebsites();
    }, []);

    const fetchWebsites = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL_BASE);
            if (!response.ok) throw new Error('Failed to fetch websites.');
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
                const err = await response.text();
                throw new Error(err || 'Failed to save website.');
            }
            await fetchWebsites(); // Refetch all data
            setEditingWebsite(null); // Close modal
        } catch (err: any) {
            alert(err.message); // Simple error feedback
        }
    };

    const handleDeleteWebsite = async (websiteId: string) => {
        if (!window.confirm("Are you sure you want to delete this website?")) return;

        try {
            const response = await fetch(`${API_URL_BASE}/${websiteId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete website.');
            await fetchWebsites(); // Refetch
        } catch (err: any) {
            alert(err.message);
        }
    };
    
    // Placeholder for not-yet-reimplemented functions
    const handleGoogleCheck = (id: string, url: string) => alert(`Checking Google for ${url}`);
    const handleIndexNowPush = (id: string, url: string) => alert(`Pushing ${url} to IndexNow`);


  return (
    <div>
        <WebsiteFormModal website={editingWebsite} onClose={() => setEditingWebsite(null)} onSave={handleSaveWebsite} api_url_base={API_URL_BASE} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1>Base Websites</h1>
            <button className="btn btn-primary" onClick={() => setEditingWebsite({})}>
                <Plus size={16} /> Add Website
            </button>
        </div>

        {isLoading && <p>Loading websites...</p>}
        {error && <p style={{color: 'var(--error)'}}>Error: {error}</p>}
        
        {!isLoading && !error && (
            <div className="table-container">
                <table className="data-table">
                <thead>
                    <tr>
                    <th>Website</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {websites.map(website => (
                    <tr key={website.id}>
                        <td>
                        <div style={{ fontWeight: 600 }}>{website.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{website.url}</div>
                        </td>
                        <td>
                        <span className={`status-badge status-${website.status}`}>
                            {website.status.toUpperCase()}
                        </span>
                        </td>
                        <td>{new Date(website.created_at).toLocaleDateString()}</td>
                        <td style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button title="Edit" className="btn btn-outline" onClick={() => setEditingWebsite(website)}><Edit size={14} /></button>
                            <button title="Delete" className="btn btn-outline" style={{color: 'var(--error)'}} onClick={() => handleDeleteWebsite(website.id)}><Trash2 size={14} /></button>
                            <button title="Check Google Index" className="btn btn-outline" onClick={() => handleGoogleCheck(website.id, website.url)}><Eye size={14} /></button>
                            <button title="Push to IndexNow" className="btn btn-outline" onClick={() => handleIndexNowPush(website.id, website.url)}><Zap size={14} /></button>
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

// Basic inline styles for modal
const styles: { [key: string]: React.CSSProperties } = {
    modalBackdrop: {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex',
        justifyContent: 'center', alignItems: 'center', zIndex: 1000,
    },
    modalContent: {
        backgroundColor: 'var(--bg-secondary)', padding: '2rem',
        borderRadius: '8px', width: '90%', maxWidth: '500px',
    },
    formGroup: {
        marginBottom: '1rem',
    },
    input: {
        width: '100%', padding: '0.75rem', borderRadius: '0.25rem',
        border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
    },
    modalActions: {
        marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem',
    }
};
