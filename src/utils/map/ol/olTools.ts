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
  let outputMu = 0;
  if (area > 10000) {
    outputMu = Math.round((area / 1000000) * 100) / 100;
    outputHtml = outputMu + " " + "km<sup>2</sup>";
  } else {
    outputMu = Math.round(area * 100) / 100;
    outputHtml = outputMu + " " + "m<sup>2</sup>";
  }
  return { outputHtml, outputMu };
}

export function formatLength(line: any, projection = "EPSG:3857") {
  const length = getLength(line, { projection: projection });
  let output;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + " " + "km";
  } else {
    output = Math.round(length * 100) / 100 + " " + "m";
  }
  return output;
}

export function formatAreaFromGeojson(geojsonData: any) {
  const GeoJsonReader = new GeoJSON({
    dataProjection: "EPSG:4326",
    featureProjection: "EPSG:3857",
  });

  let area = 0;
  const geoFeatures = GeoJsonReader.readFeatures(geojsonData);
  geoFeatures.forEach((feature: any) => {
    const geometry = feature.getGeometry();
    const { outputHtml, outputMu } = formatArea(geometry);
    area = area + outputMu;
  });

  return area;
}
