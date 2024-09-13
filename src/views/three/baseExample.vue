<template>
  <div id="rj-cub-main-box" class="cub_main_container"> </div>
  <div class="nav_box">
    <CubeControls @cameraChange="cubeCameraChangeHandle" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, getCurrentInstance } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import CubeControls from "./CubeControls.vue";

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
let model = null;

let raycaster = null;

let CLIENT_WINDOW_WIDTH = 10;
let CLIENT_WINDOW_HEIGHT = 10;

onMounted(() => {
  initThree();
});

onUnmounted(() => {
  disposeThree();
});


function cubeCameraChangeHandle(angels) {
  const cameraPosition = camera.position;
  const distanceXYZ = Math.sqrt(cameraPosition.x ** 2 + cameraPosition.y ** 2 + cameraPosition.z ** 2);

  const x = distanceXYZ * Math.sin(angels.angleX);
  const y = distanceXYZ * Math.sin(angels.angleY);
  const z = distanceXYZ * Math.sin(angels.angleZ);
  camera.position.set(x, y, z);
}

function initRenderer() {
  domParentEl = document.getElementById("rj-cub-main-box");

  CLIENT_WINDOW_WIDTH = domParentEl.clientWidth;
  CLIENT_WINDOW_HEIGHT = domParentEl.clientHeight;

  console.log("screnn width", CLIENT_WINDOW_WIDTH, CLIENT_WINDOW_HEIGHT);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(CLIENT_WINDOW_WIDTH, CLIENT_WINDOW_HEIGHT);
  renderer.outputEncoding = THREE.sRGBEncoding;

  renderer.gammaOutput = true;
  renderer.gammaFactor = 2.2;

  canvas = renderer.domElement;

  domParentEl.appendChild(renderer.domElement);
}

function initOrthCamera() {
  camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 10);
  camera.position.set(3, 3, 3);
  camera.lookAt(0, 0, 0);
}

function initPerspectiveCamera() {
  const aspect = CLIENT_WINDOW_WIDTH / CLIENT_WINDOW_HEIGHT;
  camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
  camera.position.set(5, 5, 5);
  camera.lookAt(2, 2, 0);
}

function initScene() {
  scene = new THREE.Scene();
  // scene.background = new THREE.Color(0xffffff);
  // scene.fog = new THREE.Fog( 0x020924, 200, 1000 );
}

function initControls() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  //controls.dampingFactor = 0.25;

  controls.enableZoom = true;

  controls.autoRotate = false;
  // controls.autoRotateSpeed = 2;
  // controls.minDistance = 2;
  // controls.maxDistance = 1000;

  controls.enablePan = true;
  controls.enableRotate = true;
  controls.update();
}

function initGltfLoader() {
  gltfLoader = new GLTFLoader();
}

function initThree() {
  try {
    initRenderer();
    // initOrthCamera();
    initPerspectiveCamera();
    initScene();
    initControls();
    initGltfLoader();

    raycaster = new THREE.Raycaster();

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

    gltfLoader
      .loadAsync("https://dtmall-tel.alicdn.com/edgeComputingConfig/upload_models/1591673169101/RobotExpressive.glb")
      .then((gltf) => {
        // gltfLoader.loadAsync("/static/cubeNav.glb").then((gltf) => {
        // @ts-ignore
        gltf.parser = null;
        gltf.scene.position.y = 1;
        gltf.scene.position.z = 1;
        model = gltf.scene;
        scene.add(gltf.scene);
      });

    const axisHelper = new THREE.AxesHelper(4);
    scene.add(axisHelper);

    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    scene.add(new THREE.DirectionalLight(0xffffff, 1.0));

    const render = () => {
      if (!disposing) {
        controls.update();
        renderer.render(scene, camera);
        frameId = requestAnimationFrame(render);
      }
    };
    render();
  } catch (error) {
    console.log("fuck", error);
  }
}

function disposeThree() {
  disposing = true;
  if (frameId) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }
  // 使用完毕后释放资源
  // THREE.PLATFORM.dispose();
}
</script>

<style lang="scss" scoped>
.cub_main_container {
  position: relative;
  width: 100vw;
  height: 100vh;
}

.nav_box {
  position: fixed;
  width: 300px;
  height: 300px;
  top: 0;
  right: 0;
  z-index: 100;
}
</style>
