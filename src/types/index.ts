export interface BaseWebsite {
  id: string;
  url: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  created_at: string;
}

export interface SeoStatus {
  indexed: boolean;
  lastChecked: string;
  rank?: number;
  issues: string[];
}

export interface AppSettings {
  googleApiKey?: string;
  googleCxId?: string;
}
