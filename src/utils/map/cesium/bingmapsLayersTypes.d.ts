import { BingMapsImageryProvider } from "cesium";

export interface BingMapsOptions extends BingMapsImageryProvider.ConstructorOptions {
  id: string;
  url?: string;
  name?: string;
  extent?: Array<number>;
  zIndex?: number;
  useDefault?: boolean;
}

/*
key	string
tileProtocol	string
mapStyle	BingMapsStyle	
culture	string	
ellipsoid	Ellipsoid
tileDiscardPolicy	tileDiscardPolicy
*/
