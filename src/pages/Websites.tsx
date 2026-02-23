import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Zap, RefreshCw } from 'lucide-react';
import type { BaseWebsite } from '../types';
import { useNotification } from '../contexts/NotificationContext';

// --- Details Pane Component ---
const DetailsPane = ({ website, onClose, onEnrich }: { website: BaseWebsite, onClose: () => void, onEnrich: (w: BaseWebsite) => void }) => {
    const [isEnriching, setIsEnriching] = useState(false);

    const handleEnrichClick = async () => {
        setIsEnriching(true);
        await onEnrich(website);
        setIsEnriching(false);
    };

    return (
        <div style={styles.detailsBackdrop} onClick={onClose}>
            <div style={styles.detailsPane} onClick={e => e.stopPropagation()}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h3>{website.name}</h3>
                    <button onClick={onClose} style={styles.closeButton}>&times;</button>
                </div>
                <p><a href={website.url} target="_blank" rel="noopener noreferrer">{website.url}</a></p>
                
                <button className="btn btn-secondary" onClick={handleEnrichClick} disabled={isEnriching} style={{marginBottom: '1rem'}}>
                    {isEnriching ? <div className="spinner"></div> : <RefreshCw size={14} />}
                    Refresh Data
                </button>

                {website.screenshot_url ? (
                    <img src={website.screenshot_url} style={{width: '100%', borderRadius: '4px', border: '1px solid var(--border-color)'}} alt={`Screenshot of ${website.name}`} />
                ) : <div style={{textAlign: 'center', padding: '3rem 0', border: '1px dashed var(--border-color)', borderRadius: '4px'}}>No screenshot available. Click "Refresh Data".</div>}
                
                <h4 style={{marginTop: '1.5rem'}}>Meta Data</h4>
                <p><strong>Title:</strong> {website.meta_title || 'N/A'}</p>
                <p><strong>Description:</strong> {website.meta_description || 'N/A'}</p>
                
                {website.is_wordpress ? <p style={{display: 'flex', alignItems: 'center', gap: '8px'}}><strong>Platform:</strong> WordPress <a href={`${website.url}/wp-admin`} target="_blank" className='btn btn-outline' style={{padding: '0.25rem 0.5rem'}}>Admin</a></p> : null}
            </div>
        </div>
    );
};


// --- Main Websites Page Component ---
export const Websites: React.FC = () => {
    const [websites, setWebsites] = useState<BaseWebsite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState(new Set<string>());
    const [selectedWebsite, setSelectedWebsite] = useState<BaseWebsite | null>(null);
    const { addNotification } = useNotification();
    const [editingWebsite, setEditingWebsite] = useState<Partial<BaseWebsite> | null>(null); // For modal

    const API_URL_BASE = '/api/websites';

    const fetchWebsites = async () => {
        if (!isLoading) setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL_BASE);
            if (!response.ok) throw new Error('Failed to fetch websites.');
            setWebsites(await response.json());
        } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
    };

    useEffect(() => { fetchWebsites(); }, []);

    const handleEnrich = async (website: BaseWebsite) => {
        try {
            const response = await fetch(`${API_URL_BASE}/${website.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: website.id, url: website.url }),
            });
            if (!response.ok) throw new Error(await response.text());
            const updatedWebsite = await response.json();
            // Update the state locally for immediate feedback
            setWebsites(prev => prev.map(w => w.id === updatedWebsite.id ? updatedWebsite : w));
            if(selectedWebsite?.id === updatedWebsite.id) {
                setSelectedWebsite(updatedWebsite);
            }
            addNotification(`${website.name} has been updated.`, 'success');
        } catch (err: any) {
            addNotification(`Failed to enrich ${website.name}: ${err.message}`, 'error');
        }
    };
    
    const handleSaveWebsite = async (websiteData: Partial<BaseWebsite>) => { /* ... unchanged ... */ };
    const handleDeleteWebsite = async (websiteId: string) => { /* ... unchanged ... */ };
    const handleBatchIndexNowPush = async () => { /* ... unchanged ... */ };
    const handleSelect = (websiteId: string) => { /* ... unchanged ... */ };
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... unchanged ... */ };


    return (
        <div>
            {selectedWebsite && <DetailsPane website={selectedWebsite} onClose={() => setSelectedWebsite(null)} onEnrich={handleEnrich} />}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h1>Website Manager</h1>
                <button className="btn btn-primary" onClick={() => setEditingWebsite({})}><Plus size={16} /> Add Website</button>
            </div>

            {!isLoading && websites.length > 0 && (
                <div className="table-container">
                    <table className="data-table">
                        <thead><tr>
                            <th style={{width: '20px'}}><input type="checkbox" onChange={handleSelectAll} /></th>
                            <th>Website</th><th>Meta Title</th><th>Status</th><th>Actions</th>
                        </tr></thead>
                        <tbody>{websites.map(website => (
                            <tr key={website.id} onClick={() => setSelectedWebsite(website)} style={{cursor: 'pointer'}}>
                                <td onClick={e => e.stopPropagation()}><input type="checkbox" checked={selected.has(website.id)} onChange={() => handleSelect(website.id)} /></td>
                                <td>
                                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {website.name} 
                                        {website.is_wordpress && <span title="WordPress Site">🔵</span>}
                                    </div>
                                    <div style={{ fontSize: '0.75rem' }}><a href={website.url} target="_blank" rel="noopener noreferrer" style={{color: 'var(--text-secondary)'}} onClick={e => e.stopPropagation()}>{website.url}</a></div>
                                </td>
                                <td style={{maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{website.meta_title || '-'}</td>
                                <td><span className={`status-badge status-${website.status}`}>{website.status.toUpperCase()}</span></td>
                                <td onClick={e => e.stopPropagation()}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button title="Refresh Data" className="btn btn-outline" onClick={() => handleEnrich(website)} disabled={false}><RefreshCw size={14} /></button>
                                        <button title="Edit" className="btn btn-outline" onClick={() => setEditingWebsite(website)}><Edit size={14} /></button>
                                        <button title="Delete" className="btn btn-outline" style={{color: 'var(--error)'}} onClick={() => handleDeleteWebsite(website.id)}><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}
             {/* Other states: loading, error, empty */}
        </div>
    );
};

// Add spinner animation to index.css
const spinnerKeyframes = `@keyframes spinner { to { transform: rotate(360deg); } } .spinner { box-sizing: border-box; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #ccc; border-top-color: #333; animation: spinner .6s linear infinite; }`;
try {
  const styleSheet = document.styleSheets[0];
  styleSheet.insertRule(spinnerKeyframes, styleSheet.cssRules.length);
} catch (e) {
  console.error("Failed to insert spinner CSS rule.");
}


const styles: { [key: string]: React.CSSProperties } = {
    detailsBackdrop: { position: 'fixed', top: 0, right: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000 },
    detailsPane: { position: 'fixed', top: 0, right: 0, width: '40%', height: '100%', backgroundColor: 'var(--bg-secondary)', padding: '2rem', boxShadow: '-5px 0 15px rgba(0,0,0,0.2)', overflowY: 'auto' },
    closeButton: { position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' },
    // ... other styles
};

