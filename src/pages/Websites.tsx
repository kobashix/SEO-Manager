import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, RefreshCw } from 'lucide-react';
import type { BaseWebsite } from '../types';
import { useNotification } from '../contexts/NotificationContext';

// --- Details Pane ---
const DetailsPane = ({ website, onClose, onEnrich, isEnriching }: { website: BaseWebsite, onClose: () => void, onEnrich: (w: BaseWebsite) => void, isEnriching: boolean }) => {
    return (
        <div style={styles.detailsBackdrop} onClick={onClose}>
            <div style={styles.detailsPane} onClick={e => e.stopPropagation()}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h3>{website.name}</h3>
                    <button onClick={onClose} style={styles.closeButton}>&times;</button>
                </div>
                <p><a href={website.url} target="_blank" rel="noopener noreferrer">{website.url}</a></p>
                
                <button className="btn btn-secondary" onClick={() => onEnrich(website)} disabled={isEnriching} style={{marginBottom: '1rem'}}>
                    {isEnriching ? <div className="spinner"></div> : <RefreshCw size={14} />}
                    Refresh Data
                </button>

                {website.screenshot_url ? (
                    <img src={website.screenshot_url} style={{width: '100%', borderRadius: '4px', border: '1px solid var(--border-color)'}} alt={`Screenshot of ${website.name}`} />
                ) : <div style={{textAlign: 'center', padding: '3rem 0', border: '1px dashed var(--border-color)', borderRadius: '4px'}}>No screenshot. Click "Refresh Data".</div>}
                
                <h4 style={{marginTop: '1.5rem'}}>Meta Data</h4>
                <p><strong>Title:</strong> {website.meta_title || 'N/A'}</p>
                <p><strong>Description:</strong> {website.meta_description || 'N/A'}</p>
                
                {website.is_wordpress ? <p style={{display: 'flex', alignItems: 'center', gap: '8px'}}><strong>Platform:</strong> WordPress <a href={`${new URL(website.url).origin}/wp-admin`} target="_blank" className='btn btn-outline' style={{padding: '0.25rem 0.5rem'}}>Admin</a></p> : null}
            </div>
        </div>
    );
};

// --- Main Component ---
export const Websites: React.FC = () => {
    const [websites, setWebsites] = useState<BaseWebsite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingWebsite, setEditingWebsite] = useState<Partial<BaseWebsite> | null>(null);
    const [enriching, setEnriching] = useState<Set<string>>(new Set());
    const [selectedWebsite, setSelectedWebsite] = useState<BaseWebsite | null>(null);
    const { addNotification } = useNotification();

    const API_URL_BASE = '/api/websites';

    const fetchWebsites = async () => { /* ... unchanged ... */ };
    useEffect(() => { fetchWebsites(); }, []);
    
    const handleEnrich = async (website: BaseWebsite) => {
        setEnriching(prev => new Set(prev).add(website.id));
        try {
            const response = await fetch(`/api/enrich-website`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: website.id, url: website.url }),
            });
            if (!response.ok) throw new Error(await response.text());
            const updatedWebsite = await response.json();
            setWebsites(prev => prev.map(w => w.id === updatedWebsite.id ? updatedWebsite : w));
            if(selectedWebsite?.id === updatedWebsite.id) setSelectedWebsite(updatedWebsite);
            addNotification(`${website.name} updated.`, 'success');
        } catch (err: any) { addNotification(`Failed to enrich: ${err.message}`, 'error');
        } finally {
            setEnriching(prev => { const newSet = new Set(prev); newSet.delete(website.id); return newSet; });
        }
    };
    
    const handleSaveWebsite = async (websiteData: Partial<BaseWebsite>) => { /* ... unchanged ... */ };
    const handleDeleteWebsite = async (websiteId: string) => { /* ... unchanged ... */ };

    return (
        <div>
            {selectedWebsite && <DetailsPane website={selectedWebsite} onClose={() => setSelectedWebsite(null)} onEnrich={handleEnrich} isEnriching={enriching.has(selectedWebsite.id)} />}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h1>Website Manager</h1>
                <button className="btn btn-primary" onClick={() => setEditingWebsite({})}><Plus size={16} /> Add Website</button>
            </div>
            
            {/* ... Other rendering logic ... */}
        </div>
    );
};

// Styles and other components...
const styles: { [key: string]: React.CSSProperties } = {
    detailsBackdrop: { position: 'fixed', top: 0, right: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000 },
    detailsPane: { position: 'fixed', top: 0, right: 0, width: '40%', height: '100%', backgroundColor: 'var(--bg-secondary)', padding: '2rem', boxShadow: '-5px 0 15px rgba(0,0,0,0.2)', overflowY: 'auto' },
    closeButton: { position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' },
};
