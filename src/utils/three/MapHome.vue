<template>
  <div id="ThreeBaseContainer" @click="onMouseClick">
    <div class="mask_left"></div>
    <div class="mask_right"></div>
    <div v-if="targetPannelControl.isShow" class="row_nw_center_center target_box" @click.stop.prevent="() => {}">
      <MapTargetPanel
        :id="targetPannelControl.id"
        :tt="targetPannelControl.tt"
        :destory="targetPannelControl.destory"
        :vNodeData="targetPannelControl.vNodeData"
      />
    </div>

    <div v-if="satellitePannel.isShow" class="row_nw_center_center satellite_pannel_box" @click.stop.prevent="() => {}">
      <MapSatellitePanel
        :id="satellitePannel.id"
        :tt="satellitePannel.tt"
        :destory="satellitePannel.destory"
        :vNodeData="satellitePannel.vNodeData"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, onMounted, onUnmounted } from "vue";
import * as THREE from "./three.module.min.js";
import { OrbitControls } from "./jsm/controls/OrbitControls.js";
import { DRACOLoader } from "./jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "./jsm/loaders/GLTFLoader.js";
import { FontLoader } from "./jsm/loaders/FontLoader.js";
import { TextGeometry } from "./jsm/geometries/TextGeometry.js";

import { useI18n } from "vue-i18n";

import MapTargetPanel from "./MapTargetPanel.vue";
import MapSatellitePanel from "./MapSatellitePanel.vue";

import { getSateRtOrbitRequest, getTarget, getReveiverStationsRequest, getTleByCatalogNumber } from "~/api/orbit";

