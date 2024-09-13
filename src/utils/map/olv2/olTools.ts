import * as olProj from "ol/proj";
import { getArea, getLength } from "ol/sphere";
import { GeoJSON } from "ol/format";
import { transform, getUserProjection, fromUserCoordinate } from "ol/proj";
import {
  GeometryCollection,
  Point,
  Polygon,
  LineString,
  MultiPoint,
  Circle as CircleGeom,
  MultiPolygon,
  MultiLineString,
} from "ol/geom";

import { fromCircle } from "ol/geom/Polygon";

import { squaredDistance as squaredCoordinateDistance } from "ol/coordinate.js";

import { calibrateWrapLongitudeLatitude, getLbToRuCoordinates } from "../geoCommon.ts";

export function transformLongitudeLatitude(center: Array<number>) {
  return olProj.fromLonLat(center, "EPSG:3857");
}

export function transformExtentTo3857(extent: any) {
  return olProj.transformExtent(extent, "EPSG:4326", "EPSG:3857");
}

export function transformExtentTo4326(extent: any) {
  return olProj.transformExtent(extent, "EPSG:3857", "EPSG:4326");
}

export function transformTo3857(center: Array<number>) {
  return olProj.transform(center, "EPSG:4326", "EPSG:3857");
}

export function transformTo4326(center: Array<number>) {
  return olProj.transform(center, "EPSG:3857", "EPSG:4326");
}

export function transformRectCoordinatesTo3857(coordinates: any) {
  const imageMask = [
    [
      olProj.transform(coordinates[0][0], "EPSG:4326", "EPSG:3857"),
      olProj.transform(coordinates[0][1], "EPSG:4326", "EPSG:3857"),
      olProj.transform(coordinates[0][2], "EPSG:4326", "EPSG:3857"),
      olProj.transform(coordinates[0][3], "EPSG:4326", "EPSG:3857"),
      olProj.transform(coordinates[0][4], "EPSG:4326", "EPSG:3857"),
    ],
  ];
  return imageMask;
}

// extent 要是3857坐标系计算才比较准确
export function getAngleOfNorthFromCoordinates(coordinates: any) {
  let angle = 0;
  const bbox = getLbToRuCoordinates(coordinates);
  if (bbox?.length) {
    const newBbox = bbox[0];
    if (newBbox.length >= 5) {
      newBbox[0] = transformTo3857(newBbox[0]);
      newBbox[1] = transformTo3857(newBbox[1]);
      newBbox[2] = transformTo3857(newBbox[2]);
      newBbox[3] = transformTo3857(newBbox[3]);
      newBbox[4] = transformTo3857(newBbox[4]);
      let centerPoint = [
        (newBbox[2][0] - newBbox[0][0]) / 2 + newBbox[0][0],
        (newBbox[2][1] - newBbox[0][1]) / 2 + newBbox[0][1],
      ];
      const centerPoint2 = [
        (newBbox[3][0] - newBbox[1][0]) / 2 + newBbox[1][0],
        (newBbox[3][1] - newBbox[1][1]) / 2 + newBbox[1][1],
      ];

      centerPoint = [(centerPoint[0] + centerPoint2[0]) / 2, (centerPoint[1] + centerPoint2[1]) / 2];
      const vectorCToP2 = [newBbox[2][0] - centerPoint[0], newBbox[2][1] - centerPoint[1]];
      const vectorCToP3 = [newBbox[3][0] - centerPoint[0], newBbox[3][1] - centerPoint[1]];
      // console.log("vectorCToP2", bbox, newBbox, centerPoint, vectorCToP2, vectorCToP3);
      // console.log("两个中点", centerPoint, centerPoint2);

      const cosP2ToP3 =
        (vectorCToP2[0] * vectorCToP3[0] + vectorCToP2[1] * vectorCToP3[1]) /
        (Math.sqrt(vectorCToP2[0] * vectorCToP2[0] + vectorCToP2[1] * vectorCToP2[1]) *
          Math.sqrt(vectorCToP3[0] * vectorCToP3[0] + vectorCToP3[1] * vectorCToP3[1]));
      const angleP2ToP3 = Math.acos(cosP2ToP3);
      // console.log("cosP2ToP3", cosP2ToP3, angleP2ToP3, (angleP2ToP3 * 180) / Math.PI);
      if (angleP2ToP3 >= 0 && angleP2ToP3 <= Math.PI) {
        let halfAngleP2ToP3 = angleP2ToP3 / 2;
        halfAngleP2ToP3 = Math.PI / 2 - halfAngleP2ToP3;
        // if (newBbox[2][0] < newBbox[1][0]) {
        //   halfAngleP2ToP3 = -halfAngleP2ToP3;
        // }
        const fakeNorthPoint = [centerPoint[0] + 1, centerPoint[1]];
        const orgx = Math.cos(halfAngleP2ToP3);
        const orgY = Math.sin(halfAngleP2ToP3);
        const fakeNorthRotateVector = [orgx, orgY];
        // console.log("fakeNorthPoint", fakeNorthPoint, fakeNorthRotateVector);
        const cosAngle =
          (vectorCToP2[0] * fakeNorthRotateVector[0] + vectorCToP2[1] * fakeNorthRotateVector[1]) /
          (Math.sqrt(vectorCToP2[0] * vectorCToP2[0] + vectorCToP2[1] * vectorCToP2[1]) *
            Math.sqrt(
              fakeNorthRotateVector[0] * fakeNorthRotateVector[0] + fakeNorthRotateVector[1] * fakeNorthRotateVector[1],
            ));
        angle = Math.acos(cosAngle);
        if (newBbox[2][0] < newBbox[1][0]) {
          angle = -angle;
        }
        // console.log("finnal Angle", cosAngle, angle, (angle * 180) / Math.PI);
      }
    }
  }
  // console.log("angle 0", angle);
  return angle;
}

