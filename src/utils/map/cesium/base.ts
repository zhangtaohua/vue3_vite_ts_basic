import * as Cesium from "cesium";
import { CesiumIondefaultAccessToken, cesiumViewMode } from "./csConstant";
import { CesiumBasicOptions, PskyboxSource } from "./baseTypes";
import { getCenterFromExtent } from "../geoCommon";
import { MAP_INTER_ZOOMIN, MAP_INTER_ZOOMOUT } from "../geoConstant";

export default class CesiumBase {
  public container = "";
  public pixelRatio = 1;
  public language = "zh_CN";

  public viewer: Cesium.Viewer = null;
  public viewerGL: any;
  public camera: Cesium.Camera | null;
  public imageryLayers: any = null;
  public scene: any = null;
  public canvas: any = null;
  public originDoubleClickEvent: any = null;

  public prevClockTime: Cesium.JulianDate = Cesium.JulianDate.fromDate(new Date());

  public flyToDefaultMinHeight = 800;
  public flyToDefaultMaxHeight = 34185382; //37000000; // 27000000

  public maxZoom = 21;
  public minZoom = 0;
  private csTimeNow: number = Date.now();

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

  constructor(target: string, options: CesiumBasicOptions) {
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

    this.clearImageryLayers(true);

    // fly
    this.flyToLngLatHeight(114.296063, 30.55245, 20000000, 1000);

    // 抗锯齿
    this.viewer.scene.fxaa = true;
    this.viewer.scene.postProcessStages.fxaa.enabled = false;

    // 水雾特效
    // this.viewer.scene.globe.showGroundAtmosphere = true;

    this.camera = this.viewer.camera;

    this.scene = this.viewer.scene;

    this.viewerGL = this.viewer.scene.context._originalGLContext;

    this.canvas = this.viewer.scene.canvas;

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
      this.camera = null;
      this.imageryLayers = null;
      this.scene = null;
      this.canvas = null;

      this.viewer.destroy();
      this.viewer._element && this.viewer._element.remove();
      this.viewer = null;

      this.viewerGL && this.viewerGL.getExtension("WEBGL_lose_context").loseContext();
      this.viewerGL = null;
      this.container = "";
    }
  }

  public disableDoubleClick() {
    // 删除鼠标左键双击功能--追踪该位置
    this.originDoubleClickEvent = this.viewer.cesiumWidget.screenSpaceEventHandler.getInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
    );
    this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  }

  public enableDoubleClick() {
    this.viewer.cesiumWidget.screenSpaceEventHandler.setInputAction(
      this.originDoubleClickEvent,
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
    );
  }

  public disableDepthTest() {
    this.viewer.scene.globe.depthTestAgainstTerrain = false;
  }

  public enableDepthTest() {
    this.viewer.scene.globe.depthTestAgainstTerrain = true;
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

  public __rotateEventFunc = () => {
    const a = 0.05;
    const t = Date.now();
    const n = (t - this.csTimeNow) / 1e3;
    this.csTimeNow = t;
    this.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -a * n);
  };

  public startRotate() {
    if (this.viewer) {
      this.viewer.clock.onTick.addEventListener(this.__rotateEventFunc);
    }
  }

  public stopRotate() {
    if (this.viewer) {
      this.viewer.clock.onTick.removeEventListener(this.__rotateEventFunc);
    }
  }

  // setEarthMiddleUp() {
  //   //地球居中上
  //   this.viewer && this.viewer.camera.lookDown(Cesium.Math.toRadians(1));
  // }

  public getAllImageryLayers() {
    return this.imageryLayers;
  }

  public clearImageryLayers(destroy = true) {
    // already judged this.handle
    if (this.viewer) {
      this.imageryLayers.removeAll(destroy);
    }
  }

  public clearEntities() {
    if (this.viewer) {
      this.viewer.entities.removeAll();
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
  public getScreenCenter() {
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

  public cartesian3ToLngLat(cartesian: Cesium.Cartesian3) {
    if (!this.viewer) {
      return null;
    }
    const ellipsoid = this.viewer!.scene.globe.ellipsoid;
    const cartographic = ellipsoid.cartesianToCartographic(cartesian);

    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);

    return {
      longitude,
      latitude,
    };
  }

  public cartesian3ToWgs84(cartesian: Cesium.Cartesian3) {
    if (!this.viewer) {
      return null;
    }
    const ellipsoid = this.viewer!.scene.globe.ellipsoid;
    //将笛卡尔三维坐标转为地图坐标（弧度）
    const cartographic = ellipsoid.cartesianToCartographic(cartesian);
    //将地图坐标（弧度）转为十进制的度数
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    // console.log('经度:', log_String)
    // console.log('纬度:',lat_String)
    // console.log('视角高度', alti_String)

    // const height = cartographic.height;
    const height = Math.ceil(this.viewer.camera.positionCartographic.height);
    const zoom = this.heightToZoom(height);
    return {
      longitude,
      latitude,
      height,
      zoom,
    };
  }

  public wgs84ToCartesian3(longitude: number, latitude: number, height: number) {
    if (!this.viewer) {
      return null;
    }
    const ellipsoid = this.viewer!.scene.globe.ellipsoid;
    //定义84坐标为一个Cartesian值
    const wgs84 = Cesium.Cartographic.fromDegrees(longitude, latitude, height);

    //将84坐标转换为笛卡尔
    const cartesian3 = ellipsoid.cartographicToCartesian(wgs84);
    return cartesian3;
  }

  // Cartesian2 {x: 1000, y: 1000}
  public cartesian2ToCartesian3(cartesian2: Cesium.Cartesian2) {
    if (!this.viewer) {
      return null;
    }
    const ellipsoid = this.viewer.scene.globe.ellipsoid;
    //捕获椭球体，将笛卡尔二维平面坐标转为椭球体的笛卡尔三维坐标，返回球体表面的点
    const cartesian3 = this.viewer.camera.pickEllipsoid(cartesian2, ellipsoid);
    return cartesian3;
  }

  // Cartesian2 {x: 1000, y: 1000}
  public cartesian2ToCartesian3ToWgs84(cartesian2: Cesium.Cartesian2) {
    if (!this.viewer) {
      return null;
    }
    const ellipsoid = this.viewer.scene.globe.ellipsoid;
    //捕获椭球体，将笛卡尔二维平面坐标转为椭球体的笛卡尔三维坐标，返回球体表面的点
    const cartesian = this.viewer.camera.pickEllipsoid(cartesian2, ellipsoid);
    if (cartesian) {
      //将笛卡尔三维坐标转为地图坐标（弧度）
      const cartographic = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
      //将地图坐标（弧度）转为十进制的度数
      const longitude = Cesium.Math.toDegrees(cartographic.longitude);
      const latitude = Cesium.Math.toDegrees(cartographic.latitude);
      // console.log('经度:', log_String)
      // console.log('纬度:',lat_String)
      // console.log('视角高度', alti_String)

      const height = Math.ceil(this.viewer.camera.positionCartographic.height);
      const zoom = this.heightToZoom(height);
      return {
        longitude,
        latitude,
        height,
        zoom,
      };
    }

    return null;
  }

  public heightToZoom(height: number) {
    const A = 40487.57;
    const B = 0.00007096758;
    const C = 91610.74;
    const D = -40467.74;
    return Math.round(D + (A - D) / (1 + Math.pow(height / C, B)));
  }

  public zoomToHeight(zoom: number) {
    if (zoom) {
      const zoom = 3;
      const A = 40487.57;
      const B = 0.00007096758;
      const C = 91610.74;
      const D = -40467.74;
      return Math.pow((A - D) / (zoom - D) - 1, 1 / B) * C;
    } else {
      return 27000000;
    }
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
    if (!this.camera) {
      return null;
    }
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

  public zoomHeight(zoom: string) {
    if (!this.camera) {
      return false;
    }
    // (最大高度-最小高度）/缩放次数 = 每次缩放步长
    const maxHeight = this.flyToDefaultMaxHeight;
    const minHeight = this.flyToDefaultMinHeight; // 31894
    const step = (maxHeight - minHeight) / 10;
    const height = this.camera.positionCartographic.height;

    if (zoom === MAP_INTER_ZOOMIN && height > minHeight) {
      // 放大
      let targetHeight = height - step;
      if (targetHeight < minHeight) {
        targetHeight = minHeight;
      }
      this.setToHeight(targetHeight);
    }
    if (zoom === MAP_INTER_ZOOMOUT && height < maxHeight) {
      // 缩小
      let targetHeight = height + step;
      if (targetHeight > maxHeight) {
        targetHeight = maxHeight;
      }
      this.setToHeight(targetHeight); // 缩小
    }
    return true;
  }

  public cancelFlight() {
    if (this.camera) {
      this.camera.cancelFlight();
    }
  }

  public completeFlight() {
    if (this.camera) {
      this.camera.completeFlight();
    }
  }

  public flyHome() {
    if (this.camera) {
      this.camera.flyHome();
    }
  }

  // 调用原始的摄像头
  public flyTo(options: any) {
    if (this.camera) {
      this.camera.flyTo(options);
    }
  }

  public setView(options: any) {
    if (this.camera) {
      this.camera.setView(options);
    }
  }

  public flyToLngLat(longitude = 0, latitude = 0, duration = 1000) {
    if (!this.camera) {
      return null;
    }

    const height = this.getHeight();

    this.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
      duration: duration,
    });
  }

  public flyToLngLatHeight(longitude = 0, latitude = 0, height = 0, duration = 1000) {
    if (!this.camera) {
      return null;
    }

    this.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
      duration: duration,
    });
  }

  public flyToPosition(position: any, duration = 1000) {
    if (!this.camera) {
      return null;
    }

    this.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]),
      duration: duration,
    });

    // this.camera.flyTo({
    //   destination: Cesium.Cartesian3.fromDegrees(114.296063, 30.55245, 20000000),
    //   oritentation: {
    //     heading: Cesium.Math.toRadians(0),
    //     pitch: Cesium.Math.toRadians(-90),
    //     roll: 0.0,
    //   },
    //   duration: duration,
    // });
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

  public flyToZoom(zoom = 3, duration = 1000) {
    const height = this.zoomToHeight(zoom);
    this.flyToHeight(height, duration);
  }

  public flyToLngLatZoom(longitude = 0, latitude = 0, zoom = 3, duration = 1000) {
    const height = this.zoomToHeight(zoom);
    this.flyToLngLatHeight(longitude, latitude, height, duration);
  }

  public setLngLat(longitude = 0, latitude = 0) {
    if (!this.camera) {
      return null;
    }

    const height = this.getHeight();

    this.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
    });
  }

  public setLngLatHeight(longitude = 0, latitude = 0, height = 0) {
    if (!this.camera) {
      return null;
    }

    this.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
    });
  }

  public setPosition(position: any) {
    if (!this.camera) {
      return null;
    }

    this.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]),
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

  public setLngLatZoom(longitude = 0, latitude = 0, zoom = 3) {
    const height = this.zoomToHeight(zoom);
    this.setLngLatHeight(longitude, latitude, height);
  }

  public getExtentCenter(extent: any) {
    return getCenterFromExtent(extent);
  }

  public fitToExtent(extent: any, duration = 1000) {
    const center = getCenterFromExtent(extent);
    if (center?.length) {
      this.flyToLngLat(center[0], center[1], duration);
    }
  }

  // left down -> right up
  public fitToLDRU(
    ld_longitude: number,
    ld_latitude: number,
    ru_longitude: number,
    ru_latitude: number,
    duration = 1000,
  ) {
    if (ld_longitude > ru_longitude || ld_latitude > ru_latitude) {
      return;
    }
    const extent = [ld_longitude, ld_latitude, ru_longitude, ru_latitude];
    this.fitToExtent(extent, duration);
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

  public sync2DViewFrom3D = (targetView: Cesium.Viewer) => {
    return () => {
      if (!this.viewer) {
        return null;
      }

      let worldPosition;

      // The center of the view is the point that the 3D camera is focusing on
      const viewCenter = new Cesium.Cartesian2(
        Math.floor(this.viewer!.canvas.clientWidth / 2),
        Math.floor(this.viewer!.canvas.clientHeight / 2),
      );
      // Given the pixel in the center, get the world position
      const newWorldPosition = this.viewer!.scene.camera.pickEllipsoid(viewCenter);
      if (Cesium.defined(newWorldPosition)) {
        // Guard against the case where the center of the screen
        // does not fall on a position on the globe
        worldPosition = newWorldPosition;
      }
      // Get the distance between the world position of the point the camera is focusing on, and the camera's world position
      const distance = Cesium.Cartesian3.distance(worldPosition, this.viewer!.scene.camera.positionWC);
      // Tell the 2D camera to look at the point of focus. The distance controls how zoomed in the 2D view is
      // (try replacing `distance` in the line below with `1e7`. The view will still sync, but will have a constant zoom)
      targetView.scene.camera.lookAt(worldPosition, new Cesium.Cartesian3(0.0, 0.0, distance));
    };
  };

  public syncALLViewFromALL = (targetView: Cesium.Viewer) => {
    return () => {
      if (!this.viewer) {
        return null;
      }

      const viewPoint = {
        longitude: this.camera.positionCartographic.longitude,
        latitude: this.camera.positionCartographic.latitude,
        height: this.camera?.positionCartographic.height,
      };

      targetView.scene.camera.setView({
        destination: Cesium.Cartesian3.fromRadians(viewPoint.longitude, viewPoint.latitude, viewPoint.height),
      });
    };
  };

  public sync3DViewFrom3D = (targetView: Cesium.Viewer) => {
    return () => {
      if (!this.camera) {
        return null;
      }

      const viewPoint = {
        destination: this.camera?.position.clone(),
        orientation: {
          heading: this.camera?.heading,
          pitch: this.camera?.pitch,
          roll: this.camera?.roll,
        },
      };

      targetView.scene.camera.setView(viewPoint);
    };
  };

  public addSyncView(targetView: Cesium.Viewer) {
    // Apply our sync function every time the 3D camera view changes
    this.viewer!.camera.changed.addEventListener(this.syncALLViewFromALL(targetView));
    // By default, the `camera.changed` event will trigger when the camera has changed by 50%
    // To make it more sensitive, we can bring down this sensitivity
    this.viewer!.camera.percentageChanged = 0.01;
  }

  // 以下代码未测试
  // 存储上一帧需要移动的距离
  // 2D 自转模拟效果
  public earthRotation2D = () => {
    const { camera, clock, scene } = this.viewer;
    if (this.scene.mode !== Cesium.SceneMode.SCENE2D || !clock.shouldAnimate) {
      this.prevClockTime = clock.currentTime;
      return;
    }

    // 获取相机高度
    const { height } = scene.globe.ellipsoid.cartesianToCartographic(camera.position);
    // 根据高度、地球半径等参数，计算出每秒钟相机需要平移的值
    const a = (465.2 / (6371 * 1000)) * (height + 6371 * 1000);
    const { currentTime } = clock;
    // 算出前后两次的时间间隔
    const interval = Cesium.JulianDate.toDate(currentTime) - Cesium.JulianDate.toDate(this.prevClockTime);
    this.prevClockTime = currentTime;
    // 调用api平移镜头
    camera.moveLeft((interval * a) / 1000);
  };

  // 3D 自转模拟效果
  public earthRotation3D = () => {
    const { camera, clock, scene } = this.viewer;
    if (this.scene.mode !== Cesium.SceneMode.SCENE3D || !clock.shouldAnimate) {
      this.prevClockTime = clock.currentTime;
      return;
    }

    const { height } = scene.globe.ellipsoid.cartesianToCartographic(camera.position);
    const a = (465.2 / (6371 * 1000)) * (height + 6371 * 1000);
    const { currentTime } = this.viewer.clock;
    const interval = Cesium.JulianDate.toDate(currentTime) - Cesium.JulianDate.toDate(this.prevClockTime);
    this.prevClockTime = currentTime;

    camera.rotate(Cesium.Cartesian3.UNIT_Z, (Math.PI / (24 * 60 * 60)) * (interval / 1000));
  };

  public startEarthRotation() {
    this.prevClockTime = this.viewer.clock.currentTime;
    if (this.scene.mode == Cesium.SceneMode.SCENE2D) {
      this.viewer.clock.onTick.addEventListener(this.earthRotation2D);
    } else if (this.scene.mode == Cesium.SceneMode.SCENE3D) {
      this.viewer.clock.onTick.addEventListener(this.earthRotation3D);
    }
  }

  public stopEarthRotation() {
    if (this.scene.mode == Cesium.SceneMode.SCENE2D) {
      this.viewer.clock.onTick.removeEventListener(this.earthRotation2D);
    } else if (this.scene.mode == Cesium.SceneMode.SCENE3D) {
      this.viewer.clock.onTick.removeEventListener(this.earthRotation3D);
    }
  }
}
