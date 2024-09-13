export interface WMTSOptions {
  url: string;
  id: string;
  name?: string;
  zIndex?: number;
  extent?: Array<number>;
  wrapX?: boolean;
}