// extent 要是3857坐标系计算才比较准确 计算与正北的夹角.
export function getAngleOfNorthFromCoordinates2(coordinates: any) {
  let angle = 0;
  const bbox = getLbToRuCoordinates(coordinates);
  if (bbox?.length) {
    const newBbox = bbox[0];
    if (newBbox.length >= 5) {
      newBbox[0] = transformTo3857(newBbox[0]);
      newBbox[1] = transformTo3857(newBbox[1]);
      newBbox[2] = transformTo3857(newBbox[2]);
      newBbox[3] = transformTo3857(newBbox[3]);
      newBbox[4] = transformTo3857(newBbox[4]);

      const fakePoint1 = transformTo3857([0, 0]);
      const fakePoint2 = transformTo3857([0, 85]);

      const vectorCToP2 = [newBbox[1][0] - newBbox[2][0], newBbox[1][1] - newBbox[2][1]];
      const vectorCToP3 = [fakePoint1[0] - fakePoint2[0], fakePoint1[1] - fakePoint2[1]];

      const cosP2ToP3 =
        (vectorCToP2[0] * vectorCToP3[0] + vectorCToP2[1] * vectorCToP3[1]) /
        (Math.sqrt(vectorCToP2[0] * vectorCToP2[0] + vectorCToP2[1] * vectorCToP2[1]) *
          Math.sqrt(vectorCToP3[0] * vectorCToP3[0] + vectorCToP3[1] * vectorCToP3[1]));
      const angleP2ToP3 = Math.acos(cosP2ToP3);
      // console.log("cosP2ToP31", cosP2ToP3, angleP2ToP3, (angleP2ToP3 * 180) / Math.PI);
      if (newBbox[2][0] < newBbox[1][0]) {
        angle = -angleP2ToP3;
      } else {
        angle = angleP2ToP3;
      }
    }
  }
  // console.log("angle 2", angle);
  return angle;
}

export function getEastRadiansFromRectCoords(coordinates: any) {
  if (coordinates.length) {
    const bbox = getLbToRuCoordinates(coordinates);
    if (bbox?.length) {
      const newBbox = bbox[0];
      if (newBbox.length >= 5) {
        newBbox[0] = transformTo3857(newBbox[0]);
        newBbox[1] = transformTo3857(newBbox[1]);
        newBbox[2] = transformTo3857(newBbox[2]);
        newBbox[3] = transformTo3857(newBbox[3]);
        newBbox[4] = transformTo3857(newBbox[4]);
        const vectorOneX = newBbox[2][0] - newBbox[0][0];
        const vectorOneY = newBbox[2][1] - newBbox[0][1];
        const vectorOneAngle = Math.atan(vectorOneY / vectorOneX);

        const vectorTwoX = newBbox[3][0] - newBbox[1][0];
        const vectorTwoY = newBbox[3][1] - newBbox[1][1];
        const vectorTwoAngle = Math.atan(vectorTwoY / vectorTwoX);

        const vectorThreeX = newBbox[1][0] - newBbox[0][0];
        const vectorThreeY = newBbox[1][1] - newBbox[0][1];
        const vectorThreeAngle = Math.atan(vectorThreeY / vectorThreeX);

        return {
          vectorOneAngle,
          vectorTwoAngle,
          vectorThreeAngle,
        };
      }
    }
  }
  return null;
}

