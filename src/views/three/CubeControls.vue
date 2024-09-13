<template>
  <div id="rj-cub-nav-box" class="cub_nav_container"></div>
</template>

<script setup>
import { onMounted, onUnmounted, getCurrentInstance } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  getCameraXZPlaneAngle,
  getCameraXYPlaneAngle,
  getCameraYZPlaneAngle,
  getCameraXAngle,
  getCameraYAngle,
  getCameraZAngle,
} from "./cameraTools.js";

import { ResourceTracker } from "./clearResource.js";

let domParentEl = null;
let renderer = null;
let disposing = false;
let frameId = null;
let canvas = null;
let camera = null;
let scene = null;
let controls = null;
let gltfLoader = null;
let lights = [];
let models = new THREE.Object3D();
let cubeModel = null;
let snweModel = null;
let axisHelper = null;

let isDragging = false;
let clickTimeout;

let raycaster = null;

let CLIENT_WINDOW_WIDTH = 10;
let CLIENT_WINDOW_HEIGHT = 10;

const cameraLeft = -5,
  cameraRight = 5,
  cameraTop = 5,
  cameraBottom = -5,
  cameraNear = 0.1,
  cameraFar = 10;

const cameraFov = 75;
let cameraAspect = 1;

const cameraPosX = 4;
const cameraPosY = 4;
const cameraPosZ = 4;

const cameraLookatX = 0;
const cameraLookatY = 0;
const cameraLookatZ = 0;
const language = "en";

const cubeModelLabels = {
  TOP: {
    text: language.toLowerCase().includes("en") ? "TOP" : "顶",
    fontSize: 32,
    color: "#FFFFFF",
    fillColor: "#00FF00",
    mirror: [1, -1],
  },
  BOTTOM: {
    text: language.toLowerCase().includes("en") ? "BOTTOM" : "底",
    fontSize: 32,
    color: "#FFFFFF",
    fillColor: "#00A100",
    mirror: [1, -1],
  },
  RIGHT: {
    text: language.toLowerCase().includes("en") ? "RIGHT" : "右",
    fontSize: 32,
    color: "#FFFFFF",
    fillColor: "#FF0000",
    mirror: [1, -1],
  },
  LEFT: {
    text: language.toLowerCase().includes("en") ? "LEFT" : "左",
    fontSize: 32,
    color: "#FFFFFF",
    fillColor: "#A10000",
    mirror: [1, -1],
  },
  FRONT: {
    text: language.toLowerCase().includes("en") ? "FRONT" : "前",
    fontSize: 32,
    color: "#FFFFFF",
    fillColor: "#0000FF",
    mirror: [1, -1],
  },
  BACK: {
    text: language.toLowerCase().includes("en") ? "BACK" : "后",
    fontSize: 32,
    color: "#FFFFFF",
    fillColor: "#0000A1",
    mirror: [0, 0],
  },
};

const cameraSpecialPos = {
  DEFAULT: [cameraPosX, cameraPosY, cameraPosZ],
  BACK: [0, 0, -cameraPosZ],
  "BACK-BOTTOM": [0, -cameraPosY, -cameraPosZ],
  "BACK-BOTTOM-LEFT": [-cameraPosX, -cameraPosY, -cameraPosZ],
  "BACK-BOTTOM-RIGHT": [cameraPosX, -cameraPosY, -cameraPosZ],
  "BACK-LEFT": [-cameraPosX, 0, -cameraPosZ],
  "BACK-RIGHT": [cameraPosX, 0, -cameraPosZ],
  "BACK-TOP": [0, cameraPosY, -cameraPosZ],
  "BACK-TOP-LEFT": [-cameraPosX, cameraPosY, -cameraPosZ],
  "BACK-TOP-RIGHT": [cameraPosX, cameraPosY, -cameraPosZ],
  BOTTOM: [0, -cameraPosY, 0],
  "BOTTOM-LEFT": [-cameraPosX, -cameraPosY, 0],
  "BOTTOM-RIGHT": [cameraPosX, -cameraPosY, 0],
  FRONT: [0, 0, cameraPosZ],
  "FRONT-BOTTOM": [0, -cameraPosY, cameraPosZ],
  "FRONT-BOTTOM-LEFT": [-cameraPosX, -cameraPosY, cameraPosZ],
  "FRONT-BOTTOM-RIGHT": [cameraPosX, -cameraPosY, cameraPosZ],
  "FRONT-LEFT": [-cameraPosX, 0, cameraPosZ],
  "FRONT-RIGHT": [cameraPosX, 0, cameraPosZ],
  "FRONT-TOP": [0, cameraPosY, cameraPosZ],
  "FRONT-TOP-LEFT": [-cameraPosX, cameraPosY, cameraPosZ],
  "FRONT-TOP-RIGHT": [cameraPosX, cameraPosY, cameraPosZ],
  LEFT: [-cameraPosX, 0, 0],
  RIGHT: [cameraPosX, 0, 0],
  TOP: [0, cameraPosY, 0],
  "TOP-LEFT": [-cameraPosX, cameraPosY, 0],
  "TOP-RIGHT": [cameraPosX, cameraPosY, 0],

  EAST: [cameraPosX, 0, 0],
  NORTH: [0, 0, -cameraPosZ],
  "NORTH-EAST": [cameraPosX, 0, cameraPosZ],
  "NORTH-WEST": [-cameraPosX, 0, cameraPosZ],
  SOUTH: [0, 0, cameraPosZ],
  "SOUTH-EAST": [cameraPosX, 0, -cameraPosZ],
  "SOUTH-WEST": [-cameraPosX, 0, -cameraPosZ],
  WEST: [-cameraPosX, 0, 0],
};

