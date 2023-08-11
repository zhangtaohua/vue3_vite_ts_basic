import * as Cesium from "cesium";

export function checkCesiumIsLoaded() {
  if (Cesium && Cesium.Viewer) {
    return true;
  } else {
    return false;
  }
}

export const awaitCesiumIsLoaded = () => {
  let awaitLoadTimer: any = null;

  const clearAwaitLoadTimer = () => {
    if (awaitLoadTimer) {
      clearInterval(awaitLoadTimer);
    }
    awaitLoadTimer = null;
  };

  return new Promise((reslove: any, reject: any) => {
    clearAwaitLoadTimer();
    let tryTimers = 0;
    awaitLoadTimer = setInterval(() => {
      if (Cesium && Cesium.Viewer) {
        clearAwaitLoadTimer();
        tryTimers = 0;
        return reslove(true);
      } else {
        tryTimers++;
        if (tryTimers > 9999) {
          clearAwaitLoadTimer();
          return reject(false);
        }
      }
    }, 50);
  });
};

export function getCsColor(color: any, defaultCsColor = Cesium.Color.RED) {
  if (color) {
    if (color.length && color.length == 3) {
      return new Cesium.Color(color[0] / 255.0, color[1] / 255.0, color[2] / 255.0, 1.0);
    } else if (color.length && color.length === 4) {
      if (color[3] > 1.0) {
        return new Cesium.Color(color[0] / 255.0, color[1] / 255.0, color[2] / 255.0, color[3] / 255);
      } else {
        return new Cesium.Color(color[0] / 255.0, color[1] / 255.0, color[2] / 255.0, color[3]);
      }
    } else if (typeof color === "string") {
      const colorNew = new Cesium.Color.fromCssColorString(color);
      if (colorNew) {
        return colorNew;
      } else {
        return defaultCsColor;
      }
    } else if (typeof color === "object" && color instanceof Cesium.Color) {
      return color;
    }
  } else {
    return defaultCsColor;
  }
}

export function getCsCartesian2(point: any) {
  if (point) {
    if (point.length && point.length == 2) {
      return new Cesium.Cartesian2(point[0], point[1]);
    } else {
      return point;
    }
  } else {
    return Cesium.Cartesian2.ZERO;
  }
}

export function getCsCartesian3(point: any) {
  if (point) {
    if (point.length && point.length == 3) {
      return new Cesium.Cartesian3(point[0], point[1], point[2]);
    } else {
      return point;
    }
  } else {
    return Cesium.cartesian3.ZERO;
  }
}

// 空间两点距离计算函数
export function getCsSpaceDistanceV1(start: any, end: any) {
  // 将起点与终点位置信息从笛卡尔坐标形式转换为Cartographic形式
  const startCartographic = Cesium.Cartographic.fromCartesian(start);
  const endCartographic = Cesium.Cartographic.fromCartesian(end);
  // 初始化测地线
  const geodesic = new Cesium.EllipsoidGeodesic();
  // 设置测地线起点和终点，EllipsoidGeodesic中setEndPoints常与surfaceDistance搭配使用
  geodesic.setEndPoints(startCartographic, endCartographic);
  // surfaceDistance返回number 单位为m，带小数
  const mDistance = geodesic.surfaceDistance;
  // const kmDistance = geodesic.surfaceDistance / 1000;
  // console.log((geodesic.surfaceDistance / 1000).toFixed(2))
  return mDistance;
}

