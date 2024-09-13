import * as THREE from "three";

export function getCameraXZPlaneAngle(camera) {
  const position = camera.position;

  // 计算在 XZ 平面上的角度 就是绕Y轴的角度（yaw roll)
  const angleXZ = Math.atan2(position.z, position.x);
  const angleXZDegrees = THREE.MathUtils.radToDeg(angleXZ);

  console.log("angleXZ", angleXZ, angleXZDegrees);

  return {
    angleXZ,
    angleXZDegrees,
  };
}

export function getCameraXYPlaneAngle(camera) {
  const position = camera.position;

  // 计算在 XY 平面上的角度 就是绕Z轴的角度（heading)
  const angleXY = Math.atan2(position.x, position.y);
  const angleXYDegrees = THREE.MathUtils.radToDeg(angleXY);

  console.log("angleXZ", angleXY, angleXYDegrees);

  return {
    angleXY,
    angleXYDegrees,
  };
}

export function getCameraYZPlaneAngle(camera) {
  const position = camera.position;

  // 计算在 XZ 平面上的角度 就是绕X轴的角度（yaw roll)
  const angleYZ = Math.atan2(position.y, position.z);
  const angleYZDegrees = THREE.MathUtils.radToDeg(angleYZ);

  console.log("angleXZ", angleYZ, angleYZDegrees);

  return {
    angleYZ,
    angleYZDegrees,
  };
}

export function getCameraXAngle(camera) {
  const position = camera.position;

  // 计算 其与 X轴 的角度
  const distanceYZ = Math.sqrt(position.y ** 2 + position.z ** 2);

  const angleX = Math.atan2(position.x, distanceYZ);
  const angleXDegrees = THREE.MathUtils.radToDeg(angleX);
  // console.log("angleX", angleX, angleXDegrees);

  return {
    angleX,
    angleXDegrees,
  };
}

export function getCameraYAngle(camera) {
  const position = camera.position;

  // 计算 其与 U轴 的角度
  const distanceXZ = Math.sqrt(position.x ** 2 + position.z ** 2);
  const angleY = Math.atan2(position.y, distanceXZ);
  const pitch = angleY;
  const angleYDegrees = THREE.MathUtils.radToDeg(angleY);
  const pitchDegrees = angleYDegrees;

  // console.log("angleY", angleY, angleYDegrees);
  return {
    angleY,
    angleYDegrees,
  };
}

export function getCameraZAngle(camera) {
  const position = camera.position;

  // 计算 其与 X轴 的角度
  const distanceXY = Math.sqrt(position.x ** 2 + position.y ** 2);

  const angleZ = Math.atan2(position.z, distanceXY);
  const angleZDegrees = THREE.MathUtils.radToDeg(angleZ);
  // console.log("angleZ", angleZ, angleZDegrees);

  return {
    angleZ,
    angleZDegrees,
  };
}
