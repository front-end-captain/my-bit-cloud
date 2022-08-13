import type { IncomingHttpHeaders } from 'http';

export type PartialLocation = Pick<
  Location,
  'host' | 'hostname' | 'href' | 'origin' | 'pathname' | 'port' | 'protocol' | 'hash' | 'search'
> & {
  /** @deprecated */
  query: Record<string, any>;
  /** @deprecated */
  url: string;
};

export type BrowserData = {
  location: PartialLocation;
  headers: IncomingHttpHeaders;

  /** @deprecated */
  connection: {
    /** @deprecated */
    secure: boolean;
    /** @deprecated */
    headers: IncomingHttpHeaders;
    /** @deprecated */
    body: any;
  };
  /** @deprecated */
  cookie?: string;
};