// 用来获取空间距离，可是好像不太对
export function getCsSpaceDistanceV2(point1: any, point2: any) {
  const point1cartographic = Cesium.Cartographic.fromCartesian(point1);
  const point2cartographic = Cesium.Cartographic.fromCartesian(point2);
  /**根据经纬度计算出距离**/
  const geodesic = new Cesium.EllipsoidGeodesic();
  geodesic.setEndPoints(point1cartographic, point2cartographic);
  let mDistance = geodesic.surfaceDistance;
  //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)))
  //返回两点之间的距离
  mDistance = Math.sqrt(Math.pow(mDistance, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
  return mDistance;
}

// 计算两个点的中点
export function getMidpoint(start: any, end: any) {
  const startPoint = Cesium.Cartographic.fromCartesian(start);
  const endPoint = Cesium.Cartographic.fromCartesian(end);
  const geodesic = new Cesium.EllipsoidGeodesic();
  geodesic.setEndPoints(startPoint, endPoint);
  const geoPoint = geodesic.interpolateUsingFraction(0.5);
  // console.log("getMidpoint", geoPoint, Cesium.Ellipsoid.WGS84.cartographicToCartesian(geoPoint));
  return Cesium.Ellipsoid.WGS84.cartographicToCartesian(geoPoint);
}

// 测量空间面积相关
// 计算方向
export function bearingV1(from: any, to: any) {
  const fromCartographic = Cesium.Cartographic.fromCartesian(from);
  const toCartographic = Cesium.Cartographic.fromCartesian(to);
  const lat1 = fromCartographic.latitude;
  const lon1 = fromCartographic.longitude;
  const lat2 = toCartographic.latitude;
  const lon2 = toCartographic.longitude;
  let angle = -Math.atan2(
    Math.sin(lon1 - lon2) * Math.cos(lat2),
    Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2),
  );
  if (angle < 0) {
    angle += Math.PI * 2.0;
  }
  return angle;
}

// 角度
export function pointAngleV1(point1: any, point2: any, point3: any) {
  const bearing21 = bearingV1(point2, point1);
  const bearing23 = bearingV1(point2, point3);
  let angle = bearing21 - bearing23;
  if (angle < 0) {
    angle += Math.PI * 2.0;
  }
  return angle;
}

// 计算面积
export function getAreaV1(positions: any) {
  let res: number | string = 0;
  for (let i = 0; i < positions.length - 2; i++) {
    const j = (i + 1) % positions.length;
    const k = (i + 2) % positions.length;
    const totalAngle = pointAngleV1(positions[i], positions[j], positions[k]);
    const tempLength1 = getCsSpaceDistanceV1(positions[j], positions[0]);
    const tempLength2 = getCsSpaceDistanceV1(positions[k], positions[0]);
    res += (tempLength1 * tempLength2 * Math.sin(totalAngle)) / 2;
  }
  res = res.toFixed(2);
  // console.log(res)
  res = parseFloat(res);
  // console.log(Math.abs(res))
  return Math.abs(res);
}

// 计算方向 版本2
export function bearingV2(from: any, to: any) {
  const radiansPerDegree = Math.PI / 180.0; //角度转化为弧度(rad)
  const degreesPerRadian = 180.0 / Math.PI; //弧度转化为角度

  const lat1 = from.lat * radiansPerDegree;
  const lon1 = from.lon * radiansPerDegree;
  const lat2 = to.lat * radiansPerDegree;
  const lon2 = to.lon * radiansPerDegree;
  let angle = -Math.atan2(
    Math.sin(lon1 - lon2) * Math.cos(lat2),
    Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2),
  );
  if (angle < 0) {
    angle += Math.PI * 2.0;
  }
  angle = angle * degreesPerRadian; //角度
  return angle;
}

// 角度 版本2
export function pointAngleV2(p1: any, p2: any, p3: any) {
  const bearing21 = bearingV2(p2, p1);
  const bearing23 = bearingV2(p2, p3);
  let angle = bearing21 - bearing23;
  if (angle < 0) {
    angle += 360;
  }
  return angle;
}

// 计算面积
export function getAreaV2(points: any, positions: any) {
  let res: number | string = 0;
  //拆分三角曲面
  for (let i = 0; i < points.length - 2; i++) {
    const j = (i + 1) % points.length;
    const k = (i + 2) % points.length;
    const totalAngle = pointAngleV2(points[i], points[j], points[k]);

    const dis_temp1 = getCsSpaceDistanceV2(positions[i], positions[j]);
    const dis_temp2 = getCsSpaceDistanceV2(positions[j], positions[k]);
    res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle));
    // console.log('getArea', res)
  }
  res = res.toFixed(2);
  // console.log(res)
  res = parseFloat(res);
  // console.log(Math.abs(res))
  return Math.abs(res);

  // return (res / 1000000.0).toFixed(4);
}
