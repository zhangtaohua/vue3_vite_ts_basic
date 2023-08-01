import * as Cesium from "cesium";
import { CesiumIondefaultAccessToken, cesiumViewMode } from "./csConstant";
import { cesiumBasicOptions, PskyboxSource } from "./baseTypes";

export default class CesiumBase {
  public container = "";
  public pixelRatio = 1;
  public language = "zh_CN";

  public viewer: Cesium.Viewer = null;
  public viewerGL: any;
  public camera: Cesium.Camera | null;
  public imageryLayers: any = null;
  public scene: any = null;

  public prevClockTime: Cesium.JulianDate = Cesium.JulianDate.fromDate(new Date());

  public flyToDefaultMinHeight = 0;
  public flyToDefaultMaxHeight = 37000000; // 27000000

  public maxZoom = 21;
  public minZoom = 0;

  public getCurrentzIndex(zIndex: any) {
    let zIndexNew = 0;
    if (this.viewer) {
      const layersLength = this.imageryLayers.length;
      zIndexNew = layersLength;
      if (zIndex) {
        if (zIndex <= layersLength) {
          zIndexNew = zIndex;
        }
      }
    }
    return zIndexNew;
  }

  public onWindowResize = () => {
    if (this.viewer) {
      this.viewer.resize();
    }
  };

  constructor(target: string, options: cesiumBasicOptions) {
    Cesium.Ion.defaultAccessToken = CesiumIondefaultAccessToken;
    this.container = target;
    this.pixelRatio = options.pixelRatio || (window ? window.devicePixelRatio : 1);
    this.language = options.language || "zh_CN";
    this.maxZoom = options.maxZoom || 21;
    this.minZoom = options.minZoom || 0;

    // const mapProjection = options.mapProjection || new Cesium.WebMercatorProjection();
    const mapProjection = options.mapProjection || new Cesium.GeographicProjection();
    let skyBox = undefined;
    if (options.skyBox) {
      skyBox = new Cesium.SkyBox({
        sources: options.skyBox,
      });
    }

    let skyAtmosphere = false;
    if (options.isShowSkyAtmosphere) {
      skyAtmosphere = new Cesium.SkyAtmosphere();
    }

    this.viewer = new Cesium.Viewer(target, {
      navigationHelpButton: options.isShowHelper ?? true, // 帮助提示，如何操作数字地球。
      navigationInstructionsInitiallyVisible: options.isShowHelper ?? true, // 如果最初应该看到导航说明，则为true；如果直到用户明确单击该按钮，则该提示不显示，否则为false。
      vrButton: options.isShowVr || false, // VR模式
      sceneModePicker: options.isShowModePicker ?? true, // 场景模式，切换2D、3D 和 Columbus View (CV) 模式。
      geocoder: options.isShowGeoSearch ?? true, // 地理编码（搜索）组件
      homeButton: options.isShowDefHome ?? true, // 首页，点击之后将视图跳转到默认视角
      skyAtmosphere: skyAtmosphere,
      fullscreenButton: options.isShowFullScreen ?? true, // 全屏组件
      baseLayerPicker: options.isShowBaseLayerPicker ?? true, // 底图组件，选择三维数字地球的底图（imagery and terrain）
      selectionIndicator: options.isShowSelectionIndicator ?? true, //鼠标点击wms选择框 是否显示选取指示器组件
      infoBox: options.isShowinfoBox ?? true, // 信息框
      timeline: options.isShowtimeline ?? true, // 时间轴
      animation: options.isShowAnimation ?? true, // 动画小组件
      terrainProvider: undefined,
      imageryProvider: undefined,
      mapProjection: mapProjection,
      skyBox: skyBox,
      // orderIndependentTranslucency: false,  // 为了背景透明
      // contextOptions: {
      //   webgl: {
      //     alpha: true,
      //   },
      // },
    });

    this.imageryLayers = this.viewer.imageryLayers;

    this.removeAllMapLayers(true);
    // fly
    // this.viewer.camera.flyTo({
    //   destination: Cesium.Cartesian3.fromDegrees(114.296063, 30.55245, 20000000),
    //   oritentation: {
    //     heading: Cesium.Math.toRadians(0),
    //     pitch: Cesium.Math.toRadians(-90),
    //     roll: 0.0,
    //   },
    //   duration: 10,
    // });

    // 抗锯齿
    this.viewer.scene.fxaa = true;
    this.viewer.scene.postProcessStages.fxaa.enabled = false;

    // 水雾特效
    // this.viewer.scene.globe.showGroundAtmosphere = true;

    // 删除鼠标左键双击功能--追踪该位置
    this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    this.camera = this.viewer.camera;

    this.scene = this.viewer.scene;

    this.viewerGL = this.viewer.scene.context._originalGLContext;

    // 隐藏logo
    this.viewer._cesiumWidget._creditContainer.style.display = "none";
    // this.hideCopyRight()

    this.prevClockTime = this.viewer.clock.currentTime;
    if (window) {
      window.addEventListener("resize", this.onWindowResize);
    }

    if (options.viewMode) {
      this.switchViewMode(options.viewMode);
    }

    // 设置球的背景色为 透明
    this.setSphereBgColor(new Cesium.Color(1.0, 1.0, 1.0, 1));
  }

