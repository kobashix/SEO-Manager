import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Eye, Zap, Twitter, Facebook, Linkedin, Instagram, Youtube, ExternalLink } from 'lucide-react';
import type { BaseWebsite } from '../types';
import { useNotification } from '../contexts/NotificationContext';

// --- Social & External Links Components ---
const SocialLinks = ({ website }: { website: BaseWebsite }) => {
    const socials = [
        { key: 'twitter_url', Icon: Twitter, color: '#1DA1F2', name: 'Twitter' },
        { key: 'facebook_url', Icon: Facebook, color: '#1877F2', name: 'Facebook' },
        { key: 'linkedin_url', Icon: Linkedin, color: '#0A66C2', name: 'LinkedIn' },
        { key: 'instagram_url', Icon: Instagram, color: '#E4405F', name: 'Instagram' },
        { key: 'youtube_url', Icon: Youtube, color: '#FF0000', name: 'YouTube' },
    ];
    const links = socials.map(s => ({ ...s, url: website[s.key as keyof BaseWebsite] })).filter(s => s.url);
    if (links.length === 0) return <span>-</span>;
    return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {links.map(({ Icon, color, url, name }) => (
                <a href={url as string} key={name} target="_blank" rel="noopener noreferrer" title={name}><Icon size={16} color={color} /></a>
            ))}
        </div>
    );
};

const ExternalToolLinks = ({ website }: { website: BaseWebsite }) => {
    const tools = [
        { key: 'gsc_url', name: 'Google Search Console' },
        { key: 'bing_url', name: 'Bing Webmaster Tools' },
        { key: 'yandex_url', name: 'Yandex Webmaster Tools' },
    ];
    const links = tools.map(t => ({ ...t, url: website[t.key as keyof BaseWebsite] })).filter(t => t.url);
    if (links.length === 0) return <span>-</span>;
    return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {links.map(({ url, name }) => (
                <a href={url as string} key={name} target="_blank" rel="noopener noreferrer" title={name} className="btn btn-outline" style={{padding: '0.25rem 0.5rem'}}><ExternalLink size={14} /></a>
            ))}
        </div>
    );
}

