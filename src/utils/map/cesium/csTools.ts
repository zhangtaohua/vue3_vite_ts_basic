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
  if (color && color.length) {
    if ((color.length = 3)) {
      return new Cesium.Color(color[0] / 255.0, color[1] / 255.0, color[2] / 255.0, 1.0);
    } else if ((color.length = 4)) {
      return new Cesium.Color(color[0] / 255.0, color[1] / 255.0, color[2] / 255.0, color[3] / 255.0);
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