  public destructor() {
    if (this.viewer) {
      if (window) {
        window.removeEventListener("resize", this.onWindowResize);
      }
      this.viewer.destroy();
      this.viewer._element && this.viewer._element.remove();
      this.viewer = null;

      this.viewerGL && this.viewerGL.getExtension("WEBGL_lose_context").loseContext();
      this.viewerGL = null;
      this.container = "";
    }
  }

  public setSphereBgColor(color: any) {
    if (this.viewer) {
      this.scene.globe.baseColor = color;
    }
  }

  public setSpaceBgColor(color: any) {
    if (this.viewer) {
      this.scene.backgroundColor = color;
    }
  }

  public hideCopyRight() {
    // 去除版权信息
    // 类型断言
    if (this.viewer) {
      const copyRightContainer = this.viewer.cesiumWidget.creditContainer as HTMLElement;
      copyRightContainer.style.display = "none";
    }
  }

  switchViewMode(viewMode: string) {
    if (this.viewer) {
      switch (viewMode) {
        case cesiumViewMode.scene2D: {
          // 2D 模式
          this.scene.mode = Cesium.SceneMode.SCENE2D;
          break;
        }
        case cesiumViewMode.scene3D: {
          // 3D 模式
          this.scene.mode = Cesium.SceneMode.SCENE3D;
          break;
        }
        case cesiumViewMode.columbus: {
          // 2.5D 哥伦布模式
          this.scene.mode = Cesium.SceneMode.COLUMBUS_VIEW;
          break;
        }
        case cesiumViewMode.morphing: {
          // 变形模式
          this.scene.mode = Cesium.SceneMode.MORPHING;
          break;
        }
        default: {
          break;
        }
      }
    }
  }

  public resetSkybox(skyboxOpitons: PskyboxSource) {
    if (this.viewer) {
      this.scene.skyBox = new Cesium.SkyBox({
        sources: skyboxOpitons,
      });
    }
  }

  public toggleDawnLine() {
    if (this.viewer) {
      this.scene.globe.enableLighting = !this.scene.globe.enableLighting;
    }
  }

  public disableCameraController() {
    if (this.viewer) {
      // this.scene.screenSpaceCameraController.enableCollisionDetection = false
      this.scene.screenSpaceCameraController.enableRotate = false;
      this.scene.screenSpaceCameraController.enableTranslate = false;
      //禁止拖拽、缩放地球
      this.scene.screenSpaceCameraController.enableZoom = false;
      this.scene.screenSpaceCameraController.enableTilt = false;
      this.scene.screenSpaceCameraController.enableLook = false;
    }
  }

  public getAllLayers() {
    return [];
  }

  public removeAllMapLayers(destroy = true) {
    // already judged this.handle
    if (this.viewer) {
      this.imageryLayers.removeAll(destroy);
    }
  }

  public getCenter() {
    if (!this.viewer) {
      return null;
    }
    const target = this.pickCenterPoint(this.scene);
    let bestTarget = target;

    const globe = this.scene.globe;
    const carto = this.scene.camera.positionCartographic.clone();
    const height = globe.getHeight(carto);
    carto.height = height || 0;
    bestTarget = Cesium.Ellipsoid.WGS84.cartographicToCartesian(carto);

    const result: any = this.formatPosition(bestTarget);

    // 获取地球中心点世界位置  与  摄像机的世界位置  之间的距离
    const distance = Cesium.Cartesian3.distance(bestTarget, this.viewer.scene.camera.positionWC);
    result.cameraZ = distance;
    return result;
  }