// --- Reusable Modal Component ---
const WebsiteFormModal = ({ website, onClose, onSave }: { website: Partial<BaseWebsite> | null, onClose: () => void, onSave: (w: Partial<BaseWebsite>) => void }) => {
    const [formData, setFormData] = useState<Partial<BaseWebsite>>({});
    useEffect(() => { setFormData(website || {}); }, [website]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.url) { alert("URL is a required field."); return; }
        onSave(formData);
    };
    if (!website) return null;
    return (
        <div style={styles.modalBackdrop}>
            <div style={styles.modalContent}>
                <h2>{website.id ? 'Edit' : 'Add'} Base Website</h2>
                <form onSubmit={handleSubmit} style={{maxHeight: '70vh', overflowY: 'auto', paddingRight: '1rem'}}>
                    {/* Main Details */}
                    <div style={styles.formGroup}>
                        <label htmlFor="name">Name</label>
                        <input id="name" name="name" value={formData.name || ''} onChange={handleChange} style={styles.input} placeholder="e.g., My Awesome Blog" />
                    </div>
                    <div style={styles.formGroup}>
                        <label htmlFor="url">URL</label>
                        <input id="url" name="url" value={formData.url || ''} onChange={handleChange} style={styles.input} placeholder="https://example.com" required />
                    </div>
                    {/* Webmaster Links */}
                    <hr style={styles.hr} />
                    <h3 style={styles.h3}>Webmaster Links (Optional)</h3>
                    <div style={styles.formGroup}><label>Google Search Console URL</label><input name="gsc_url" value={formData.gsc_url || ''} onChange={handleChange} style={styles.input} /></div>
                    <div style={styles.formGroup}><label>Bing Webmaster Tools URL</label><input name="bing_url" value={formData.bing_url || ''} onChange={handleChange} style={styles.input} /></div>
                    <div style={styles.formGroup}><label>Yandex Webmaster Tools URL</label><input name="yandex_url" value={formData.yandex_url || ''} onChange={handleChange} style={styles.input} /></div>
                    {/* Social Links */}
                    <hr style={styles.hr} />
                    <h3 style={styles.h3}>Social Media Links (Optional)</h3>
                    <div style={styles.formGroup}><label>Twitter URL</label><input name="twitter_url" value={formData.twitter_url || ''} onChange={handleChange} style={styles.input} /></div>
                    <div style={styles.formGroup}><label>Facebook URL</label><input name="facebook_url" value={formData.facebook_url || ''} onChange={handleChange} style={styles.input} /></div>
                    <div style={styles.formGroup}><label>LinkedIn URL</label><input name="linkedin_url" value={formData.linkedin_url || ''} onChange={handleChange} style={styles.input} /></div>
                    <div style={styles.formGroup}><label>Instagram URL</label><input name="instagram_url" value={formData.instagram_url || ''} onChange={handleChange} style={styles.input} /></div>
                    <div style={styles.formGroup}><label>YouTube URL</label><input name="youtube_url" value={formData.youtube_url || ''} onChange={handleChange} style={styles.input} /></div>

                    <div style={styles.modalActions}><button type="button" onClick={onClose} className="btn btn-outline">Cancel</button><button type="submit" className="btn btn-primary">Save</button></div>
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
    const [actionStatus, setActionStatus] = useState<{ [websiteId: string]: { status: 'loading' | 'success'; message?: string; } }>({});
    const [selected, setSelected] = useState(new Set<string>());
    const { addNotification } = useNotification();

    const API_URL_BASE = '/api/websites';

    useEffect(() => { fetchWebsites(); }, []);

    const setActionMessage = (websiteId: string, status: 'loading' | 'success', message?: string) => {
        setActionStatus(prev => ({ ...prev, [websiteId]: { status, message } }));
        if (status === 'success') { setTimeout(() => { setActionStatus(prev => { const newState = { ...prev }; delete newState[websiteId]; return newState; }); }, 5000); }
    };

    const fetchWebsites = async () => {
        setIsLoading(true); setError(null);
        try {
            const response = await fetch(API_URL_BASE);
            if (!response.ok) throw new Error('Failed to fetch your websites.');
            setWebsites(await response.json());
        } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
    };
    
    const handleSaveWebsite = async (websiteData: Partial<BaseWebsite>) => {
        const isUpdating = !!websiteData.id;
        try {
            const response = await fetch(isUpdating ? `${API_URL_BASE}/${websiteData.id}` : API_URL_BASE, {
                method: isUpdating ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(websiteData),
            });
            if (!response.ok) throw new Error(await response.text() || 'Failed to save website.');
            await fetchWebsites(); setEditingWebsite(null);
            addNotification(`Website ${isUpdating ? 'updated' : 'added'}!`, 'success');
        } catch (err: any) { addNotification(err.message, 'error'); }
    };

    const handleDeleteWebsite = async (websiteId: string) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const response = await fetch(`${API_URL_BASE}/${websiteId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete website.');
            setWebsites(prev => prev.filter(w => w.id !== websiteId));
            addNotification('Website deleted.', 'success');
        } catch (err: any) { addNotification(err.message, 'error'); }
    };
    
    const handleGoogleCheck = async (website: BaseWebsite) => {
        setActionMessage(website.id, 'loading');
        try {
            const response = await fetch(`/api/scrape-google?domain=${website.url}`);
            const result = await response.json();
            if (!response.ok) throw result;
            setActionMessage(website.id, 'success', `${result.indexedCount} indexed`);
        } catch (err: any) {
            addNotification(err.message, 'error', err.fixUrl ? { href: err.fixUrl, text: 'Enable API' } : undefined);
            setActionStatus(prev => { const newState = {...prev}; delete newState[website.id]; return newState; });
        }
    };
    
    const handleBatchIndexNowPush = async () => {
        const selectedUrls = websites.filter(w => selected.has(w.id)).map(w => w.url);
        if (selectedUrls.length === 0) { addNotification("Please select at least one website.", 'error'); return; }
        try {
            const response = await fetch('/index-now', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ urlList: selectedUrls }),
            });
            if (!response.ok) throw new Error(await response.text() || 'Batch push failed');
            addNotification((await response.json()).message || 'Batch submission successful!', 'success');
            setSelected(new Set());
        } catch (err: any) { addNotification(err.message, 'error', { href: '/settings', text: 'Check Settings' }); }
    };

    const handleSelect = (websiteId: string) => {
        const newSelection = new Set(selected);
        if (newSelection.has(websiteId)) { newSelection.delete(websiteId); } else { newSelection.add(websiteId); }
        setSelected(newSelection);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) { setSelected(new Set(websites.map(w => w.id))); } else { setSelected(new Set()); }
    };
    
    const renderActionStatus = (websiteId: string) => {
        const status = actionStatus[websiteId];
        if (!status) return null;
        return <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{status.status === 'loading' ? 'Checking...' : status.message}</div>;
    };

    return (
        <div>
            <WebsiteFormModal website={editingWebsite} onClose={() => setEditingWebsite(null)} onSave={handleSaveWebsite} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h1>Base Websites</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={handleBatchIndexNowPush} disabled={selected.size === 0}><Zap size={16} /> Push {selected.size > 0 ? `${selected.size} to` : ''} IndexNow</button>
                    <button className="btn btn-primary" onClick={() => setEditingWebsite({})}><Plus size={16} /> Add Website</button>
                </div>
            </div>

            {isLoading && <p>Loading websites...</p>}
            {error && <p style={{color: 'var(--error)'}}>{error}</p>}
            {!isLoading && !error && websites.length === 0 && <div className="stat-card"><h3>Welcome!</h3><p>Click "Add Website" to get started.</p></div>}
            {!isLoading && !error && websites.length > 0 && (
                <div className="table-container">
                    <table className="data-table">
                        <thead><tr>
                            <th style={{width: '20px'}}><input type="checkbox" onChange={handleSelectAll} checked={selected.size > 0 && selected.size === websites.length} /></th>
                            <th>Website</th><th>Links</th><th>Status</th><th>Created</th><th>Google</th><th style={{width: '100px'}}>Actions</th>
                        </tr></thead>
                        <tbody>{websites.map(website => (
                            <tr key={website.id}>
                                <td><input type="checkbox" checked={selected.has(website.id)} onChange={() => handleSelect(website.id)} /></td>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{website.name}</div>
                                    <div style={{ fontSize: '0.75rem' }}><a href={website.url} target="_blank" rel="noopener noreferrer" style={{color: 'var(--text-secondary)'}}>{website.url}</a></div>
                                </td>
                                <td>
                                    <div style={{display: 'flex', gap: '8px'}}><SocialLinks website={website} /><ExternalToolLinks website={website} /></div>
                                </td>
                                <td><span className={`status-badge status-${website.status}`}>{website.status.toUpperCase()}</span></td>
                                <td>{new Date(website.created_at).toLocaleDateString()}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <button title="Check Google Index" className="btn btn-outline" onClick={() => handleGoogleCheck(website)} disabled={actionStatus[website.id]?.status === 'loading'}><Eye size={14} /></button>
                                        {renderActionStatus(website.id)}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <button title="Edit" className="btn btn-outline" onClick={() => setEditingWebsite(website)}><Edit size={14} /></button>
                                        <button title="Delete" className="btn btn-outline" style={{color: 'var(--error)'}} onClick={() => handleDeleteWebsite(website.id)}><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}</tbody>
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
    modalActions: { marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' },
    hr: { borderColor: 'var(--border-color)', margin: '1.5rem 0' },
    h3: { fontSize: '1rem', marginBottom: '1rem' },
};
