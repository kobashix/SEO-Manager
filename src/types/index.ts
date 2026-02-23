export interface AppSettings {
  googleApiKey?: string;
  googleCxId?: string;
}
export interface BaseWebsite {
  id: string;
  url: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  created_at: string;
  is_wordpress?: boolean;
  screenshot_url?: string;
  meta_title?: string;
  meta_description?: string;
  gsc_url?: string;
  bing_url?: string;
  yandex_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  youtube_url?: string;
}
