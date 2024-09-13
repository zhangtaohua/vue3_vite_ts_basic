import Geojson from "geojson";

export function getLongitudeFromText(lng: string, toFixed = 6) {
  let longitude = 0.0;
  let longitudeText = "";

  let lngNum = parseFloat(lng);
  if (isNaN(lngNum)) {
    lngNum = 0.0;
  }
  let lngAbs = Math.abs(lngNum);
  if (lngAbs >= 180) {
    lngAbs = 180.0;
  }

  if (toFixed) {
    lngAbs = parseFloat(lngAbs.toFixed(toFixed));
  }

  if (lng.toUpperCase().indexOf("E") !== -1) {
    longitude = lngAbs;
    longitudeText = lngAbs + "E";
  } else if (lng.toUpperCase().indexOf("W") !== -1) {
    longitude = -lngAbs;
    longitudeText = lngAbs + "W";
  } else if (lngNum < 0) {
    longitude = -lngAbs;
    longitudeText = lngAbs + "W";
  } else {
    longitude = lngAbs;
    longitudeText = lngAbs + "E";
  }

  return {
    longitude,
    longitudeText,
  };
}

export function getLatitudeFromText(lat: string, toFixed = 6, isTowDimensionMap = false) {
  let latitude = 0.0;
  let latitudeText = "";

  let latNum = parseFloat(lat);
  if (isNaN(latNum)) {
    latNum = 0.0;
  }
  let latAbs = Math.abs(latNum);
  let latMax = 90.0;
  if (isTowDimensionMap) {
    latMax = 84.5;
  }
  if (latAbs >= latMax) {
    latAbs = latMax;
  }

  if (toFixed) {
    latAbs = parseFloat(latAbs.toFixed(toFixed));
  }

  if (lat.toUpperCase().indexOf("N") !== -1) {
    latitude = latAbs;
    latitudeText = latAbs + "N";
  } else if (lat.toUpperCase().indexOf("S") !== -1) {
    latitude = -latAbs;
    latitudeText = latAbs + "S";
  } else if (latNum < 0) {
    latitude = -latAbs;
    latitudeText = latAbs + "S";
  } else {
    latitude = latAbs;
    latitudeText = latAbs + "N";
  }

  return {
    latitude,
    latitudeText,
  };
}

export function getLongitudeLatitudeFromText(lng: string, lat: string, toFixed = 6, isTowDimensionMap = false) {
  const lngObj = getLongitudeFromText(lng, toFixed);
  const latObj = getLatitudeFromText(lat, toFixed, isTowDimensionMap);
  return {
    ...lngObj,
    ...latObj,
  };
}

/**
 * 由于有些地图wrap 时，经度是不断增加的，所以要调整回-180~180之间
 */
export function calibrateWrapLongitudeLatitude(lng: number, lat: number) {
  let longitude = lng;
  const latitude = lat;
  // 这里由于openlayer 会得到越过-180 到 180 的经度值
  if (longitude < -180 || longitude > 180) {
    const posLng = Math.abs(longitude) + 180;
    const divisor = Math.floor(posLng / 360);
    if (longitude < 0) {
      longitude = longitude + divisor * 360;
    } else if (longitude > 0) {
      longitude = longitude - divisor * 360;
    }
  }
  return {
    longitude,
    latitude,
  };
}

/**
 * 距离（米）转换为纬度  一米对应的纬度为定值
 * @param meter 距离多少米
 * @returns {number}
 */
export function geoMeter2Lat(meter: number) {
  if (!meter) {
    return 0;
  }
  const pi = Math.PI;
  const lngInMeter = (6371 * 2 * pi) / 360;
  return meter / lngInMeter / 1000;
}

/**
 * 距离（米）转换为经度  不同纬度下一米对应的经度不同
 * @param meter 距离
 * @param lat 所在纬度
 * @returns {number}
 */
export function geoMeter2Lng(meter: number, lat: number) {
  if (!meter || !lat) {
    return 0;
  }
  const pi = Math.PI;
  const latInMeter = (Math.cos((lat * pi) / 180) * 6371 * 2 * pi) / 360;
  return meter / latInMeter / 1000;
}

export function anticlockwiseRotatePoint(x: number, y: number, x0: number, y0: number, angle: number) {
  const pi = Math.PI;
  const theta = (angle * pi) / 180;
  const x1 = (x0 - x) * Math.cos(theta) - (y0 - y) * Math.sin(theta) + x;
  const y1 = (x0 - x) * Math.sin(theta) + (y0 - y) * Math.cos(theta) + y;

  return [x1, y1];
}

