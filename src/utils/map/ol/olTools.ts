import * as olProj from "ol/proj";
import { getArea, getLength } from "ol/sphere";
import { GeoJSON } from "ol/format";

import { calibrateWrapLongitudeLatitude } from "../geoCommon.ts";

export function transformLongitudeLatitude(center: Array<number>) {
  return olProj.fromLonLat(center, "EPSG:3857");
}

export function transformExtentTo3857(extent: Extent) {
  return olProj.transformExtent(extent, "EPSG:4326", "EPSG:3857");
}

export function transformExtentTo4326(extent: Extent) {
  return olProj.transformExtent(extent, "EPSG:3857", "EPSG:4326");
}

export function transformTo3857(center: Array<number>) {
  return olProj.transform(center, "EPSG:4326", "EPSG:3857");
}

export function transformTo4326(center: Array<number>) {
  return olProj.transform(center, "EPSG:3857", "EPSG:4326");
}

export function getCorrdinateLongitudeLatitude(corrdinate: any) {
  const lnglatOrigin = olProj.transform(corrdinate, "EPSG:3857", "EPSG:4326");
  const { longitude, latitude } = calibrateWrapLongitudeLatitude(lnglatOrigin[0], lnglatOrigin[1]);
  return {
    longitude,
    latitude,
  };
}

export function formatArea(polygon: any, projection = "EPSG:3857") {
  const area = getArea(polygon, { projection: projection });
  let outputHtml = "";
  const outputMu = Math.round(area * 100) / 100;
  if (area > 10000) {
    const outputkm = Math.round((area / 1000000) * 100) / 100;
    outputHtml = outputkm + " " + "km<sup>2</sup>";
  } else {
    outputHtml = outputMu + " " + "m<sup>2</sup>";
  }
  return {
    area: outputMu,
    areaString: outputHtml,
  };
}

export function formatLength(line: any, projection = "EPSG:3857") {
  const length = getLength(line, { projection: projection });
  let output = "";
  const lengthTemp = Math.round(length * 100) / 100;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + " " + "km";
  } else {
    output = lengthTemp + " " + "m";
  }
  return {
    length: lengthTemp,
    lengthString: output,
  };
}

export function formatAreaFromGeojson(geojsonData: any) {
  const GeoJsonReader = new GeoJSON({
    dataProjection: "EPSG:4326",
    featureProjection: "EPSG:3857",
  });

  let areaTemp = 0;
  const geoFeatures = GeoJsonReader.readFeatures(geojsonData);
  geoFeatures.forEach((feature: any) => {
    const geometry = feature.getGeometry();
    const { area, areaString } = formatArea(geometry);
    areaTemp = areaTemp + area;
  });

  let outputHtml = "";
  if (areaTemp > 10000) {
    const outputMu = Math.round((areaTemp / 1000000) * 100) / 100;
    outputHtml = outputMu + " " + "km<sup>2</sup>";
  } else {
    outputHtml = areaTemp + " " + "m<sup>2</sup>";
  }
  return {
    area: areaTemp,
    areaString: outputHtml,
  };
}
