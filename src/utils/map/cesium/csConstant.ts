import * as Cesium from "cesium";

export const CesiumIondefaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2ZmI5ODc1Zi01MmE2LTQ5NWYtOGZjOS1iOTBlYWUxYmE1MzIiLCJpZCI6NDAzOTksImlhdCI6MTYwODcxMTA1OX0.afa3dsqtb9OfgN3IVcEOBAq17HsPKSRt7QUWLYE5Z5o";

export const cesiumViewMode = {
  scene2D: "2D",
  scene3D: "3D",
  columbus: "columbus_view",
  morphing: "morphing",
};

export const screenEventType = {
  LEFT_DOWN: Cesium.ScreenSpaceEventType.LEFT_DOWN,
  LEFT_UP: Cesium.ScreenSpaceEventType.LEFT_UP,
  LEFT_CLICK: Cesium.ScreenSpaceEventType.LEFT_CLICK,
  LEFT_DOUBLE_CLICK: Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,

  RIGHT_DOWN: Cesium.ScreenSpaceEventType.RIGHT_DOWN,
  RIGHT_UP: Cesium.ScreenSpaceEventType.RIGHT_UP,
  RIGHT_CLICK: Cesium.ScreenSpaceEventType.RIGHT_CLICK,

  MIDDLE_DOWN: Cesium.ScreenSpaceEventType.MIDDLE_DOWN,
  MIDDLE_UP: Cesium.ScreenSpaceEventType.MIDDLE_UP,
  MIDDLE_CLICK: Cesium.ScreenSpaceEventType.MIDDLE_CLICK,

  MOUSE_MOVE: Cesium.ScreenSpaceEventType.MOUSE_MOVE,
  WHEEL: Cesium.ScreenSpaceEventType.WHEEL,

  PINCH_START: Cesium.ScreenSpaceEventType.PINCH_START,
  PINCH_END: Cesium.ScreenSpaceEventType.PINCH_END,
  PINCH_MOVE: Cesium.ScreenSpaceEventType.PINCH_MOVE,
};