export function getEastRadiansFromRectCoords2(coordinates: any) {
  if (coordinates.length) {
    const bbox = getLbToRuCoordinates(coordinates);
    if (bbox?.length) {
      const newBbox = bbox[0];
      if (newBbox.length >= 5) {
        newBbox[0] = transformTo3857(newBbox[0]);
        newBbox[1] = transformTo3857(newBbox[1]);
        newBbox[2] = transformTo3857(newBbox[2]);
        newBbox[3] = transformTo3857(newBbox[3]);
        newBbox[4] = transformTo3857(newBbox[4]);
        const vectorOneX = newBbox[2][0] - newBbox[0][0];
        const vectorOneY = newBbox[2][1] - newBbox[0][1];
        const vectorOneAngle = Math.atan2(vectorOneY, vectorOneX);

        const vectorTwoX = newBbox[3][0] - newBbox[1][0];
        const vectorTwoY = newBbox[3][1] - newBbox[1][1];
        const vectorTwoAngle = Math.atan2(vectorTwoY, vectorTwoX);

        const vectorThreeX = newBbox[1][0] - newBbox[0][0];
        const vectorThreeY = newBbox[1][1] - newBbox[0][1];
        const vectorThreeAngle = Math.atan2(vectorThreeY, vectorThreeX);

        return {
          vectorOneAngle,
          vectorTwoAngle,
          vectorThreeAngle,
        };
      }
    }
  }
  return null;
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
    outputHtml = outputkm + " " + "KM²";
  } else {
    outputHtml = outputMu + " " + "M²";
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
    output = Math.round((length / 1000) * 100) / 100 + " " + "KM";
  } else {
    output = lengthTemp + " " + "M";
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
    outputHtml = outputMu + " " + "km²";
  } else {
    outputHtml = areaTemp + " " + "m²";
  }
  return {
    area: areaTemp,
    areaString: outputHtml,
  };
}

export function createCustomGeometryFunction(originGeometryFunc: any) {
  return function (coordinates: any, geometry: any, projection: any) {
    const originGeometry = originGeometryFunc(coordinates, geometry, projection);
    if (originGeometry) {
      const originCoordiantes = originGeometry.getCoordinates();
      if (originCoordiantes && originCoordiantes.length) {
        for (let i = 0; i < originCoordiantes[0].length; i++) {
          const temp = transform(originCoordiantes[0][i], projection, "EPSG:4326");
          if (temp.length) {
            if (temp[0] > 180) {
              temp[0] = 180;
            }
            if (temp[0] < -180) {
              temp[0] = -180;
            }
            originCoordiantes[0][i] = transform(temp, "EPSG:4326", projection);
          }
        }
      }
      originGeometry.setCoordinates(originCoordiantes);
    }
    return originGeometry;
  };
}

export const customCircleGeometryFunction = (coordinates: any, geometry: any, projection: any) => {
  const circle = geometry ? geometry : new CircleGeom([NaN, NaN]);
  const center = fromUserCoordinate(coordinates[0], projection);
  // const clickedCoord = transform(coordinates[1], projection, "EPSG:4326");
  let lastCoord = circle.getLastCoordinate();
  const lastCoord4326 = transform(lastCoord, projection, "EPSG:4326");
  let isOutRange = false;
  if (lastCoord4326.length) {
    if (lastCoord4326[0] > 180) {
      lastCoord4326[0] = 180;
      isOutRange = true;
    }
    if (lastCoord4326[0] < -180) {
      lastCoord4326[0] = -180;
      isOutRange = true;
    }
    lastCoord = transform(lastCoord4326, "EPSG:4326", projection);
  }
  if (isOutRange) {
    coordinates[1] = lastCoord;
  }
  const squaredLength = squaredCoordinateDistance(
    center,
    fromUserCoordinate(coordinates[coordinates.length - 1], projection),
  );
  circle.setCenterAndRadius(center, Math.sqrt(squaredLength), "XY");
  const userProjection = getUserProjection();
  if (userProjection) {
    circle.transform(projection, userProjection);
  }

  return circle;
};

export function calcGeometryFunctionCoords(originGeometry: any, projection = "EPSG:4326") {
  if (originGeometry) {
    const originCoordiantes = originGeometry.getCoordinates();
    if (originCoordiantes && originCoordiantes.length) {
      for (let i = 0; i < originCoordiantes[0].length; i++) {
        let temp = originCoordiantes[0][i];
        if (projection != "EPSG:4326") {
          temp = transform(originCoordiantes[0][i], projection, "EPSG:4326");
        }

        if (temp.length) {
          if (temp[0] > 180) {
            temp[0] = 180;
          }
          if (temp[0] < -180) {
            temp[0] = -180;
          }
          if (projection != "EPSG:4326") {
            originCoordiantes[0][i] = transform(temp, "EPSG:4326", projection);
          }
        }
      }
    }
    originGeometry.setCoordinates(originCoordiantes);
  }
  return originGeometry;
}