export default defineComponent({
  name: "ThreeMapHome",
  components: {
    MapTargetPanel,
    MapSatellitePanel,
  },
  setup() {
    useHead({
      script: [{ src: "/jslib/satellite.min.js" }],
    });

    const { t } = useI18n();
    const targetPannelControl = reactive({
      isShow: false,
      id: "targetId",
      tt: t,
      destory: () => {},
      vNodeData: {},
    });

    const closeTargetPannel = () => {
      targetPannelControl.isShow = false;
    };
    targetPannelControl.destory = closeTargetPannel;

    const satellitePannel = reactive({
      isShow: false,
      id: "FS-1",
      tt: t,
      destory: () => {},
      vNodeData: {},
    });

    let currentSatellite = "";
    let updateSatelliteTimer = null;

    const clearUpdateSatelliteTimer = () => {
      if (updateSatelliteTimer) {
        clearInterval(updateSatelliteTimer);
        updateSatelliteTimer = null;
      }
    };

    const closeSatellitePannel = () => {
      satellitePannel.isShow = false;
      currentSatellite = "";
      clearUpdateSatelliteTimer();
    };
    satellitePannel.destory = closeSatellitePannel;

    let initIntervalTimer: any = null;
    let initFlag = false;

    const FEATURE_ORBIT = "featureOrbit";
    const EXPIRED_ORBIT = "expiredOrbit";
    const SATELLITE = "satellite";
    const SATELLITEGROUP = "satellitegroup";
    const RECEIVER = "receiver";
    const SEPARATE_FLAG = "___";
    const TARGET = "target";

    let SCREEN_WIDTH = 10;
    let SCREEN_HEIGHT = 10;
    let aspect = 1;

    let renderer: any = null;
    let camera: any = null;
    let scene: any = null;
    let controls: any = null;

    let stars: any = null;

    const radius = 5;
    const earthRadius = 6357;

    const uniforms2 = {
      u_time: { value: 0.0 },
    };

    const orbitsMultiplier = 0.5;

    // 49816 有问题 要删除了才能运行
    const satelliteObj = {
      "FS-1": {
        belong: t("gis.fsgroup"),
        system: "X",
        quality: 95,
        type: t("gis.sunSync"),
        coreType: t("gis.optical"),
        longitude: "0",
        latitude: "0",
        altitude: "100",
        launchTime: "2021-04-27 11:20:15",
        semiMajorAxis: "6875281.11307",
        name: "FS-1",
        cname: t("gis.fs1"),
        catalogNumber: 48248,
        currentStep: 0,
        group: null,
        currentTle1: "",
        currentTle2: "",
        tle1: "1 48248U 21033A   23186.01782116  .00015399  00000+0  46284-3 0  9994",
        tle2: "2 48248  97.3167 258.0705 0007317 337.2116  22.8802 15.34469003121729",
      },
      "QL-4": {
        belong: t("gis.qlgroup"),
        system: "X",
        quality: 95,
        type: t("gis.sunSync"),
        coreType: t("gis.optical"),
        longitude: "0",
        latitude: "0",
        altitude: "100",
        launchTime: "2021-04-27 11:20:15",
        semiMajorAxis: "6875281.11307",
        name: "QL-4",
        cname: t("gis.ql4"),
        catalogNumber: 48250,
        currentStep: 0,
        group: null,
        currentTle1: "",
        currentTle2: "",
        tle1: "1 48250U 21033C   23186.03111480  .00030307  00000+0  68550-3 0  9995",
        tle2: "2 48250  97.3131 260.4665 0005488 321.4670  38.6186 15.43089270121883",
      },
      "GB-SAR-1": {
        belong: t("gis.qlgroup"),
        system: "X",
        quality: 195,
        type: t("gis.sunSync"),
        coreType: t("gis.sar"),
        longitude: "0",
        latitude: "0",
        altitude: "100",
        launchTime: "2021-04-27 11:20:15",
        semiMajorAxis: "6872009.8982",
        name: "GB-SAR-1",
        cname: t("gis.jzj_s1"),
        catalogNumber: 48251,
        currentStep: 0,
        group: null,
        currentTle1: "",
        currentTle2: "",
        tle1: "1 48251U 21033D   23185.99209335  .00020227  00000+0  72079-3 0  9998",
        tle2: "2 48251  97.3174 259.5856 0015493  66.4588 293.8278 15.28836488121817",
      },
      "JZJ-1": {
        belong: t("gis.gbgroup"),
        system: "X",
        quality: 195,
        type: t("gis.sunSync"),
        coreType: t("gis.optical"),
        longitude: "0",
        latitude: "0",
        altitude: "100",
        launchTime: "2021-04-27 11:20:15.1230",
        semiMajorAxis: "6872009.8982",
        name: "JZJ-1",
        cname: t("gis.jzj_1"),
        catalogNumber: 48257,
        currentStep: 0,
        group: null,
        currentTle1: "",
        currentTle2: "",
        tle1: "1 48257U 21033K   23186.03136664  .00029119  00000+0  35459-3 0  9994",
        tle2: "2 48257  97.2442 268.0779 0071854 337.3009  22.5073 15.57301240122917",
      },
      "JZJ-2": {
        belong: t("gis.gbgroup"),
        system: "X",
        quality: 195,
        type: t("gis.sunSync"),
        coreType: t("gis.optical"),
        longitude: "0",
        latitude: "0",
        altitude: "100",
        launchTime: "2021-04-27 11:20:15",
        semiMajorAxis: "6872009.8982",
        name: "JZJ-2",
        cname: t("gis.jzj_2"),
        catalogNumber: 49315,
        currentStep: 0,
        group: null,
        currentTle1: "",
        currentTle2: "",
        tle1: "1 49315U 21091A   23186.04261382  .00029733  00000+0  76703-3 0  9990",
        tle2: "2 49315  97.4530  19.8010 0011301 224.2703 135.7640 15.39060246 95799",
      },
      // "JZJ-5": {
      //     "belong": t("gis.gbgroup"),
      //     "system": "X",
      //     "quality": 195,
      //     "type": t("gis.sunSync"),
      //      "coreType": t("gis.optical"),
      //     "longitude": "0",
      //     "latitude": "0",
      //     "altitude": "100",
      //     "launchTime": "2021-04-27 11:20:15",
      //     "semiMajorAxis": "6872009.8982",
      //     "name": "JZJ-5",
      //     "cname": t("gis.jzj_5"),
      //     "catalogNumber": 49816,
      //     "currentStep": 0,
      //     "group": null,
      //     "currentTle1": "",
      //     "currentTle2": "",
      //     "tle1": "1 49816U 21117E   23135.01521950  .31168889  25417-5  46530-3 0  9996",
      //     "tle2": "2 49816  97.3271 221.5993 0016024 262.7141 178.5930 16.47551949 80581"
      // },
      "XR-7": {
        belong: t("gis.xrgroup"),
        system: "X",
        quality: 195,
        type: t("gis.sunSync"),
        coreType: t("gis.optical"),
        longitude: "0",
        latitude: "0",
        altitude: "100",
        launchTime: "2021-04-27 11:20:15",
        semiMajorAxis: "6872009.8982",
        name: "XR-7",
        cname: t("gis.xr7"),
        catalogNumber: 51824,
        currentStep: 0,
        group: null,
        currentTle1: "",
        currentTle2: "",
        tle1: "1 51824U 22019A   23185.99633048  .00006876  00000+0  37104-3 0  9999",
        tle2: "2 51824  97.4728 258.0480 0018121  19.8441 340.3492 15.14922810 74432",
      },
      JZJ_1_05: {
        belong: t("gis.gbgroup"),
        system: "X",
        quality: 195,
        type: t("gis.sunSync"),
        coreType: t("gis.optical"),
        longitude: "0",
        latitude: "0",
        altitude: "100",
        launchTime: "2022-12-09 14:35:15",
        semiMajorAxis: "6872009.8982",
        name: "JZJ_1_05",
        cname: t("gis.jzj_1_5"),
        catalogNumber: 54682,
        currentStep: 0,
        group: null,
        currentTle1: "",
        currentTle2: "",
        tle1: "1 54682U 22167A   23186.02744172  .00010641  00000+0  55910-3 0  9994",
        tle2: "2 54682  97.5600 323.5826 0011260 268.8262  91.1681 15.15824845 31404",
      },
      JZJ_1_06: {
        belong: t("gis.gbgroup"),
        system: "X",
        quality: 195,
        type: t("gis.sunSync"),
        coreType: t("gis.optical"),
        longitude: "0",
        latitude: "0",
        altitude: "100",
        launchTime: "2022-12-09 14:35:15",
        semiMajorAxis: "6872009.8982",
        name: "JZJ_1_06",
        cname: t("gis.jzj_1_6"),
        catalogNumber: 54693,
        currentStep: 0,
        group: null,
        currentTle1: "",
        currentTle2: "",
        tle1: "1 54693U 22167M   23186.03690441  .00012985  00000+0  66474-3 0  9996",
        tle2: "2 54693  97.5658 323.8805 0011933 268.8042  91.1823 15.16683862 31379",
      },
      "QL-3": {
        belong: t("gis.qlgroup"),
        system: "X",
        quality: 195,
        type: t("gis.sunSync"),
        coreType: t("gis.optical"),
        longitude: "0",
        latitude: "0",
        altitude: "100",
        launchTime: "2023-01-15 11:20:15",
        semiMajorAxis: "6866.243",
        name: "QL-3",
        cname: t("gis.ql3"),
        catalogNumber: 55257,
        currentStep: 0,
        group: null,
        currentTle1: "",
        currentTle2: "",
        tle1: "1 55257U 23007K   23185.99171623  .00010010  00000+0  34572-3 0  9998",
        tle2: "2 55257  97.3574 258.3925 0008437  45.2896 314.9030 15.30104561 26083",
      },
      "QL-2": {
        belong: t("gis.qlgroup"),
        system: "X",
        quality: 195,
        type: t("gis.sunSync"),
        coreType: t("gis.optical"),
        longitude: "0",
        latitude: "0",
        altitude: "100",
        launchTime: "2023-01-15 11:20:15",
        semiMajorAxis: "6865.504",
        name: "QL-2",
        cname: t("gis.ql2"),
        catalogNumber: 55258,
        currentStep: 0,
        group: null,
        currentTle1: "",
        currentTle2: "",
        tle1: "1 55258U 23007L   23186.03089480  .00014086  00000+0  46239-3 0  9994",
        tle2: "2 55258  97.3586 258.6731 0007727  46.3770 313.8112 15.31669790 26102",
      },
    };

    const companyDistribution = {
      beijing: {
        name: t("common.beijing"),
        addresses: t("foot.addr.bj"),
        value: [116.351748, 39.952117],
      },
      shenzhen: {
        name: t("common.shenzhen"),
        addresses: t("foot.addr.sz1"),
        // value: [113.95321,22.559303],
        // 以下地址是故意调整的
        value: [114.95321, 23],
      },
      shenzhen2: {
        name: t("common.shenzhen"),
        addresses: t("foot.addr.sz2"),
        value: [113.94924, 22.538721],
      },
      shanghai: {
        name: t("common.shanghai"),
        addresses: t("foot.addr.sh"),
        value: [121.541446, 31.21825],
      },
      jinan: {
        name: t("common.jinan"),
        addresses: t("foot.addr.jn"),
        value: [117.230868, 36.675797],
      },
    };

    // 接收站
    let receiverData: any = [];

    const WaveMeshArr: any = [];

    let targetOriginData: any = null;

    let earthGroup = new THREE.Group();

    let globeTextureLoader = new THREE.TextureLoader();
    let planGeometry = new THREE.PlaneGeometry(1, 1); //默认在XOY平面上

    let font: any = null;
    let fontName = "helvetiker"; // helvetiker, optimer, gentilis, droid sans, droid serif
    let fontWeight = "regular"; // regular bold

    let raycaster = null;
    let mouse = new THREE.Vector2();
    let containerDom = null;

    let allSatelliteGroup = new THREE.Group();

    // 更新 TLE 数据 但会被当成爬虫了,所以没有用了.
    function getTLEData() {
      const objKeys = Object.keys(satelliteObj);
      for (const key of objKeys) {
        const catalogNumber = satelliteObj[key]["catalogNumber"];
        getTleByCatalogNumber(catalogNumber)
          .then((res: any) => {
            // console.log("getTLEData ok", res)
            const tlestring = res.data.value;
            const tleArr = tlestring.split("\r\n");
            if (tleArr.length > 3) {
              satelliteObj[key]["currentTle1"] = tleArr[0];
              satelliteObj[key]["currentTle2"] = tleArr[1];
            }
          })
          .catch((err: any) => {
            // console.log("getTLEData error", err);
            satelliteObj[key]["currentTle1"] = "";
            satelliteObj[key]["currentTle2"] = "";
          });
      }
    }
    // getTLEData();

    // 获取接收站
    function getReveiverStationsData() {
      getReveiverStationsRequest()
        .then((res: any) => {
          // console.log("getReveiverStationsData ok", res)
          if (res.data.value.code === 0) {
            receiverData = res.data.value.data;
            addReceiver(receiverData);
          }
        })
        .catch((err: any) => {
          console.log("getReveiverStationsData error", err);
        });
    }

    //获取目标点数据
    function getTargetData() {
      getTarget()
        .then((res: any) => {
          // console.log("getTargetData ok", res);
          if (res.data.value.code === 0) {
            // 删除 旧的点
            // 增加 新的点
            let datas = res.data.value.data;
            if (datas.length) {
              datas = datas.map((data: any, index: number) => {
                return {
                  ...data,
                  csId: `${TARGET}${SEPARATE_FLAG}${index}`,
                  num: data.expectSat,
                  satellite: data.expectSatCname,
                  location: [data.long, data.lat],
                  time: data.expectedIamgingTime,
                };
              });
              targetOriginData = datas;
              initTargetPoint(datas);
            }
          }
        })
        .catch((err: any) => {
          console.log("getTargetData error", err);
        });
    }

    // threejs自带的经纬度转换
    function lglt2xyz(lng: number, lat: number) {
      const theta = (90 + lng) * (Math.PI / 180);
      const phi = (90 - lat) * (Math.PI / 180);
      return new THREE.Vector3().setFromSpherical(new THREE.Spherical(radius, phi, theta));
    }

    // 计算位置
    function lon2xyz(R: number, longitude: number, latitude: number) {
      let lon = (longitude * Math.PI) / 180; //转弧度值
      let lat = (latitude * Math.PI) / 180; //转弧度值
      lon = -lon; // three.js坐标系z坐标轴对应经度-90度，而不是90度
      // 经纬度坐标转球面坐标计算公式
      let x = R * Math.cos(lat) * Math.cos(lon);
      let y = R * Math.sin(lat);
      let z = R * Math.cos(lat) * Math.sin(lon);
      // 返回球面坐标
      return {
        x: x,
        y: y,
        z: z,
      };
    }

    // 地球
    function initEarth() {
      globeTextureLoader.load("/model/earth/imgs/diqiu2/earth2.jpg", function (texture: any) {
        const globeGgeometry = new THREE.SphereGeometry(radius, 100, 100);
        const globeMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          side: THREE.DoubleSide,
        });
        let globeMesh = new THREE.Mesh(globeGgeometry, globeMaterial);
        earthGroup.rotation.set(0, 0, 0);
        earthGroup.add(globeMesh);
        scene.add(earthGroup);
      });
    }

    function initEarthSprite() {
      const texture = globeTextureLoader.load("/model/earth/imgs/diqiu2/earth_aperture.png");
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(radius * 3, radius * 3, 1);
      earthGroup.add(sprite);
    }

    function initMap(chinaJson: any) {
      const map = new THREE.Object3D();
      chinaJson.features.forEach((elem) => {
        const province = new THREE.Object3D();
        const coordinates = elem.geometry.coordinates;
        coordinates.forEach((multiPolygon: any) => {
          multiPolygon.forEach((polygon: any) => {
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0x27a6ff }); //0x3BFA9E
            const positions = [];
            const linGeometry = new THREE.BufferGeometry();
            for (let i = 0; i < polygon.length; i++) {
              const pos = lglt2xyz(polygon[i][0], polygon[i][1]);
              positions.push(pos.x, pos.y, pos.z);
            }
            linGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
            const line = new THREE.Line(linGeometry, lineMaterial);
            province.add(line);
          });
        });
        map.add(province);
      });
      earthGroup.add(map);
    }

    function initLineMaterial(setting: any) {
      const number = setting ? Number(setting.number) || 1.0 : 1.0;
      const speed = setting ? Number(setting.speed) || 1.0 : 1.0;
      const length = setting ? Number(setting.length) || 0.5 : 0.5;
      const size = setting ? Number(setting.size) || 3.0 : 3.0;
      const color = setting ? setting.color || new THREE.Vector3(0, 1, 1) : new THREE.Vector3(0, 1, 1);
      const singleUniforms = {
        u_time: uniforms2.u_time,
        number: { type: "f", value: number },
        speed: { type: "f", value: speed },
        length: { type: "f", value: length },
        size: { type: "f", value: size },
        color: { type: "v3", value: color },
      };
      const lineMaterial = new THREE.ShaderMaterial({
        uniforms: singleUniforms,
        vertexShader: `
          varying vec2 vUv;
          attribute float percent;
          uniform float u_time;
          uniform float number;
          uniform float speed;
          uniform float length;
          varying float opacity;
          uniform float size;
          void main()
          {
              vUv = uv;
              vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
              float l = clamp(1.0-length,0.0,1.0);
              gl_PointSize = clamp(fract(percent*number + l - u_time*number*speed)-l ,0.0,1.) * size * (1./length);
              opacity = gl_PointSize/size;
              gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          #ifdef GL_ES
          precision mediump float;
          #endif
          varying float opacity;
          uniform vec3 color;
          void main(){
              if(opacity <=0.2){
                  discard;
              }
              gl_FragColor = vec4(color,1.0);
          }
        `,
        transparent: true,
        //blending:THREE.AdditiveBlending,
      });
      return lineMaterial;
    }

    function initFlyLine(curve: any, matSetting: any, pointsNumber: any) {
      const points = curve.getPoints(pointsNumber);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const length = points.length;
      let percents = new Float32Array(length);
      for (let i = 0; i < points.length; i += 1) {
        percents[i] = i / length;
      }
      geometry.setAttribute("percent", new THREE.BufferAttribute(percents, 1));
      const lineMaterial = initLineMaterial(matSetting);
      let flyLine = new THREE.Points(geometry, lineMaterial);
      return flyLine;
    }

    function outLineMap(json: any) {
      const map = new THREE.Object3D();
      json.features.forEach((elem) => {
        // 新建一个省份容器：用来存放省份对应的模型和轮廓线
        const province = new THREE.Object3D();
        const coordinates = elem.geometry.coordinates;
        coordinates.forEach((multiPolygon) => {
          multiPolygon.forEach((polygon) => {
            // 这里的坐标要做2次使用：1次用来构建模型，1次用来构建轮廓线
            if (polygon.length > 200) {
              const v3ps = [];
              for (let i = 0; i < polygon.length; i++) {
                const pos = lglt2xyz(polygon[i][0], polygon[i][1]);
                v3ps.push(pos);
              }
              const curve = new THREE.CatmullRomCurve3(v3ps, false /*是否闭合*/);
              const color = new THREE.Vector3(0.5999758518718452, 0.7798940272761521, 0.6181903838257632);
              // const color = new THREE.Vector3( 1, 0.0, 0.0 );
              const flyLine = initFlyLine(
                curve,
                {
                  speed: 0.4,
                  // color: randomVec3Color(),
                  color: color,
                  number: 3, //同时跑动的流光数量
                  length: 0.2, //流光线条长度
                  size: 3, //粗细
                },
                5000,
              );
              province.add(flyLine);
            }
          });
        });
        map.add(province);
      });
      earthGroup.add(map);
    }

    // 中国描边高亮
    function initGeoJson() {
      const loader = new THREE.FileLoader();
      loader.load("/model/earth/models/json/geoJson/china.json", function (data: any) {
        const jsonData = JSON.parse(data);
        initMap(jsonData);
      });
      loader.load("/model/earth/models/json/geoJson/china-outline.json", function (data: any) {
        const jsonData = JSON.parse(data);
        outLineMap(jsonData);
      });
    }

    // 星空点点
    function initPoints() {
      let texture = new THREE.TextureLoader().load("/model/earth/imgs/diqiu2/gradient.png");
      const positions = [];
      const colors = [];
      const geometry = new THREE.BufferGeometry();

      for (let i = 0; i < 10000; i++) {
        let vertex = new THREE.Vector3();
        vertex.x = Math.random() * 2 - 1;
        vertex.y = Math.random() * 2 - 1;
        vertex.z = Math.random() * 2 - 1;
        positions.push(vertex.x, vertex.y, vertex.z);
        const color = new THREE.Color();
        color.setHSL(Math.random() * 0.2 + 0.5, 0.55, Math.random() * 0.25 + 0.55);
        colors.push(color.r, color.g, color.b);
      }

      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      const starsMaterial = new THREE.PointsMaterial({
        map: texture,
        size: 1,
        transparent: true,
        opacity: 1,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });
      stars = new THREE.Points(geometry, starsMaterial);
      stars.scale.set(300, 300, 300);
      scene.add(stars);
    }

    // 观测点 水波效果
    const targetDotsGroup = new THREE.Group();
    function initTargetPoint(datas: any) {
      const texture = new THREE.TextureLoader().load("/model/earth/imgs/diqiu2/标注.png");
      const texture2 = new THREE.TextureLoader().load("/model/earth/imgs/diqiu2/标注光圈.png");
      let time1 = new Date().getTime();

      datas.map((obj: any) => {
        const pos = lglt2xyz(obj.long, obj.lat);
        let time2 = new Date(obj.expectedIamgingTime).getTime();
        let dotColor = 0x44ffaa;
        let waveColor = 0x22ffcc;
        if (time1 > time2) {
          dotColor = 0xff0000;
          waveColor = 0xff0000;
        }
        const dotMesh = createPointMesh(pos, texture, dotColor);
        const waveMesh = createWaveMesh(pos, texture2, waveColor);
        dotMesh.name = obj.csId;
        waveMesh.name = obj.csId;
        targetDotsGroup.add(dotMesh);
        targetDotsGroup.add(waveMesh);
        targetDotsGroup.name = obj.csId;
        WaveMeshArr.push(waveMesh);
      });
      earthGroup.add(targetDotsGroup);
    }

    function createPointMesh(pos: any, texture: any, color: any) {
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true, //使用背景透明的png贴图，注意开启透明计算
        side: THREE.DoubleSide, //双面可见
        depthWrite: false, //禁止写入深度缓冲区数据
        color: color,
      });
      const mesh = new THREE.Mesh(planGeometry, material);
      const size = radius * 0.04; //矩形平面Mesh的尺寸
      mesh.scale.set(size, size, size); //设置mesh大小
      //设置mesh位置
      mesh.position.set(pos.x, pos.y, pos.z);
      // mesh在球面上的法线方向(球心和球面坐标构成的方向向量)
      const coordVec3 = new THREE.Vector3(pos.x, pos.y, pos.z).normalize();
      // mesh默认在XOY平面上，法线方向沿着z轴new THREE.Vector3(0, 0, 1)
      const meshNormal = new THREE.Vector3(0, 0, 1);
      // 四元数属性.quaternion表示mesh的角度状态
      //.setFromUnitVectors();计算两个向量之间构成的四元数值
      mesh.quaternion.setFromUnitVectors(meshNormal, coordVec3);
      return mesh;
    }

    function createWaveMesh(pos: any, texture: any, color: any) {
      const material = new THREE.MeshBasicMaterial({
        color: color,
        map: texture,
        transparent: true, //使用背景透明的png贴图，注意开启透明计算
        opacity: 1.0,
        side: THREE.DoubleSide, //双面可见
        depthWrite: false, //禁止写入深度缓冲区数据
      });
      const mesh = new THREE.Mesh(planGeometry, material);
      // const coord = lon2xyz(R*1.001, lon, lat)
      const size = radius * 0.055; //矩形平面Mesh的尺寸
      mesh.size = size; //自顶一个属性，表示mesh静态大小
      mesh.scale.set(size, size, size); //设置mesh大小
      mesh._s = Math.random() * 1.0 + 1.0; //自定义属性._s表示mesh在原始大小基础上放大倍数  光圈在原来mesh.size基础上1~2倍之间变化
      mesh.position.set(pos.x, pos.y, pos.z);
      // mesh姿态设置
      // mesh在球面上的法线方向(球心和球面坐标构成的方向向量)
      const coordVec3 = new THREE.Vector3(pos.x, pos.y, pos.z).normalize();
      // mesh默认在XOY平面上，法线方向沿着z轴new THREE.Vector3(0, 0, 1)
      const meshNormal = new THREE.Vector3(0, 0, 1);
      // 四元数属性.quaternion表示mesh的角度状态
      //.setFromUnitVectors();计算两个向量之间构成的四元数值
      mesh.quaternion.setFromUnitVectors(meshNormal, coordVec3);
      return mesh;
    }

    // 公司位置点 光柱效果
    function initCompanyDisLightPillar() {
      const groupDots = new THREE.Group();
      const texture = new THREE.TextureLoader().load("/model/earth/imgs/diqiu2/标注.png");
      const distKeys = Object.keys(companyDistribution);
      distKeys.forEach(function (key: any) {
        const disPoint = companyDistribution[key];
        const pos = lglt2xyz(disPoint.value[0], disPoint.value[1]);
        let ligthBeamColor = 0x44ffaa;
        let lightBottomColor = 0x22ffcc;
        const LightPillar = createLightPillar(pos, ligthBeamColor);

        const waveMesh = createLightWaveMesh(pos, texture, lightBottomColor);
        LightPillar.add(waveMesh);
        LightPillar.name = key;

        groupDots.add(LightPillar);
      });

      earthGroup.add(groupDots);
    }

    // 光柱特效
    function createLightPillar(pos: any, color: any) {
      const height = radius * 0.1; //光柱高度，和地球半径相关，这样调节地球半径，光柱尺寸跟着变化
      const geometry = new THREE.PlaneGeometry(radius * 0.05, height); //默认在XOY平面上
      geometry.rotateX(Math.PI / 2); //光柱高度方向旋转到z轴上
      geometry.translate(0, 0, height / 2); //平移使光柱底部与XOY平面重合
      const textureLoader = new THREE.TextureLoader(); // TextureLoader创建一个纹理加载器对象
      const material = new THREE.MeshBasicMaterial({
        map: textureLoader.load("/model/earth/imgs/diqiu2/光柱.png"),
        color: color, //光柱颜色，光柱map贴图是白色，可以通过color调节颜色
        transparent: true, //使用背景透明的png贴图，注意开启透明计算
        side: THREE.DoubleSide, //双面可见
        depthWrite: false, //是否对深度缓冲区有任何的影响
      });
      const mesh = new THREE.Mesh(geometry, material);
      const group = new THREE.Group();
      // 两个光柱交叉叠加
      group.add(mesh, mesh.clone().rotateZ(Math.PI / 2)); //几何体绕x轴旋转了，所以mesh旋转轴变为z
      group.position.set(pos.x, pos.y, pos.z); //设置mesh位置
      const coordVec3 = new THREE.Vector3(pos.x, pos.y, pos.z).normalize();
      const meshNormal = new THREE.Vector3(0, 0, 1);
      // 四元数属性.quaternion表示mesh的角度状态
      //.setFromUnitVectors();计算两个向量之间构成的四元数值
      group.quaternion.setFromUnitVectors(meshNormal, coordVec3);
      return group;
    }

    // 光柱底部的矩形平面特效
    function createLightWaveMesh(pos: any, texture: any, color: any) {
      const geometry = new THREE.PlaneGeometry(1, 1); //默认在XOY平面上
      const material = new THREE.MeshBasicMaterial({
        color: color,
        map: texture,
        transparent: true, //使用背景透明的png贴图，注意开启透明计算
        // side: THREE.DoubleSide, //双面可见
        depthWrite: false, //禁止写入深度缓冲区数据
      });
      const mesh = new THREE.Mesh(geometry, material);
      const size = radius * 0.05; //矩形平面Mesh的尺寸
      mesh.scale.set(size, size, size); //设置mesh大小
      return mesh;
    }

    // 接收站部分
    function addReceiver(receiverData: any) {
      const receiverGroup = new THREE.Group();

      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("/Three/jsm/libs/draco/gltf/");

      const gltfLoader = new GLTFLoader();
      gltfLoader.setDRACOLoader(dracoLoader);

      gltfLoader.load("/model/receiver.glb", function (gltf: any) {
        // const p1 = new THREE.Vector3( positions[ 0 ], positions[ 1 ], positions[ 2 ] );//顶点1坐标
        const receiverPoints = gltf.scene;
        receiverPoints.scale.set(0.00025, 0.00025, 0.00025);

        receiverData.forEach((resData: any, index: number) => {
          const receiver = receiverPoints.clone();
          receiver.name = `${RECEIVER}_${index}`;
          // receiver.rotation.set(0, -1 * Math.PI, 0);
          const positions = lglt2xyz(resData.long, resData.lat);
          receiver.position.set(positions.x, positions.y, positions.z);
          receiverGroup.add(receiver); //点对象添加到场景中
        });
      });
      scene.add(receiverGroup);
      earthGroup.add(receiverGroup);
      return receiverGroup;
    }

    // 轨道部分
    function getOrbitOnePosition(satrec: any, currentTime: any) {
      const positionAndVelocity = satellite.propagate(satrec, currentTime);
      const gmst = satellite.gstime(new Date(currentTime));
      const positionEci = positionAndVelocity.position;
      const positionGd = satellite.eciToGeodetic(positionEci, gmst);

      const longitude = positionGd.longitude;
      const latitude = positionGd.latitude;
      const height = positionGd.height;

      const longitudeDeg = satellite.degreesLong(longitude);
      const latitudeDeg = satellite.degreesLat(latitude);

      const calHeight = ((earthRadius + height) * radius) / earthRadius;
      const xyz = lon2xyz(calHeight, longitudeDeg, latitudeDeg);
      return {
        x: xyz.x,
        y: xyz.y,
        z: xyz.z,
        longitude: longitude,
        latitude: latitude,
        altitude: height,
      };
    }

    function getOrbitPositionDatas(startTime: any, satrec: any, minsPerInterval: any) {
      const positions = [];
      for (let i = 0; i <= minsPerInterval; i++) {
        const currentTime = new Date(startTime + i * 60 * 1000);
        const xyz = getOrbitOnePosition(satrec, currentTime);
        positions.push(xyz.x, xyz.y, xyz.z);
      }

      return positions;
    }

    function initSatelliteByTLE(tleLine1: any, tleLine2: any) {
      const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
      // const totalIntervalsInDay = satrec.no * 1440 * 0.159155; // 1440 = min && 0.159155 = 1turn
      // const minsPerInterval = 1440 / totalIntervalsInDay;
      const minsPerInterval = 1 / (satrec.no * 0.159155);
      return {
        satrec,
        minsPerInterval,
      };
    }

    function loadFont(fontName: any, fontWeight: any) {
      const fontLoader = new FontLoader();
      fontLoader.load("/jslib/Three/fonts/" + fontName + "_" + fontWeight + ".typeface.json", (response: any) => {
        font = response;
      });
    }

    function createText(text: string, materials: any, position: any, size = 0.05, height = 0.001) {
      const textGeo = new TextGeometry(text, {
        font: font,
        size: size,
        height: height,
        curveSegments: 12,
        bevelEnabled: false,
        bevelThickness: 0.01,
        bevelSize: 0.001,
        bevelSegments: 5,
      });

      textGeo.computeBoundingBox();

      const centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
      const textMesh = new THREE.Mesh(textGeo, materials);
      textMesh.position.x = centerOffset;
      textMesh.position.y = position.y;
      textMesh.position.z = position.z;

      textMesh.rotation.x = -Math.PI / 2;
      // textMesh.rotation.y = 0;

      return textMesh;
    }

    function addSatelliteOrbit(tleLine1: string, tleLine2: string, satelliteName: string) {
      const orbitGroup = new THREE.Group();
      const satrecObj = initSatelliteByTLE(tleLine1, tleLine2);

      //线条模型对象
      // const linGeometry = new THREE.BufferGeometry();
      const linGeometry = new THREE.BufferGeometry();
      const now = Date.now();
      const positions = getOrbitPositionDatas(now, satrecObj.satrec, satrecObj.minsPerInterval);
      linGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      const material = new THREE.LineBasicMaterial({
        color: 0x22ffcc,
        linewidth: 1,
      });
      const line = new THREE.Line(linGeometry, material);
      line.name = FEATURE_ORBIT;
      orbitGroup.add(line);

      const linGeometry2 = new THREE.BufferGeometry();
      const oldTime = Date.now() - 10 * 60 * 1000;
      const positions2 = getOrbitPositionDatas(oldTime, satrecObj.satrec, 10);
      linGeometry2.setAttribute("position", new THREE.Float32BufferAttribute(positions2, 3));
      const material2 = new THREE.LineBasicMaterial({
        color: 0xaaaaaa,
        linewidth: 1,
      });
      const line2 = new THREE.Line(linGeometry2, material2);
      line2.name = EXPIRED_ORBIT;
      orbitGroup.add(line2);

      const gltfLoader = new GLTFLoader();
      const materials = [
        new THREE.MeshPhongMaterial({ color: 0x000000, flatShading: true }), // front
        new THREE.MeshPhongMaterial({ color: 0x000000 }), // side
      ];

      gltfLoader.load("/model/satellite.gltf", (gltf: any) => {
        const satelliteGroup = new THREE.Group();
        const earthPoints = gltf.scene;
        earthPoints.scale.set(0.00035, 0.00035, 0.00035);
        satelliteGroup.add(earthPoints);

        const labelPosition = new THREE.Vector3(0, 0.095, 0);
        const satelliteLabel = createText(satelliteName, materials, labelPosition, 0.06, 0.0012);
        satelliteLabel.name = `${SATELLITE}_label${SEPARATE_FLAG}${satelliteName}`;

        satelliteGroup.add(satelliteLabel);
        satelliteGroup.rotation.set(0, -1 * Math.PI, 0);
        satelliteGroup.position.set(positions[0], positions[1], positions[2]);

        const planeGeo = new THREE.BoxGeometry(0.8, 0.35, 0.2);
        const planeMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
          opacity: 0.01,
          transparent: true,
        });
        const plane = new THREE.Mesh(planeGeo, planeMaterial);
        plane.name = `${SATELLITE}_plane${SEPARATE_FLAG}${satelliteName}`;
        // plane.rotation.y = - Math.PI / 2;
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = 0;
        satelliteGroup.add(plane);

        satelliteGroup.name = `${SATELLITE}${SEPARATE_FLAG}${satelliteName}`;

        orbitGroup.add(satelliteGroup); //点对象添加到场景中
      });
      orbitGroup.name = `${SATELLITEGROUP}${SEPARATE_FLAG}${satelliteName}`;
      // scene.add( orbitGroup );
      allSatelliteGroup.add(orbitGroup);
      return orbitGroup;
    }

    function updateSatellitePosition() {
      const objKeys = Object.keys(satelliteObj);
      const minutes = 0;
      for (const key of objKeys) {
        const { tle1, tle2 } = getTLElines(key);

        const satrecObj = initSatelliteByTLE(tle1, tle2);
        let currentStep = satelliteObj[key].currentStep;

        let minsPerInterval = satrecObj.minsPerInterval;
        if (minsPerInterval === 0) {
          minsPerInterval = 90;
        }
        minsPerInterval = minsPerInterval * 60 * 1000;

        if (currentStep === 0) {
          currentStep = orbitsMultiplier * 1000;
        } else {
          currentStep = currentStep + orbitsMultiplier * 1000;
        }

        const groupTemp = satelliteObj[key]["group"].children;
        let featureLineobj = null;
        let expriredLineobj = null;
        let pointObj = null;

        for (let i = 0; i < groupTemp.length; i++) {
          const objTemp = groupTemp[i];
          if (objTemp.name.startsWith(SATELLITE)) {
            pointObj = objTemp;
          } else if (objTemp.name === FEATURE_ORBIT) {
            featureLineobj = objTemp;
          } else {
            expriredLineobj = objTemp;
          }
        }

        if (featureLineobj && expriredLineobj) {
          if (currentStep > minsPerInterval) {
            currentStep = 0;
            // 更新全新轨道
            const now = Date.now();
            const positions = getOrbitPositionDatas(now, satrecObj.satrec, satrecObj.minsPerInterval);
            featureLineobj.geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

            const oldTime = now - 10 * 60 * 1000;
            const positions2 = getOrbitPositionDatas(oldTime, satrecObj.satrec, 10);
            expriredLineobj.geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions2, 3));
          } else {
            if (currentStep % 60000 == 0) {
              const featureArray = Array.from(featureLineobj.geometry.attributes.position.array);
              // const expiredArray = Array.from(expriredLineobj.geometry.attributes.position.array);
              // expiredArray.push(featureArray.shift());
              // expiredArray.push(featureArray.shift());
              // expiredArray.push(featureArray.shift());
              featureArray.shift();
              featureArray.shift();
              featureArray.shift();

              featureLineobj.geometry.setAttribute("position", new THREE.Float32BufferAttribute(featureArray, 3));
              // expriredLineobj.geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( expiredArray, 3 ) );
            }
          }
        }

        satelliteObj[key].currentStep = currentStep;

        if (pointObj) {
          const now = Date.now() + currentStep;
          const pointPosition = getOrbitOnePosition(satrecObj.satrec, new Date(now));

          const expiredArray = Array.from(expriredLineobj.geometry.attributes.position.array);
          expiredArray.push(pointPosition.x, pointPosition.y, pointPosition.z);
          expriredLineobj.geometry.setAttribute("position", new THREE.Float32BufferAttribute(expiredArray, 3));
          // const p1 = new THREE.Vector3( pointPosition.x, pointPosition.y, pointPosition.z );//顶点1坐标
          // pointObj.geometry.setFromPoints( [ p1 ] );
          pointObj.position.set(pointPosition.x, pointPosition.y, pointPosition.z);

          satelliteObj[key].longitude = pointPosition.longitude;
          satelliteObj[key].latitude = pointPosition.latitude;
          satelliteObj[key].altitude = pointPosition.altitude;
        }
      }
    }

    function getTLElines(key: any) {
      let tle1 = satelliteObj[key]["tle1"];
      let tle2 = satelliteObj[key]["tle2"];

      if (satelliteObj[key]["currentTle1"] && satelliteObj[key]["currentTle2"]) {
        tle1 = satelliteObj[key]["currentTle1"];
        tle2 = satelliteObj[key]["currentTle2"];
      }

      return {
        tle1,
        tle2,
      };
    }

    function initSatellite() {
      const objKeys = Object.keys(satelliteObj);
      for (const key of objKeys) {
        const { tle1, tle2 } = getTLElines(key);
        const name = satelliteObj[key]["name"];
        const groupTemp = addSatelliteOrbit(tle1, tle2, name);
        satelliteObj[key]["group"] = groupTemp;
      }
      scene.add(allSatelliteGroup);
      initFlag = true;
    }

    // 基本要素设置
    function initRenderer() {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
      const containerDom = document.querySelector("#ThreeBaseContainer");
      containerDom.appendChild(renderer.domElement);
    }

    function initCamera() {
      camera = new THREE.PerspectiveCamera(45, aspect, 1, 10000);
      camera.position.set(-4.66, 4.86, -14.89);
      camera.lookAt(0, 0, 0);
    }

    function initScene() {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xffffff);
      // scene.fog = new THREE.Fog( 0x020924, 200, 1000 );
    }

    function initLight() {
      const ambientLight = new THREE.AmbientLight(0xcccccc, 1.1);
      scene.add(ambientLight);

      let directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
      directionalLight.position.set(1, 0.1, 0).normalize();

      let directionalLight2 = new THREE.DirectionalLight(0xff2ffff, 0.2);
      directionalLight2.position.set(1, 0.1, 0.1).normalize();

      scene.add(directionalLight);
      scene.add(directionalLight2);

      let hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.2);
      hemiLight.position.set(0, 1, 0);
      scene.add(hemiLight);

      let directionalLight3 = new THREE.DirectionalLight(0xffffff);
      directionalLight3.position.set(1, 500, -20);
      directionalLight3.castShadow = true;
      directionalLight3.shadow.camera.top = 18;
      directionalLight3.shadow.camera.bottom = -10;
      directionalLight3.shadow.camera.left = -52;
      directionalLight3.shadow.camera.right = 12;
      scene.add(directionalLight3);
    }

    function initControls() {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      //controls.dampingFactor = 0.25;
      controls.enableZoom = true;
      controls.autoRotate = false;
      controls.autoRotateSpeed = 2;
      // controls.minDistance = 2;
      // controls.maxDistance = 1000;
      controls.enablePan = true;
    }

    function initAuxiliaryTool() {
      const helper = new THREE.AxesHelper(500);
      scene.add(helper);
      // 网格
      const grid = new THREE.GridHelper(2, 10, 0x000000, 0x000000);
      grid.material.opacity = 0.2;
      grid.material.transparent = true;
      scene.add(grid);
    }

    const onWindowResize = () => {
      containerDom = document.querySelector("#ThreeBaseContainer");
      SCREEN_WIDTH = containerDom.clientWidth;
      SCREEN_HEIGHT = containerDom.clientHeight;
      aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

      camera.aspect = aspect;
      camera.updateProjectionMatrix();

      renderer.clear();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
      renderer.render(scene, camera);
    };

    function renders() {
      renderer.clear();
      renderer.render(scene, camera);
    }

    function animate() {
      window.requestAnimationFrame(() => {
        if (controls) {
          controls.update();
          camera.updateMatrixWorld();
        }

        if (initFlag) {
          updateSatellitePosition();
          //光环
          earthGroup.rotation.y = earthGroup.rotation.y + 0.001;
          // 所有波动光圈都有自己的透明度和大小状态
          // 一个波动光圈透明度变化过程是：0~1~0反复循环
          if (WaveMeshArr.length) {
            WaveMeshArr.forEach(function (mesh) {
              mesh._s += 0.007;
              mesh.scale.set(mesh.size * mesh._s, mesh.size * mesh._s, mesh.size * mesh._s);
              if (mesh._s <= 1.5) {
                //mesh._s=1，透明度=0 mesh._s=1.5，透明度=1
                mesh.material.opacity = (mesh._s - 1) * 2;
              } else if (mesh._s > 1.5 && mesh._s <= 2) {
                //mesh._s=1.5，透明度=1 mesh._s=2，透明度=0
                mesh.material.opacity = 1 - (mesh._s - 1.5) * 2;
              } else {
                mesh._s = 1.0;
              }
            });
          }
        }

        // 这是为了描中国的边。
        uniforms2.u_time.value += 0.007;

        renders();
        animate();
      });
    }

    const onMouseClick = (event: any) => {
      mouse.x = (event.offsetX / SCREEN_WIDTH) * 2 - 1;
      mouse.y = -(event.offsetY / SCREEN_HEIGHT) * 2 + 1;

      if (raycaster) {
        raycaster.setFromCamera(mouse, camera);
        let targetIntersects = raycaster.intersectObjects(targetDotsGroup.children, false);
        // console.log("targetIntersects", targetIntersects)
        for (let i = 0; i < targetIntersects.length; i++) {
          // console.log("target", targetIntersects[i].object.type, targetIntersects[i].object.name);
          const name = targetIntersects[i].object.name || "";
          if (name.startsWith(TARGET)) {
            handleTargetClicked(name);
            break;
          }
        }

        // 现在有10 颗星
        let trigerFlag = false;
        for (let jj = 0; jj < 10; jj++) {
          let sateIntersects = raycaster.intersectObjects(allSatelliteGroup.children[jj].children[2].children, false);

          for (let i = 0; i < sateIntersects.length; i++) {
            const name = sateIntersects[i].object.name || "";
            if (name.startsWith(SATELLITE)) {
              handleSatelliteClicked(name);
              trigerFlag = true;
              break;
            }
          }
          if (trigerFlag) {
            break;
          }
        }
      }
    };

    function handleTargetClicked(name: string) {
      let index = name.split(SEPARATE_FLAG)[1];
      const vdata = targetOriginData[index];
      targetPannelControl.isShow = true;
      targetPannelControl.id = name;
      targetPannelControl.vNodeData = vdata;
    }

    function handleSatelliteClicked(name: string) {
      let keyName = name.split(SEPARATE_FLAG)[1];
      currentSatellite = keyName;
      const vdata = satelliteObj[keyName];
      satellitePannel.isShow = true;
      satellitePannel.id = keyName;
      satellitePannel.vNodeData = vdata;
      updateSatelliteData(1000);
    }

    function updateSatelliteData(time = 500) {
      clearUpdateSatelliteTimer();
      if (currentSatellite !== "") {
        updateSatelliteTimer = setInterval(() => {
          satellitePannel.vNodeData = { ...satelliteObj[currentSatellite] };
        }, time);
      }
    }

    function clearInitTimer() {
      if (initIntervalTimer) {
        clearInterval(initIntervalTimer);
      }
      initIntervalTimer = null;
    }

    onMounted(() => {
      setTimeout(() => {
        containerDom = document.querySelector("#ThreeBaseContainer");
        SCREEN_WIDTH = containerDom.clientWidth;
        SCREEN_HEIGHT = containerDom.clientHeight;

        earthGroup = new THREE.Group();

        globeTextureLoader = new THREE.TextureLoader();
        planGeometry = new THREE.PlaneGeometry(1, 1); //默认在XOY平面上

        raycaster = new THREE.Raycaster();

        loadFont(fontName, fontWeight);
        initRenderer();
        initCamera();
        initScene();
        initLight();

        initControls();

        // initAuxiliaryTool();

        // initPoints();

        initEarth();
        // initEarthSprite();
        initGeoJson();

        initIntervalTimer = setInterval(() => {
          try {
            if (satellite && satellite.twoline2satrec && font) {
              initCompanyDisLightPillar();
              clearInitTimer();
              initSatellite();
              getTargetData();
              getReveiverStationsData();
            }
          } catch (error) {
            console.log("satellite.js not Loaded");
          }
        }, 100);

        animate();

        window.addEventListener("resize", onWindowResize, false);
      }, 500);
    });

    onUnmounted(() => {
      clearInitTimer();
      window.removeEventListener("resize", onWindowResize, false);
    });

    return {
      targetPannelControl,
      satellitePannel,
      onMouseClick,
    };
  },
});
</script>

<style scoped lang="scss">
#ThreeBaseContainer {
  position: relative;
  width: 100vw;
  height: 100vw;
  overflow: hidden;
}

.mask_left {
  position: absolute;
  width: 12vw;
  height: 100%;
  background-color: transparent;
  left: 0;
  top: 0;
  z-index: 100;
}
.mask_right {
  position: absolute;
  width: 12vw;
  height: 100%;
  background-color: transparent;
  right: 0;
  top: 0;
  z-index: 100;
}

.target_box {
  position: absolute;
  width: 96%;
  height: auto;
  top: 5rem;
  left: 2%;
  z-index: 101;
}

.satellite_pannel_box {
  position: absolute;
  width: 96%;
  height: auto;
  top: 0;
  left: 2%;
  z-index: 101;
}
</style>