export function clockwiseRotatePoint(x: number, y: number, x0: number, y0: number, angle: number) {
  const pi = Math.PI;
  const theta = (angle * pi) / 180;
  const x1 = (x0 - x) * Math.cos(theta) + (y0 - y) * Math.sin(theta) + x;
  const y1 = (y0 - y) * Math.cos(theta) - (x0 - x) * Math.sin(theta) + y;

  return [x1, y1];
}

export function getExtentFromRectCoords(coordinates: any) {
  let minLongitude = 180;
  let maxLongitude = -180;
  let minLatitude = 85;
  let maxLatitude = -85;

  if (coordinates.length) {
    const coordinates1 = coordinates[0];
    if (coordinates1.length) {
      for (let i = 0; i < coordinates1.length; i++) {
        const coordTemp = coordinates1[i];
        if (coordTemp.length && coordTemp.length == 2) {
          if (coordTemp[0] < minLongitude) {
            minLongitude = coordTemp[0];
          }
          if (coordTemp[0] >= maxLongitude) {
            maxLongitude = coordTemp[0];
          }
          if (coordTemp[1] < minLatitude) {
            minLatitude = coordTemp[1];
          }
          if (coordTemp[1] >= maxLatitude) {
            maxLatitude = coordTemp[1];
          }
        }
      }
    }
  }
  return [minLongitude, minLatitude, maxLongitude, maxLatitude];
}

// 重新排列extent 坐标顺利， 左下 右下 右上 左上 再左下 即逆时针。
export function getLbToRuCoordinates(coordinates: any) {
  if (coordinates.length) {
    let newBbox: any = [];
    let isRegular = false;
    const bbox: any = coordinates[0];
    if (bbox.length && bbox.length >= 5) {
      if (bbox[1][0] - bbox[0][0] > 0) {
        // 第二点经度 > 第一个点 向左
        if (bbox[2][1] - bbox[1][1] > 0) {
          // 第三点纬度 > 第二个点 向上
          if (bbox[2][0] - bbox[3][0] > 0) {
            // 第三点经度 > 第四个点 向右
            newBbox = [[...bbox[0]], [...bbox[1]], [...bbox[2]], [...bbox[3]], [...bbox[0]]];
          } // 无else 不可能存在
        } else {
          // 第三点纬度 > 第二个点 向下
          if (bbox[2][0] - bbox[3][0] > 0) {
            newBbox = [[...bbox[3]], [...bbox[2]], [...bbox[1]], [...bbox[0]], [...bbox[3]]];
          }
        }
      } else if (bbox[1][0] - bbox[0][0] < 0) {
        // 第二点经度 > 第一个点 向右
        if (bbox[2][1] - bbox[1][1] > 0) {
          // 第三点纬度 > 第二个点 向上
          if (bbox[3][0] - bbox[2][0] > 0) {
            // 第四点经度 > 第三个点 向右
            newBbox = [[...bbox[1]], [...bbox[0]], [...bbox[3]], [...bbox[2]], [...bbox[1]]];
          } // 无else 不可能存在
        } else {
          // 第三点纬度 > 第二个点 向下
          if (bbox[3][0] - bbox[2][0] > 0) {
            newBbox = [[...bbox[2]], [...bbox[3]], [...bbox[0]], [...bbox[1]], [...bbox[2]]];
          }
        }
      } else {
        isRegular = true;
        if (bbox[1][1] - bbox[0][1] > 0) {
          if (bbox[2][0] - bbox[1][0] > 0) {
            // 第三点经度 > 第二个点 向右
            if (bbox[2][1] - bbox[3][1] > 0) {
              // 第三点经度 > 第四个点 向下
              newBbox = [[...bbox[0]], [...bbox[3]], [...bbox[2]], [...bbox[1]], [...bbox[0]]];
            }
          } else {
            if (bbox[2][1] - bbox[3][1] > 0) {
              // 第三点经度 > 第四个点 向下
              newBbox = [[...bbox[3]], [...bbox[0]], [...bbox[1]], [...bbox[2]], [...bbox[3]]];
            }
          }
        } else {
          if (bbox[2][0] - bbox[1][0] > 0) {
            // 第三点经度 > 第二个点 向右
            if (bbox[3][1] - bbox[2][1] > 0) {
              // 第三点经度 > 第四个点 向下
              newBbox = [[...bbox[1]], [...bbox[2]], [...bbox[3]], [...bbox[0]], [...bbox[1]]];
            }
          } else {
            if (bbox[3][1] - bbox[2][1] > 0) {
              // 第三点经度 > 第四个点 向下
              newBbox = [[...bbox[2]], [...bbox[1]], [...bbox[0]], [...bbox[3]], [...bbox[2]]];
            }
          }
        }
      }
    }
    if (newBbox.length !== 5) {
      console.log("计算左下右上矩阵出错！！");
      return [];
    } else {
      return [newBbox];
    }
  }
}

