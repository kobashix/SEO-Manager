export interface SeoStatus {
  indexed: boolean;
  lastChecked: string;
  rank?: number;
  issues: string[];
}

export interface Domain {
  id: string;
  url: string;
  name: string;
  status: 'active' | 'warning' | 'error';
  gscLink?: string;
  bingLink?: string;
  yandexLink?: string;
  indexNowKey?: string;
  engines: {
    google: SeoStatus;
    bing: SeoStatus;
    yandex: SeoStatus;
  };
  indexNow: {
    lastPush: string;
    status: 'success' | 'failed' | 'pending';
  };
}

export interface Stats {
  totalDomains: number;
  indexedUrls: number;
  warnings: number;
  errors: number;
}