const emit = defineEmits(["cameraChange"]);

let Tracker = new ResourceTracker();

onMounted(() => {
  initThree();
});

onUnmounted(() => {
  disposeThree();
});

let mouse = new THREE.Vector2();
const onMouseClick = (event) => {
  // console.log("event", event);
  if (event.type === "mouseup" && raycaster) {
    mouse.x = (event.offsetX / CLIENT_WINDOW_WIDTH) * 2 - 1;
    mouse.y = -(event.offsetY / CLIENT_WINDOW_HEIGHT) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    // console.log("commining...", mouse, cubeModel, CLIENT_WINDOW_WIDTH, CLIENT_WINDOW_HEIGHT);
    let targetIntersects = raycaster.intersectObjects(cubeModel.children, false);
    // console.log("targetIntersects", targetIntersects);
    for (let i = 0; i < targetIntersects.length; i++) {
      const name = targetIntersects[i].object.name || "";
      console.log("target", name);
      setCameraPosition(name);
      break;
    }

    targetIntersects = raycaster.intersectObjects(snweModel.children, false);
    // console.log("targetIntersects", targetIntersects);
    for (let i = 0; i < targetIntersects.length; i++) {
      const name = targetIntersects[i].object.name || "";
      console.log("snweModel", name);
      setCameraPosition(name);
      break;
    }
  }
};

function initRenderer() {
  domParentEl = document.getElementById("rj-cub-nav-box");

  CLIENT_WINDOW_WIDTH = domParentEl.clientWidth;
  CLIENT_WINDOW_HEIGHT = domParentEl.clientHeight;
  cameraAspect = CLIENT_WINDOW_WIDTH / CLIENT_WINDOW_HEIGHT;

  console.log("cube width", domParentEl.offsetWidth, CLIENT_WINDOW_WIDTH, CLIENT_WINDOW_HEIGHT);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(CLIENT_WINDOW_WIDTH, CLIENT_WINDOW_HEIGHT);
  renderer.outputEncoding = THREE.sRGBEncoding;

  renderer.gammaOutput = true;
  renderer.gammaFactor = 2.2;

  canvas = renderer.domElement;

  domParentEl.appendChild(canvas);

  canvas.addEventListener("mousedown", (event) => {
    isDragging = false;
    clickTimeout = setTimeout(() => {
      isDragging = true;
    }, 200);
  });

  canvas.addEventListener("mousemove", () => {
    isDragging = true;
  });

  canvas.addEventListener("mouseup", (event) => {
    clearTimeout(clickTimeout);

    if (!isDragging) {
      onMouseClick(event);
    }
  });
}

function initOrthCamera() {
  camera = new THREE.OrthographicCamera(cameraLeft, cameraRight, cameraTop, cameraBottom, cameraNear, cameraFar);
  camera.position.set(cameraPosX, cameraPosY, cameraPosZ);
  camera.lookAt(cameraLookatX, cameraLookatY, cameraLookatZ);
}

function initPerspectiveCamera() {
  camera = new THREE.PerspectiveCamera(cameraFov, cameraAspect, cameraNear, cameraFar);
  camera.position.set(cameraPosX, cameraPosY, cameraPosZ);
  camera.lookAt(cameraLookatX, cameraLookatY, cameraLookatZ);
}

function initScene() {
  scene = new THREE.Scene();
  // scene.background = new THREE.Color(0xffffff);
  // scene.fog = new THREE.Fog( 0x020924, 200, 1000 );
}

function setCameraPosition(positionStr) {
  let pos = cameraSpecialPos[positionStr];
  if (!pos) {
    pos = cameraSpecialPos["DEFAULT"];
  }
  camera.position.set(pos[0], pos[1], pos[2]);
}

function sentCameraPos() {
  const { angleX, angleXDegrees } = getCameraXAngle(camera);
  const { angleY, angleYDegrees } = getCameraYAngle(camera);
  const { angleZ, angleZDegrees } = getCameraZAngle(camera);

  emit("cameraChange", {
    angleX,
    angleY,
    angleZ,
  });
}

