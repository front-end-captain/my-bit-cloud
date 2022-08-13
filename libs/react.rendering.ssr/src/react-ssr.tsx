import type { RenderPlugin } from './render-plugins';
import { BrowserRendererOptions, BrowserRenderer } from './browser-renderer';
import { ServerRenderer, ServerRendererOptions } from './server-renderer';

export type ReactSsrOptions = Partial<ServerRendererOptions & BrowserRendererOptions>;

export class Ssr {
  constructor(
    // create array once, to keep consistent indexes between server and client
    private plugins: RenderPlugin[],
    private options?: ReactSsrOptions
  ) {}
  private browser = new BrowserRenderer(this.plugins, this.options);
  private server = new ServerRenderer(this.plugins, this.options);

  renderServer = this.server.render.bind(this.server);
  renderBrowser = this.browser.render.bind(this.browser);
}