  public pickCenterPoint(scene: any) {
    const canvas = scene.canvas;
    const center = new Cesium.Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2);
    const ray = scene.camera.getPickRay(center);
    const target = scene.globe.pick(ray, scene);
    return target || scene.camera.pickEllipsoid(center);
  }

  public formatPosition(position: any) {
    const carto = Cesium.Cartographic.fromCartesian(position);
    const result: any = {};
    result.y = this.formatNum(Cesium.Math.toDegrees(carto.latitude), 6);
    result.x = this.formatNum(Cesium.Math.toDegrees(carto.longitude), 6);
    result.z = this.formatNum(carto.height, 2);
    return result;
  }

  public formatNum(num: number, digits: number) {
    return Number(num.toFixed(digits || 0));
  }

  // 屏幕中心点位置
  getScreenCenter() {
    if (!this.viewer) {
      return null;
    }
    const canvas = this.viewer.canvas; // use this
    // const canvas = this.cesiumViewerHandler.scene.canvas
    const result: any = this.camera!.pickEllipsoid(
      new Cesium.Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2),
    );

    const curPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(result);
    const lon = (curPosition.longitude * 180) / Math.PI;
    const lat = (curPosition.latitude * 180) / Math.PI;
    const height = curPosition.height;
    return {
      x: lon,
      y: lat,
      z: height,
    };
  }

  public heightToZoom(height: number) {
    const A = 40487.57;
    const B = 0.00007096758;
    const C = 91610.74;
    const D = -40467.74;
    return Math.round(D + (A - D) / (1 + Math.pow(height / C, B)));
  }

  public getHeight() {
    const globe = this.scene.globe;
    const carto = this.camera.positionCartographic.clone();
    const height = globe.getHeight(carto);

    // const height = this.camera.positionCartographic.height;
    return height;
  }

  public getZoom() {
    const height = this.getHeight();
    return this.heightToZoom(height);
  }

  public zoomInOut(isZoomin = true, duration = 1000) {
    // already judged this.handle
    let currentZoom: number = this.getZoom();
    if (currentZoom) {
      if (isZoomin) {
        currentZoom += 1;
        if (currentZoom >= this.maxZoom) {
          currentZoom = this.maxZoom;
        }
      } else {
        currentZoom -= 1;
        if (currentZoom <= this.minZoom) {
          currentZoom = this.minZoom;
        }
      }
      this.flyToZoom(currentZoom, duration);
    }
  }

  public flyToPosition(longitude = 0, latitude = 0, height = 0, duration = 1000) {
    if (!this.camera) {
      return null;
    }

    this.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
      duration: duration,
    });
  }

  public flyToHeight(height: number, duration = 1000) {
    if (!this.camera) {
      return null;
    }
    this.camera.flyTo({
      destination: Cesium.Cartesian3.fromRadians(
        this.camera.positionCartographic.longitude,
        this.camera.positionCartographic.latitude,
        height,
      ),
      duration: duration,
    });
  }

  public flyToZoom(zoom = 3, duration = 1000) {}

  public flyToZoomPosition(longitude = 0, latitude = 0, zoom = 3, duration = 1000) {}

  public setPosition(longitude = 0, latitude = 0, height = 0) {
    if (!this.camera) {
      return null;
    }

    this.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
    });
  }

  public setToHeight(height: number) {
    if (!this.camera) {
      return null;
    }
    this.camera.setView({
      destination: Cesium.Cartesian3.fromRadians(
        this.camera.positionCartographic.longitude,
        this.camera.positionCartographic.latitude,
        height,
      ),
    });
  }

  public setZoomPosition(longitude = 0, latitude = 0, zoom = 3) {}

  public fitToExtent(extent: any, padding = [0, 0, 0, 0], isTransformed = false) {}

  public fitToLayerSourceByID(id: string, padding = [0, 0, 0, 0]) {}

  // left down -> right up
  public fitToLDRU(ld_longitude: number, ld_latitude: number, ru_longitude: number, ru_latitude: number) {
    if (ld_longitude > ru_longitude || ld_latitude > ru_latitude) {
      return;
    }
    const extent = [ld_longitude, ld_latitude, ru_longitude, ru_latitude];
    this.fitToExtent(extent);
  }

  public getExtentCenter(extent: any) {
    return [];
  }

  public rotate(degree: number) {
    if (!this.camera) {
      return;
    }
    this.camera.setView({
      // destination: Cesium.Cartesian3.fromDegrees(
      //   this.camera.positionCartographic.longitude,
      //   this.camera.positionCartographic.latitude,
      //   this.camera.positionCartographic.height,
      // ),
      orientation: {
        heading: Cesium.Math.toRadians(degree), // -45
      },
    });
  }
}