function initControls() {
  if (canvas) {
    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    //controls.dampingFactor = 0.25;

    controls.enableZoom = false;

    controls.autoRotate = false;
    // controls.autoRotateSpeed = 2;
    // controls.minDistance = 2;
    // controls.maxDistance = 1000;

    controls.enablePan = false;
    controls.enableRotate = true;
    controls.update();

    // const azAngle = (controls.getAzimuthalAngle() * 180) / Math.PI;
    // const polarangle = (controls.getPolarAngle() * 180) / Math.PI;
    // const dis = controls.getDistance();
    // const pos1 = camera.getWorldPosition(new THREE.Vector3(0, 0, 0));
    // const pos2 = camera.getWorldPosition(new THREE.Vector3(1, 1, 1));

    controls.addEventListener("change", (event) => {
      // console.log("change", event);
      isDragging = true;
      sentCameraPos();
    });

    // controls.addEventListener("start", (a, b, c, d) => {
    //   console.log("start", a, b, c, d);
    // });

    // controls.addEventListener("end", (a, b, c, d) => {
    //   console.log("end", a, b, c, d);
    // });
  } else {
    console.error("请先初始化render");
  }
}

function createTextMaterial(
  textOptioons = {
    text: "",
    fontSize: "",
    color: "",
    fillColor: "",
    mirror: [],
  },
) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const fontCtx = canvas.getContext("2d");
  const textLenth = textOptioons.text.length + 0.5;
  const size = textLenth * textOptioons.fontSize; // 设置 canvas 尺寸
  canvas.width = size;
  canvas.height = size;

  // 设置背景色
  context.fillStyle = textOptioons.fillColor;
  context.fillRect(0, 0, size, size);

  // 设置文本样式
  fontCtx.fillStyle = textOptioons.color; // 文字颜色
  // 位移来做镜像翻转
  const mirror = textOptioons.mirror;
  context.scale(mirror[0], mirror[1]); //左右镜像翻转
  const transX = mirror[0] === 1 ? 0 : mirror[0] * size;
  const transY = mirror[1] === 1 ? 0 : mirror[1] * size;
  context.translate(transX, transY);

  // fontCtx.translate(size / 2, size / 2);
  // fontCtx.rotate((180 * Math.PI) / 180);
  // fontCtx.translate(-size, -size);
  fontCtx.font = `bold ${textOptioons.fontSize}px Arial`; // 字体样式
  fontCtx.textAlign = "center";
  fontCtx.textBaseline = "middle";

  // 绘制文字
  fontCtx.fillText(textOptioons.text, size / 2, size / 2);

  // 使用 canvas 创建纹理
  const texture = new THREE.CanvasTexture(canvas);
  return new THREE.MeshBasicMaterial({ map: texture });
}

function initGltfLoader() {
  gltfLoader = new GLTFLoader();

  gltfLoader.loadAsync("/static/cubeNav.glb").then((gltf) => {
    // @ts-ignore
    gltf.parser = null;
    // gltf.scene.position.y = -2;
    cubeModel = gltf.scene;
    scene.add(gltf.scene);
    Tracker.track(cubeModel);
    console.log("cubeModel", cubeModel);
    for (let i = 0; i < cubeModel.children.length; i++) {
      const mesh = cubeModel.children[i];
      const name = mesh.name;
      const textOpts = cubeModelLabels[name];
      if (textOpts) {
        mesh.material = createTextMaterial(textOpts);
      }
    }
  });

  gltfLoader.loadAsync("/static/snwe.glb").then((gltf) => {
    // @ts-ignore
    gltf.parser = null;
    gltf.scene.position.y = -2;
    snweModel = gltf.scene;
    scene.add(snweModel);
    Tracker.track(snweModel);
  });
}

function render() {
  if (!disposing) {
    controls.update();
    renderer.render(scene, camera);
    frameId = requestAnimationFrame(render);
  }
}

function initThree() {
  try {
    initRenderer();
    initOrthCamera();
    initScene();
    initControls();
    initGltfLoader();

    raycaster = new THREE.Raycaster();

    axisHelper = new THREE.AxesHelper(4);
    scene.add(axisHelper);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    lights.push(ambientLight);
    scene.add(ambientLight);

    scene.add(new THREE.DirectionalLight(0xffffff, 1.0));

    // ground
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }),
    );
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);

    const grid = new THREE.GridHelper(10, 10, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);

    render();
  } catch (error) {
    console.log("cube nav errors", error);
  }
}

function disposeThree() {
  disposing = true;
  if (frameId) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }
  // 使用完毕后释放资源
  Tracker.dispose();
}
</script>

<style lang="scss" scoped>
.cub_nav_container {
  width: 100%;
  height: 100%;
}
</style>
