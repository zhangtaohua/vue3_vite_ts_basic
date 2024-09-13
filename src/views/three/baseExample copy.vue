<template>
  <div id="rj-cub-nav" class="cub_nav_container"></div>
</template>

<script setup>
import { onMounted, onUnmounted, getCurrentInstance } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const gl = {
  disposing: false,
  frameId: null,
  canvas: null,
  platform: null,
  camera: null,
  scene: null,
  controls: null,
  gltfLoader: null,
  lights: [],
  models: [],
};

let clock, mixer, actions, activeAction, previousAction, model, face, raycaster;
const api = { state: "Walking" };

let SCREEN_WIDTH = 500;
let SCREEN_HEIGHT = 600;

onMounted(() => {
  initThree();
});

onUnmounted(() => {
  disposeThree();
});

function initThree() {
  try {
    gl.canvas = document.getElementById("webgl_box");
    console.log("canvas", gl.canvas);

    gl.renderer = new THREE.WebGLRenderer({ canvas: gl.canvas, antialias: true, alpha: true });

    gl.camera = new THREE.PerspectiveCamera(75, gl.canvas.width / gl.canvas.height, 0.1, 10000);
    // SCREEN_WIDTH = gl.canvas.clientWidth;
    // SCREEN_HEIGHT = gl.canvas.clientHeight;
    console.log("screnn", SCREEN_WIDTH, SCREEN_HEIGHT, gl);
    gl.scene = new THREE.Scene();
    // gl.scene.background = new THREE.Color("black");
    gl.gltfLoader = new GLTFLoader();
    gl.controls = new OrbitControls(gl.camera, gl.canvas);
    gl.controls.enableDamping = true;
    gl.controls.update();

    raycaster = new THREE.Raycaster();

    // ground
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 2000),
      new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }),
    );
    mesh.rotation.x = -Math.PI / 2;
    gl.scene.add(mesh);
    const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    gl.scene.add(grid);

    gl.gltfLoader.loadAsync("/static/cubeNav.glb").then((gltf) => {
      // @ts-ignore
      gltf.parser = null;
      gltf.scene.position.y = -2;
      model = gltf.scene;
      gl.scene.add(gltf.scene);
      console.log("glb", gltf);
      createGUI(model, gltf.animations);
    });

    const axisHelper = new THREE.AxesHelper(4);
    gl.scene.add(axisHelper);

    gl.camera.position.x = 10;
    gl.camera.position.y = 10;
    gl.camera.position.z = 10;
    gl.renderer.outputEncoding = THREE.sRGBEncoding;
    gl.scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    gl.scene.add(new THREE.DirectionalLight(0xffffff, 1.0));
    gl.renderer.setSize(gl.canvas.width, gl.canvas.height);
    gl.renderer.setPixelRatio(window.devicePixelRatio);
    // renderer.setPixelRatio(wx.getSystemInfoSync().pixelRatio);
    gl.renderer.gammaOutput = true;
    gl.renderer.gammaFactor = 2.2;

    clock = new THREE.Clock();

    const render = () => {
      if (!gl.disposing) {
        const dt = clock.getDelta();
        if (mixer) {
          mixer.update(dt);
        }
        gl.controls.update();
        gl.renderer.render(gl.scene, gl.camera);
        gl.frameId = requestAnimationFrame(render);
      }
    };
    render();
  } catch (error) {
    console.log("fuck", error);
  }
}

function createGUI(model, animations) {
  const states = ["Idle", "Walking", "Running", "Dance", "Death", "Sitting", "Standing"];
  const emotes = ["Jump", "Yes", "No", "Wave", "Punch", "ThumbsUp"];
  mixer = new THREE.AnimationMixer(model);
  actions = {};
  for (var i = 0; i < animations.length; i++) {
    var clip = animations[i];
    var action = mixer.clipAction(clip);
    actions[clip.name] = action;
    if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {
      action.clampWhenFinished = true;
      action.loop = THREE.LoopOnce;
    }
  }

  // expressions
  face = model.getObjectByName("Head_2");
  activeAction = actions["Walking"];
  activeAction.play();
}

// function fadeToAction(name, duration) {
//   previousAction = activeAction;
//   activeAction = actions[name];
//   if (previousAction !== activeAction) {
//     previousAction.fadeOut(duration);
//   }
//   activeAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(duration).play();
// }

// function animate() {
//   var dt = clock.getDelta();
//   if (mixer) mixer.update(dt);
//   canvas.requestAnimationFrame(animate);
//   controls.update();
//   renderer.render(scene, camera);
// }

function disposeThree() {
  gl.disposing = true;
  if (gl.frameId) {
    THREE.$cancelAnimationFrame(gl.frameId);
    gl.frameId = null;
  }
  // 使用完毕后释放资源
  THREE.PLATFORM.dispose();
}

let mouse = new THREE.Vector2();
function onTX(event) {
  // console.log("event", event);
  if (event.type === "mousedown" && raycaster) {
    mouse.x = (event.clientX / SCREEN_WIDTH) * 2 - 1;
    mouse.y = -(event.clientY / SCREEN_HEIGHT) * 2 + 1;
    raycaster.setFromCamera(mouse, gl.camera);
    // console.log("commining...", mouse, model, SCREEN_WIDTH, SCREEN_HEIGHT);
    let targetIntersects = raycaster.intersectObjects(model.children, false);
    // console.log("targetIntersects", targetIntersects);
    for (let i = 0; i < targetIntersects.length; i++) {
      const name = targetIntersects[i].object.name || "";
      console.log("target", name);
    }
  }
}
</script>

<style lang="scss" scoped>
.header_menu {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  width: 100vw;
  height: 3rem;
  background: rgb(255 255 0 / 20%);
}

#webgl_box {
  width: 100%;
  height: 100%;
}
</style>
