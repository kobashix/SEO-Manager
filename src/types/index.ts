export interface BaseWebsite {
  id: string;
  url: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  created_at: string;
  twitter_url?: string;
  facebook_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  youtube_url?: string;
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
