import { BingMapsImageryProvider } from "cesium";

export interface OsmOptions extends OpenStreetMapImageryProvider.ConstructorOptions {
  id: string;
  url?: string;
  name?: string;
  extent?: Array<number>;
  zIndex?: number;
}

/*
url	string
fileExtension	string
rectangle	rectangle	
culture	string	
minimumLevel	number
maximumLevel	number
ellipsoid  Ellipsoid
credit  Credit | string
*/
