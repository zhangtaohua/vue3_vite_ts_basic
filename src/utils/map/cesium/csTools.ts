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
