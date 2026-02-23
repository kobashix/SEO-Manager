// src/pages/Websites.tsx (relevant changes only)

// In handleSaveWebsite
const handleSaveWebsite = async (websiteData: Partial<BaseWebsite>) => {
    const isUpdating = !!websiteData.id;
    // ALWAYS POST to the main endpoint. The backend will figure out if it's a create or update.
    const url = API_URL_BASE; 
    const method = 'POST';
    const body = isUpdating ? { ...websiteData, id: websiteData.id } : websiteData;

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(errText || 'Failed to save website.');
        }
        await fetchWebsites();
        setEditingWebsite(null);
        addNotification(`Website ${isUpdating ? 'updated' : 'added'} successfully!`, 'success');
    } catch (err: any) {
        addNotification(err.message, 'error');
    }
};

// In handleDeleteWebsite
const handleDeleteWebsite = async (websiteId: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
        const response = await fetch(API_URL_BASE, { 
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: websiteId })
        });
        if (!response.ok) throw new Error('Failed to delete website.');
        setWebsites(prev => prev.filter(w => w.id !== websiteId));
        addNotification('Website deleted.', 'success');
    } catch (err: any) {
        addNotification(err.message, 'error');
    }
};

// In handleEnrich
const handleEnrich = async (website: BaseWebsite) => {
    // This now calls the dedicated enrich endpoint
    setEnriching(prev => new Set(prev).add(website.id));
    try {
        const response = await fetch(`/api/enrich-website`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: website.id, url: website.url }),
        });
        if (!response.ok) throw new Error(await response.text());
        const updatedWebsite = await response.json();
        // Update state
        setWebsites(prev => prev.map(w => w.id === updatedWebsite.id ? updatedWebsite : w));
        if(selectedWebsite?.id === updatedWebsite.id) setSelectedWebsite(updatedWebsite);
        addNotification(`${website.name} enriched.`, 'success');
    } catch (err: any) {
        addNotification(`Failed to enrich: ${err.message}`, 'error');
    } finally {
        setEnriching(prev => { const newSet = new Set(prev); newSet.delete(website.id); return newSet; });
    }
};

// The rest of the file remains the same...
// NOTE: This is a partial file for brevity. The full file will be written.
const FullWebsitesFileContent = `...`; // Placeholder for the full content
