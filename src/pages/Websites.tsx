import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, RefreshCw } from 'lucide-react';
import type { BaseWebsite } from '../types';
import { useNotification } from '../contexts/NotificationContext';

const DetailsPane = ({ website, onClose, onEnrich, isEnriching }: { website: BaseWebsite, onClose: () => void, onEnrich: (w: BaseWebsite) => void, isEnriching: boolean }) => { /* ... */ };
const WebsiteFormModal = ({ website, onClose, onSave }: { website: Partial<BaseWebsite> | null, onClose: () => void, onSave: (w: Partial<BaseWebsite>) => void }) => { /* ... */ };

export const Websites: React.FC = () => {
    const [websites, setWebsites] = useState<BaseWebsite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingWebsite, setEditingWebsite] = useState<Partial<BaseWebsite> | null>(null);
    const [enriching, setEnriching] = useState<Set<string>>(new Set());
    const [selectedWebsite, setSelectedWebsite] = useState<BaseWebsite | null>(null);
    const { addNotification } = useNotification();

    const API_URL_BASE = '/api/websites';

    const fetchWebsites = async () => { /* ... */ };
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
            addNotification(`${website.name} enriched.`, 'success');
        } catch (err: any) { addNotification(`Failed to enrich: ${err.message}`, 'error');
        } finally {
            setEnriching(prev => { const newSet = new Set(prev); newSet.delete(website.id); return newSet; });
        }
    };
    
    const handleSaveWebsite = async (websiteData: Partial<BaseWebsite>) => {
        const isUpdating = !!websiteData.id;
        try {
            const response = await fetch(API_URL_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isUpdating ? { ...websiteData, id: websiteData.id } : websiteData),
            });
            if (!response.ok) throw new Error(await response.text() || 'Failed to save.');
            await fetchWebsites(); setEditingWebsite(null);
            addNotification(`Website ${isUpdating ? 'updated' : 'added'}!`, 'success');
        } catch (err: any) { addNotification(err.message, 'error'); }
    };

    const handleDeleteWebsite = async (websiteId: string) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const response = await fetch(API_URL_BASE, { 
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: websiteId })
            });
            if (!response.ok) throw new Error('Failed to delete.');
            setWebsites(prev => prev.filter(w => w.id !== websiteId));
            addNotification('Website deleted.', 'success');
        } catch (err: any) { addNotification(err.message, 'error'); }
    };
    
    return (
        <div>
            {selectedWebsite && <DetailsPane website={selectedWebsite} onClose={() => setSelectedWebsite(null)} onEnrich={handleEnrich} isEnriching={enriching.has(selectedWebsite.id)} />}
            <WebsiteFormModal website={editingWebsite} onClose={() => setEditingWebsite(null)} onSave={handleSaveWebsite} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h1>Website Manager</h1>
                <button className="btn btn-primary" onClick={() => setEditingWebsite({})}><Plus size={16} /> Add Website</button>
            </div>
            {/* Table rendering... */}
        </div>
    );
};

// Full definitions for components and other functions that were previously partial
// ...
