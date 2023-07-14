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
  const posLng = Math.abs(longitude) + 180;
  const divisor = Math.floor(posLng / 360);
  if (longitude < 0) {
    longitude = longitude + divisor * 360;
  } else if (longitude > 0) {
    longitude = longitude - divisor * 360;
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

export function getExtentFromDrawPolygon(coordinates: any) {
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
