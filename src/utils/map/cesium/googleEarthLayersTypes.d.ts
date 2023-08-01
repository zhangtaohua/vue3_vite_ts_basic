import { GoogleEarthEnterpriseMapsProvider } from "cesium";

export interface GoogleEarthOptions extends GoogleEarthEnterpriseMapsProvider.ConstructorOptions {
  id: string;
  url?: string;
  name?: string;
  extent?: Array<number>;
  zIndex?: number;
}

/*
channel	number
path	string
maximumLevel	number
ellipsoid	Ellipsoid
tileDiscardPolicy	tileDiscardPolicy
*/