// 计算两点对于正北方向的朝向角度
export function angleOfNorth(lat1: number, lon1: number, lat2: number, lon2: number) {
  const rad = Math.PI / 180,
    a1 = lat1 * rad,
    a2 = lat2 * rad,
    b1 = lon1 * rad,
    b2 = lon2 * rad;
  const a = Math.sin(b2 - b1) * Math.cos(a2);
  const b = Math.cos(a1) * Math.sin(a2) - Math.sin(a1) * Math.cos(a2) * Math.cos(b2 - b1);

  return Math.atan2(a, b);
}

export function getCenterFromExtent(extent: any) {
  if (extent.length === 4) {
    const lng = (extent[0] + extent[2]) / 2;
    const lat = (extent[1] + extent[3]) / 2;
    return [lng, lat];
  }

  return null;
}

export function getExtentFromGeoPolygon(polygon: any) {
  let extent = [-180, -90, 180, 90];
  let minLongitude = 180;
  let maxLongitude = -180;
  let minLatitude = 90;
  let maxLatitude = -90;
  let isRefreshed = false;

  switch (polygon.type) {
    case "Polygon": {
      if (polygon.coordinates.length) {
        const coordinates1 = polygon.coordinates[0];
        if (coordinates1.length) {
          for (let i = 0; i < coordinates1.length; i++) {
            const coordTemp = coordinates1[i];
            if (coordTemp.length && coordTemp.length == 2) {
              isRefreshed = true;
              if (coordTemp[0] < minLongitude) {
                minLongitude = coordTemp[0];
              }
              if (coordTemp[0] >= maxLongitude) {
                maxLongitude = coordTemp[0];
              }
              if (coordTemp[1] < minLatitude) {
                minLatitude = coordTemp[1];
              }
              if (coordTemp[1] >= maxLatitude) {
                maxLatitude = coordTemp[1];
              }
            }
          }
        }
      }
      break;
    }
    default: {
      break;
    }
  }

  if (isRefreshed) {
    extent = [minLongitude, minLatitude, maxLongitude, maxLatitude];
  }
  return extent;
}

export function getRectangleFromExtent(extent: any) {
  const x1 = +extent[0];
  const y1 = +extent[1];

  const x2 = +extent[2];
  const y2 = +extent[3];

  const polygon = [
    [
      [x1, y1],
      [x2, y1],
      [x2, y2],
      [x1, y2],
      [x1, y1],
    ],
  ];
  return polygon;
}

// 点 Point 一维
// 多点 MultiPoint  二维
// 线 LineString 二维
// 多线 MultiLineString 三维
// 环 Ring 二维
// 多边形 Polygon 三维
// 多维多边形 MultiPolygon 四维

export function getGeoPointFromXY(x: number, y: number, props: any = {}) {
  const point = {
    longitude: x,
    latitude: y,
    ...props,
  };
  return Geojson.parse(point, { Point: ["latitude", "longitude"] });
}

export function getGeoPointFromCoords(coords: any, props: any = {}) {
  const point = {
    longitude: coords[0],
    latitude: coords[1],
    ...props,
  };
  return Geojson.parse(point, { Point: ["latitude", "longitude"] });
}

export function getGeoPointFromCoordsArray(coords: any, props: any = {}) {
  const points = {
    multiPoint: coords,
    ...props,
  };
  return Geojson.parse(points, { MultiPoint: "multiPoint" });
}

export function getGeoPointFromLongitudeLatitude(longitude: number, latitude: number, props: any = {}) {
  const point = {
    longitude,
    latitude,
    ...props,
  };
  return Geojson.parse(point, { Point: ["latitude", "longitude"] });
}

export function getGeoPolygonFromExtent(extent: any, props: any = {}) {
  const rectangle = getRectangleFromExtent(extent);
  const polygon = {
    polygon: rectangle,
    ...props,
  };
  return Geojson.parse(polygon, { Polygon: "polygon" });
}

export function getGeoPolygonFromLDRU(
  ld_longitude: number,
  ld_latitude: number,
  ru_longitude: number,
  ru_latitude: number,
  props: any = {},
) {
  const polygon = {
    polygon: [
      [
        [ld_longitude, ld_latitude],
        [ru_longitude, ld_latitude],
        [ru_longitude, ru_latitude],
        [ld_longitude, ru_latitude],
        [ld_longitude, ld_latitude],
      ],
    ],
    ...props,
  };
  return Geojson.parse(polygon, { Polygon: "polygon" });
}

export function getGeoPolygonFromPolygonArray(polygonArray: any, props: any = {}) {
  const polygon = {
    polygon: polygonArray,
    ...props,
  };
  return Geojson.parse(polygon, { Polygon: "polygon" });
}

export function getGeoPointPolygonFromCoords(ldCoordsLnglag: any, ruCoordsLnglag: any) {
  const data = [
    {
      x: ruCoordsLnglag[1],
      y: ldCoordsLnglag[0],
    },
    {
      polygon: [
        [
          [ldCoordsLnglag[0], ldCoordsLnglag[1]],
          [ruCoordsLnglag[0], ldCoordsLnglag[1]],
          [ruCoordsLnglag[0], ruCoordsLnglag[1]],
          [ldCoordsLnglag[0], ruCoordsLnglag[1]],
          [ldCoordsLnglag[0], ldCoordsLnglag[1]],
        ],
      ],
    },
  ];
  return Geojson.parse(data, { Point: ["x", "y"], Polygon: "polygon" });
}

export function getGeoMultiPolygonFromPolygonArray(polygonArray: any, props: any = {}) {
  const polygon = {
    multiPolygon: polygonArray,
    ...props,
  };
  return Geojson.parse(polygon, { MultiPolygon: "multiPolygon" });
}

export function getGeoPolygonFromCoords(coords: any, props: any = {}) {
  const polygon = {
    polygon: coords[0],
    ...props,
  };
  return Geojson.parse(polygon, { Polygon: "polygon" });
}

export function getGeoLineFromArray(twoDimArray: any, props: any = {}) {
  const lindObj = {
    line: twoDimArray,
    ...props,
  };
  return Geojson.parse(lindObj, { LineString: "line" });
}

export function getGeoMultiLineFromCoordsArray(coordsArray: any, props: any = {}) {
  const lindObj = {
    multiLineString: coordsArray,
    ...props,
  };
  return Geojson.parse(lindObj, { MultiLineString: "multiLineString" });
}

export function getGeoMultiLineFromArray(twoDimArray: any, props: any = {}) {
  const lindObj = {
    line: twoDimArray,
    ...props,
  };
  return Geojson.parse(lindObj, { MultiLineString: "line" });
}

export function calibratePosionsExpand(positions: any) {
  const positionNew = [];
  if (positions.length >= 2) {
    let isPlus = -1;
    let divisor = 0;
    const negative = -180;
    const postive = 180;
    const gap = 50;

    positionNew.push(positions[0]);
    for (let i = 1; i < positions.length; i++) {
      const positionOld = { ...positions[i - 1] };
      const position = { ...positions[i] };

      if (positionOld.longitude < 0 && position.longitude >= 0) {
        // 从 -180 附近 直接到了 180
        if (positionOld.longitude - negative < gap) {
          divisor = divisor + 1;
          // console.log("divisor N", positionOld.longitude, position.longitude, divisor);
          isPlus = -1;
        }
      } else if (positionOld.longitude >= 0 && position.longitude < 0) {
        if (postive - positionOld.longitude < gap) {
          divisor = divisor + 1;
          isPlus = 1;
          // console.log("divisor P", positionOld.longitude, position.longitude, divisor);
        }
      }

      position.longitude = position.longitude + isPlus * divisor * 360;
      // 最后的计算公式
      positionNew.push(position);
    }
  }
  return positionNew;
}

export function calibratePosionsMerge(positions: any) {
  const positionNew = [];
  if (positions.length >= 2) {
    const negative = -180;
    const postive = 180;
    const gap = 50;
    let newArrayIndex = 0;

    positionNew.push([]);
    positionNew[newArrayIndex].push(positions[0]);
    for (let i = 1; i < positions.length; i++) {
      const positionOld = { ...positions[i - 1] };
      const position = { ...positions[i] };
      const midPosition = {
        longitude: 0,
        latitude: 0,
        altitude: 0,
      };

      if (positionOld.longitude < 0 && position.longitude >= 0) {
        // 从 -180 附近 直接到了 180
        if (positionOld.longitude - negative < gap && postive - position.longitude < gap) {
          midPosition.longitude = -180;
          if (position.latitude >= positionOld.latitude) {
            midPosition.latitude =
              ((position.latitude - positionOld.latitude) / (positionOld.longitude + 180 + 180 - position.longitude)) *
                (positionOld.longitude + 180) +
              positionOld.latitude;
          } else {
            midPosition.latitude =
              positionOld.latitude -
              (Math.abs(position.latitude - positionOld.latitude) /
                (positionOld.longitude + 180 + 180 - position.longitude)) *
                (positionOld.longitude + 180);
          }
          midPosition.altitude = positionOld.altitude + Math.abs(positionOld.altitude - position.altitude) / 2;
          positionNew[newArrayIndex].push({ ...midPosition });
          positionNew.push([]);
          newArrayIndex = newArrayIndex + 1;
          midPosition.longitude = 180;
          positionNew[newArrayIndex].push({ ...midPosition });
        }
      } else if (positionOld.longitude >= 0 && position.longitude < 0) {
        if (postive - positionOld.longitude < gap && position.longitude - negative < gap) {
          midPosition.longitude = 180;
          if (position.latitude >= positionOld.latitude) {
            midPosition.latitude =
              ((position.latitude - positionOld.latitude) / (180 - positionOld.longitude + 180 - position.longitude)) *
                (180 - positionOld.longitude) +
              positionOld.latitude;
          } else {
            midPosition.latitude =
              positionOld.latitude -
              (Math.abs(positionOld.latitude - position.latitude) /
                (180 - positionOld.longitude + 180 - position.longitude)) *
                (180 - positionOld.longitude);
          }
          midPosition.altitude = position.altitude + Math.abs(positionOld.altitude - position.altitude) / 2;
          positionNew[newArrayIndex].push({ ...midPosition });
          positionNew.push([]);
          newArrayIndex = newArrayIndex + 1;
          midPosition.longitude = -180;
          positionNew[newArrayIndex].push({ ...midPosition });
        }
      }
      positionNew[newArrayIndex].push(position);
    }
  }
  return positionNew;
}

export function getTwoDimArrayFromLngLatObj(positions: any) {
  const twoDimArray = [];
  if (positions.length) {
    for (let i = 0; i < positions.length; i++) {
      const positionTemp = positions[i];
      twoDimArray.push([positionTemp.longitude, positionTemp.latitude]);
    }
  }
  return twoDimArray;
}

export function getMultiDimArrayFromLngLatObj(positions: any) {
  const multiDimArray = [];
  if (positions.length) {
    for (let i = 0; i < positions.length; i++) {
      const positionTemp = positions[i];
      if (positionTemp.length) {
        multiDimArray.push([]);
        for (let j = 0; j < positionTemp.length; j++) {
          const positionTemp2 = positionTemp[j];
          multiDimArray[i].push([positionTemp2.longitude, positionTemp2.latitude]);
        }
      }
    }
  }
  return multiDimArray;
}

export function makeGeometryCollectionFromGeojson(geojson: any) {
  // const geojsonTemp = {
  //   type: "FeatureCollection",
  //   features: [
  //     {
  //       type: "Feature",
  //       properties: {},
  //       geometry: {
  //         type: "GeometryCollection",
  //         geometries: [],
  //       },
  //     },
  //   ],
  // };

  const geojsonTemp = {
    type: "GeometryCollection",
    geometries: [],
  };

  if (geojson && geojson.features && geojson.features.length) {
    if (geojson.features.length == 1) {
      return geojson.features[0].geometry;
    } else {
      for (let i = 0; i < geojson.features.length; i++) {
        const feature = geojson.features[i];
        const geometry = feature.geometry;
        if (geometry) {
          geojsonTemp.geometries.push(geometry);
        }
      }
      return geojsonTemp;
    }
  } else {
    return null;
  }
}
