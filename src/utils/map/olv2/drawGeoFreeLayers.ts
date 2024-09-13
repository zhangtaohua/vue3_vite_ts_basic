import { Map as olMap } from "ol";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";

import { Draw, Modify, Snap } from "ol/interaction";
import { createBox, createRegularPolygon } from "ol/interaction/Draw";
import {
  GeometryCollection,
  Point,
  Polygon,
  LineString,
  MultiPoint,
  Circle as CircleGeom,
  MultiPolygon,
  MultiLineString,
} from "ol/geom";
import { circular, fromCircle } from "ol/geom/Polygon";
import { getDistance } from "ol/sphere";
import { transform } from "ol/proj";
import { getCenter } from "ol/extent";
import { unByKey } from "ol/Observable.js";
import { GeoJSON } from "ol/format";

import OlBase from "./base";

import OpenLayersMapEvent from "./mapEvent";
import type { EventOptions } from "./mapEventTypes";

import OpenLayerVueNodePopup from "./vueNodePopupLayers";
import type { VueNodeOptions } from "./vueNodePopupLayersTypes";

import { earthExtent, popupType, isCustomizeFlag, customMeta, isCustomOldDrawData } from "../geoConstant";

import { mapEventType } from "./olConstant";

import lodash from "lodash";

import type { StyleIconOptions } from "./styleTypes";
import type { GeojsonOptions } from "./geojsonLayersTypes";

import {
  createIconImagePoint,
  geodesicModifyGeometryFlag,
  createDrawNormalStyle,
  createDrawNormalActiveStyle,
  createDrawHighlightStyle,
  createSegmentStyle,
  createLabelStyle,
  createLabelLngLatStyle,
  createGeodesicStyle,
  createModifyStyle,
  createTipStyle,
  drawNormalStyleOptions,
  drawTextStyleOptions,
  segmentStyleOptions,
  labelStyleOptions,
  lnglatStyleOptions,
} from "./style";

import {
  calibrateWrapLongitudeLatitude,
  getGeoPointFromCoords,
  getGeoPointFromCoordsArray,
  getGeoPolygonFromPolygonArray,
  getGeoMultiPolygonFromPolygonArray,
  getGeoLineFromArray,
  getGeoMultiLineFromCoordsArray,
} from "../geoCommon";

import {
  getCorrdinateLongitudeLatitude,
  formatArea,
  formatLength,
  transformExtentTo3857,
  createCustomGeometryFunction,
  customCircleGeometryFunction,
  calcGeometryFunctionCoords,
} from "./olTools";
import { nanoid } from "nanoid";

import type { DrawOnlyGeoOptions, DrawOnlyGeoGeojsonOptions } from "./drawGeoFreeLayersTypes";

import {
  MAP_DRAW_TEXT,
  MAP_DRAW_POINT,
  MAP_DRAW_SQUARE,
  MAP_DRAW_RECTANGLE,
  MAP_DRAW_POLYGON,
  MAP_DRAW_LINE,
  MAP_DRAW_CIRCLE,
  MAP_DRAW_GEOMETRY_CIRCLE,
  MAP_DRAW_GEODESIC_CIRCLE,
  MAP_MEASURE_DISTANCE,
  MAP_MEASURE_AREA,
  MAP_DRAW_GEOMETRYCOLLECTION,
  drawActionType,
} from "../geoConstant";

const editPropsKeyName = "editProps";

import DrawTrash from "../dom/DrawTrash.vue";
import DrawTipShow from "../dom/DrawTipShow.vue";
import globalUseVar from "@/utils/common/globalUseVar";

export default class OlDrawOnlyGeo {
  public olBaseHandle: OlBase | null = null;
  public handle: olMap | null = null;

  public vuePopupIns: OpenLayerVueNodePopup | null = null;
  public mapEventIns: OpenLayersMapEvent | null = null;

  private __layers: any = null;
  private __layerIdPrefix = "DRAW_";
  private __drawData: any = {};
  private __crurentSelDrawData: any = {};
  private __currentFeature: any = null;
  private __currentOptions: any = null;

  public drawType = "";
  public drawTag: Draw | null = null;
  public snapTag: Snap | null = null;
  public drawModel = "";
  public modify: Modify | null = null;

  public interactionSource: VectorSource | null = null;
  public InteractionLayer: VectorLayer | null = null;

  public drawLayerZIndex = 20;
  public segmentStyles: any = null;
  public lableLngLatStyles: any = null;
  public labelStyles: any = null;
  public defaultModifyStyle: any = null;

  public sketchFeature: any = null;
  public listener: any = null;

  public dcPopupOptions: any = null;
  public dcEventSingleOptions: any = null;
  public dcEventDbclickOptions: any = null;
  public dcEventDragOptions: any = null;
  public dcEventPointMoveOptions: any = null;

  public isShowDcActionPopup: boolean | undefined = false;

  private customCallbackFunc: any = null;

  public innerT = (name: string) => {
    return `${name}`;
  };

  public updateDrawStyleFunction(
    feature: any,
    drawType: any,
    isShowSegments: boolean,
    isShowLngLat: boolean,
    isShowLabel: boolean,
    styleOptions: any,
  ) {
    let geoStyleOptions = { ...drawNormalStyleOptions() };

    let vertexStyleOptions = { ...lnglatStyleOptions };

    let lineStyleOptions = { ...segmentStyleOptions };

    let kmArealabelStyleOptions = { ...labelStyleOptions };

    let textStyleOptions = { ...drawTextStyleOptions() };

    if (styleOptions && styleOptions.geo) {
      geoStyleOptions = {
        width: styleOptions.geo.width,
        color: styleOptions.geo.color,
        fillColor: styleOptions.geo.fillColor,
        radius: styleOptions.geo.radius,
        radius2: styleOptions.geo.radius2,
        lineDash: styleOptions.geo.lineDash,
        iconWidth: styleOptions.geo.iconWidth,
        iconHeight: styleOptions.geo.iconHeight,
        iconPattern: styleOptions.geo.iconPattern,
        iconUrl: styleOptions.geo.iconUrl,
        iconAnchor: styleOptions.geo.iconAnchor,
        iconOffset: styleOptions.geo.iconOffset,
        arrowPattern: styleOptions.geo.arrowPattern,
      };
    }

    if (styleOptions && styleOptions.vertex) {
      vertexStyleOptions = {
        fontSize: styleOptions.vertex.fontSize,
        color: styleOptions.vertex.color,
        fillColor: styleOptions.vertex.fillColor,
      };
    }

    if (styleOptions && styleOptions.line) {
      lineStyleOptions = {
        fontSize: styleOptions.line.fontSize,
        color: styleOptions.line.color,
        fillColor: styleOptions.line.fillColor,
      };
    }

    if (styleOptions && styleOptions.label) {
      kmArealabelStyleOptions = {
        fontSize: styleOptions.label.fontSize,
        color: styleOptions.label.color,
        fillColor: styleOptions.label.fillColor,
      };
    }

    if (styleOptions && styleOptions.text) {
      textStyleOptions = {
        text: styleOptions.text.text || "点击编辑文本",
        fontSize: styleOptions.text.fontSize,
        offsetY: styleOptions.text.offsetY,
        offsetX: styleOptions.text.offsetX,
        padding: styleOptions.text.padding,
        textBaseline: styleOptions.text.textBaseline,
        color: styleOptions.text.color,
        fillColor: styleOptions.text.fillColor,
        rotation: styleOptions.text.rotation,
      };
    }

    // 这里还是为了兼容文本处理。
    let drawtypeTemp = null;
    if (this.__currentOptions) {
      drawtypeTemp = this.__currentOptions.shape;
    }
    console.log("updateDrawStyleFunction", drawtypeTemp);
    if (drawtypeTemp && drawtypeTemp == MAP_DRAW_TEXT) {
      geoStyleOptions.color = "rgba(24, 144, 255, 0)";
      geoStyleOptions.fillColor = "rgba(24, 144, 255, 0)";
      // 这是为了在第一次绘制完文本后，但文本没有值，
      // 此时强制更新一次样式，就需要设置一个文本，不然什么也看不见。
      if (!textStyleOptions.text) {
        textStyleOptions.text = "点击编辑文本";
      }
      // if (styleOptions && styleOptions.text && styleOptions.text.text) {
      //   geoStyleOptions.color = "rgba(24, 144, 255, 0)";
      //   geoStyleOptions.fillColor = "rgba(24, 144, 255, 0)";
      // } else {
      //   geoStyleOptions.color = "rgba(24, 144, 255, 1)";
      //   geoStyleOptions.fillColor = "rgba(24, 144, 255, .2)";
      // }
    }

    const styles = [createDrawNormalStyle(geoStyleOptions, textStyleOptions)];

    const geometry = feature.getGeometry();
    const type = geometry.getType();
    let point, lienLabel, areaLabel, line, coordinates;
    let isPolygon = false;

    if (!drawType || drawType === type) {
      if (type === MAP_DRAW_POINT) {
        coordinates = [geometry.getCoordinates()];
        isPolygon = false;
      } else if (type === MAP_DRAW_POLYGON) {
        point = geometry.getInteriorPoint();
        areaLabel = formatArea(geometry);
        coordinates = geometry.getCoordinates()[0];
        line = new LineString(geometry.getCoordinates()[0]);
        isPolygon = true;
      } else if (type === MAP_DRAW_LINE) {
        point = new Point(geometry.getLastCoordinate());
        lienLabel = formatLength(geometry);
        coordinates = geometry.getCoordinates();
        line = geometry;
        isPolygon = false;
      } else if (type === MAP_DRAW_CIRCLE) {
        point = new Point(geometry.getFirstCoordinate());
        const circle = fromCircle(geometry, 128);
        areaLabel = formatArea(circle);
        coordinates = [];
        coordinates.push(geometry.getCenter());
        coordinates.push(geometry.getLastCoordinate());
        coordinates[0][1] = coordinates[0][1] + 700000;
        isPolygon = false;
      } else if (type === MAP_DRAW_GEOMETRYCOLLECTION) {
        const geometries = geometry.getGeometries();
        for (let i = 0; i < geometries.length; i++) {
          if (geometries[i].getType() == MAP_DRAW_POLYGON) {
            areaLabel = formatArea(geometry);
          } else if (geometries[i].getType() == MAP_DRAW_POINT) {
            point = new Point(geometries[i].getCoordinates());
            const coord = geometries[i].getCoordinates();
            coord[1] = coord[1] + 700000;
            coordinates = [coord];
          }
        }
        isPolygon = false;
      }
    }

    if (isShowSegments && lineStyleOptions.fontSize && line) {
      let count = 0;
      const updateSegmentStyles: any = [];
      line.forEachSegment((a: any, b: any) => {
        const segment = new LineString([a, b]);
        const label = formatLength(segment);
        updateSegmentStyles.push(createSegmentStyle(lineStyleOptions));
        const segmentPoint = new Point(segment.getCoordinateAt(0.5));
        updateSegmentStyles[count].setGeometry(segmentPoint);
        updateSegmentStyles[count].getText().setText(label.lengthString);
        styles.push(updateSegmentStyles[count]);
        count++;
      });
    }

    if (isShowLngLat && vertexStyleOptions.fontSize && coordinates) {
      let count = 0;
      const lengths = isPolygon ? coordinates.length - 1 : coordinates.length;
      const updateLableLngLatStyles: any = [];
      for (let i = 0; i < lengths; i++) {
        const lnglatOrigin = transform(coordinates[i], "EPSG:3857", "EPSG:4326");
        const { longitude, latitude } = calibrateWrapLongitudeLatitude(lnglatOrigin[0], lnglatOrigin[1]);
        const lngLatLabel = `${longitude.toFixed(6)}, ${latitude.toFixed(6)}`;
        updateLableLngLatStyles.push(createLabelLngLatStyle(vertexStyleOptions));

        const segmentPoint = new Point(coordinates[i]);
        updateLableLngLatStyles[count].setGeometry(segmentPoint);
        updateLableLngLatStyles[count].getText().setText(lngLatLabel);
        styles.push(updateLableLngLatStyles[count]);
        count++;
      }
    }

    if (isShowLabel && kmArealabelStyleOptions.fontSize) {
      const updateLabelStyles = createLabelStyle(kmArealabelStyleOptions);
      if (type === MAP_DRAW_POLYGON || type === MAP_DRAW_CIRCLE || type === MAP_DRAW_GEOMETRYCOLLECTION) {
        updateLabelStyles.setGeometry(point);
        updateLabelStyles.getText().setText(areaLabel?.areaString);
        styles.push(updateLabelStyles);
      } else if (type === MAP_DRAW_LINE) {
        updateLabelStyles.setGeometry(point);
        updateLabelStyles.getText().setText(lienLabel?.lengthString);
        styles.push(updateLabelStyles);
      }
    }

    if (geoStyleOptions.iconPattern == "arrow") {
      if (geoStyleOptions.iconUrl) {
        geoStyleOptions.radius = geoStyleOptions.iconWidth;
        geoStyleOptions.radius2 = geoStyleOptions.iconHeight;
        geoStyleOptions.url = geoStyleOptions.iconUrl;

        if (geoStyleOptions.arrowPattern == "last") {
          const coordinatesTemp = geometry.getCoordinates();

          if (coordinatesTemp.length && coordinatesTemp.length >= 2) {
            const lines = coordinatesTemp.length - 1;
            let lineCount = 0;
            geometry.forEachSegment((start: any, end: any) => {
              lineCount++;
              if (lineCount == lines) {
                const dx = end[0] - start[0];
                const dy = end[1] - start[1];
                const rotation = Math.atan2(dy, dx);
                geoStyleOptions.rotation = -rotation;

                // arrows
                const arrowStyle = createIconImagePoint(geoStyleOptions as StyleIconOptions);
                const segmentPoint = new Point(end);
                arrowStyle.setGeometry(segmentPoint);
                styles.push(arrowStyle);
              }
            });
          }
        } else if (geoStyleOptions.arrowPattern == "every") {
          geometry.forEachSegment((start: any, end: any) => {
            const dx = end[0] - start[0];
            const dy = end[1] - start[1];
            const rotation = Math.atan2(dy, dx);
            geoStyleOptions.rotation = -rotation;

            // arrows
            const arrowStyle = createIconImagePoint(geoStyleOptions as StyleIconOptions);
            const segmentPoint = new Point(end);
            arrowStyle.setGeometry(segmentPoint);
            styles.push(arrowStyle);
          });
        } else if (geoStyleOptions.arrowPattern == "noNeed") {
        }
      }
    }

    return styles;
  }

  constructor(mapBaseIns: OlBase) {
    this.olBaseHandle = mapBaseIns;
    this.handle = mapBaseIns.handle;
    this.__layers = new Map();

    this.vuePopupIns = new OpenLayerVueNodePopup(mapBaseIns);
    this.mapEventIns = new OpenLayersMapEvent(mapBaseIns);

    this.segmentStyles = [createSegmentStyle()];
    this.lableLngLatStyles = [createLabelLngLatStyle()];
    this.labelStyles = createLabelStyle();

    this.interactionSource = new VectorSource();
    // this.interactionSource = new VectorSource({ wrapX: false });
    this.InteractionLayer = new VectorLayer({
      source: this.interactionSource,
      zIndex: this.olBaseHandle.getCurrentzIndex(),
      // extent: transformExtentTo3857(earthExtent),
    });

    const id = "CUSTOM_INTER_" + nanoid(10);
    this.InteractionLayer.set("id", this.__Id(id));
    this.InteractionLayer.set("name", this.__Name(id));

    this.defaultModifyStyle = new Modify({
      source: this.interactionSource,
    })
      .getOverlay()
      .getStyleFunction();

    this.snapTag = new Snap({
      source: this.interactionSource,
    });

    const layerObj = {
      source: this.interactionSource,
      layer: this.InteractionLayer,
    };

    if (this.handle) {
      this.handle.addLayer(this.InteractionLayer);
      this.__layers.set(this.__Id(id), layerObj);
    }

    this.setActionPopup();
  }

  public destructor() {
    this.mapEventIns!.destructor();
    this.vuePopupIns!.destructor();

    this.modify = null;
    this.snapTag = null;
    this.drawTag = null;
    this.clearLayer();
    this.olBaseHandle = null;
    this.handle = null;
    this.__layers = null;
  }

  private __Id(id: string) {
    return `${this.__layerIdPrefix}${id}`;
  }

  private __Name(name: string) {
    return `${this.__layerIdPrefix}${name}`;
  }

  public isShowTipPopup: boolean = false;

  public drawTipPopupOptions = {
    id: `${this.__layerIdPrefix}_tip_popup`,
    name: `${this.__layerIdPrefix}_tipvnode_popup`,
    vNode: DrawTipShow,
    customT: this.innerT,
    vNodeData: {},
    wrapX: true,
  };

  private __oldTipPosition = [0, 0];
  public drawTipNodePopupCb = (event: any) => {
    if (this.isShowTipPopup && this.drawTag) {
      if (event.coordinate) {
        this.__oldTipPosition = [...event.coordinate];
        const position = [...this.__oldTipPosition];
        if (position.length >= 2) {
          let zoom = 3;
          if (this.olBaseHandle) {
            zoom = this.olBaseHandle.getViewZoom();
          }
          let offset = 262144;
          if (zoom >= 3 && zoom < 20) {
            const pow = 21 - zoom;
            offset = Math.pow(2, pow);
          } else if (zoom >= 20) {
            offset = 1;
          }

          position[0] = position[0] + offset;
          this.vuePopupIns?.showPopupByID(this.drawTipPopupOptions.id, position);
        }
      }
    }
  };

  public drawTipEventPointMoveOptions = {
    id: `${this.__layerIdPrefix}_${nanoid(10)}_tipmap_event`,
    type: mapEventType.pointermove,
    cb: this.drawTipNodePopupCb,
    delay: 1,
    debounce: false,
  };

  public drawTipEventZoomOptions = {
    id: `${this.__layerIdPrefix}_${nanoid(10)}_tipmap_event`,
    type: mapEventType.rendercomplete,
    cb: this.drawTipNodePopupCb,
    delay: 1,
    debounce: false,
  };

  public setActionPopup() {
    this.dcPopupOptions = {
      id: `${this.__layerIdPrefix}dc_popup`,
      name: `${this.__layerIdPrefix}vnode_popup`,
      vNode: DrawTrash,
      vNodeData: {
        data: this.__crurentSelDrawData,
        cancelCb: () => {
          console.log("cancelCb", this.__crurentSelDrawData);
          console.log("cancelCb2", this.interactionSource);
          this.__removeSourceFeatureById(this.__crurentSelDrawData.id);
          this.vuePopupIns?.hiddenPopupByID(this.dcPopupOptions.id);
          this.vuePopupIns?.hiddenPopupByID(this.drawTipPopupOptions.id);

          this.customCallbackFunc = this.__currentOptions.callback;
          if (this.customCallbackFunc) {
            this.customCallbackFunc(drawActionType.delete, this.__crurentSelDrawData);
          }
        },
      },
      wrapX: true,
      callback: (feature: any) => {
        console.log("setActionPopup", feature);
        this.__currentFeature = feature;
        this.__crurentSelDrawData = feature.get("__drawData");
        this.__currentOptions = feature.get(customMeta);
        this.dcPopupOptions.vNodeData.data = this.__crurentSelDrawData;
        console.log("setActionPopup", feature, this.__crurentSelDrawData);
      },
      popupIsCenter: false,
      eventType: mapEventType.singleclick,
    };
    this.vuePopupIns?.addLayer(this.dcPopupOptions);

    const eventCb = this.dcNodePopupCb(this.dcPopupOptions);

    this.dcEventSingleOptions = {
      id: `${this.__layerIdPrefix}_${nanoid(10)}_map_event`,
      type: mapEventType.singleclick,
      cb: eventCb,
      delay: 300,
      debounce: false,
    };
    this.mapEventIns!.addEvent(this.dcEventSingleOptions);

    this.dcEventDbclickOptions = {
      id: `${this.__layerIdPrefix}_${nanoid(10)}_map_event`,
      type: mapEventType.dblclick,
      cb: eventCb,
      delay: 300,
      debounce: false,
    };
    this.mapEventIns!.addEvent(this.dcEventDbclickOptions);

    this.dcEventDragOptions = {
      id: `${this.__layerIdPrefix}_${nanoid(10)}_map_event`,
      type: mapEventType.pointerdrag,
      cb: eventCb,
      delay: 300,
      debounce: true,
    };
    this.mapEventIns!.addEvent(this.dcEventDragOptions);

    this.dcEventPointMoveOptions = {
      id: `${this.__layerIdPrefix}_${nanoid(10)}_map_event`,
      type: mapEventType.pointermove,
      cb: this.hightLightPointMoveHandle,
      delay: 10,
      debounce: false,
    };
    this.mapEventIns!.addEvent(this.dcEventPointMoveOptions);

    // 增加 绘制时 显示tip
    if (this.olBaseHandle && this.olBaseHandle.customT) {
      this.drawTipPopupOptions.customT = this.olBaseHandle.customT;
    }
    this.vuePopupIns?.addLayer(this.drawTipPopupOptions);
    this.mapEventIns!.addEvent(this.drawTipEventPointMoveOptions);
    this.mapEventIns!.addEvent(this.drawTipEventZoomOptions);
  }

  public __removeSourceFeatureById = (id: string) => {
    const removeFeature = this.interactionSource.getFeatureById(id);
    console.log("__removeSourceFeatureById", id, this.interactionSource.getFeatures());
    if (removeFeature) {
      this.interactionSource.removeFeature(removeFeature);
    }
  };

  // 取消绘制功能
  public cancelDraw = (event: any) => {
    if (this.drawTag || this.modify) {
      if (event.key == "Escape") {
        // if (event.code === "Escape") {
        this.removeallInteraction();
      }
    }
  };

  public setCancelDrawCB = () => {
    window.addEventListener("keyup", this.cancelDraw);
  };

  public removeCancelDrawCB = () => {
    window.removeEventListener("keyup", this.cancelDraw);
  };

  // 设置回退点击功能
  public drawBackOnePoint = (event: any) => {
    if (this.drawTag) {
      if (event.key == "Q" || event.key == "q" || event.key == "Backspace" || event.key == "Delete") {
        // if (event.code === "KeyQ") {
        this.drawTag.removeLastPoint();
      }
    }
  };

  public setDrawBackCB = () => {
    window.addEventListener("keyup", this.drawBackOnePoint);
  };

  public removeDrawBackCB = () => {
    window.removeEventListener("keyup", this.drawBackOnePoint);
  };

  // 回退 modify 点功能，不过测试好像没有用，代码先放在这里。
  public modifyBackOnePoint = (event: any) => {
    if (this.modify) {
      if (event.key == "Q" || event.key == "q" || event.key == "Backspace" || event.key == "Delete") {
        this.modify.removePoint();
      }
    }
  };

  public setModifyBackCB = () => {
    window.addEventListener("keyup", this.modifyBackOnePoint);
  };

  public removeModifyBackCB = () => {
    window.removeEventListener("keyup", this.modifyBackOnePoint);
  };

  public setMouseoutCb = () => {
    if (this.handle) {
      this.handle.getViewport().addEventListener("mouseout", this.removeallInteraction);
    }
  };

  public removeMouseoutCb = () => {
    if (this.handle) {
      this.handle.getViewport().removeEventListener("mouseout", this.removeallInteraction);
    }
  };

  public removeallInteraction() {
    if (this.handle) {
      // this.handle.un('singleclick', this.softDeleteConfrimFeature)
      if (this.drawTag) {
        this.handle.removeInteraction(this.drawTag);
        this.drawTag = null;
      }
      if (this.modify) {
        this.handle.removeInteraction(this.snapTag);
        this.handle.removeInteraction(this.modify);
        this.modify = null;
      }
      this.vuePopupIns?.hiddenPopupByID(this.drawTipPopupOptions.id);
      this.olBaseHandle?.setConstrainedView(false);
    }
  }

  public oldDcNodePopupFeature: any = null;
  public oldHoverNodePopupFeature: any = null;

  public hightLightPointMoveHandle = (event: any) => {
    let pixel = event.pixel;
    if (!pixel.length) {
      pixel = this.handle.getEventPixel(event.originalEvent);
    }
    const feature = this.handle.forEachFeatureAtPixel(pixel, function (feature: any) {
      const isCustom = feature.get(isCustomizeFlag);
      const metadata = feature.get(customMeta);
      const id = metadata?.id;
      if (isCustom && id && id.startsWith("draw_")) {
        return feature;
      }
    });

    if (feature) {
      // const geometry = feature.getGeometry();
      // const type = geometry.getType();
      // if (type === MAP_DRAW_POINT) {
      // } else if (type === MAP_DRAW_POLYGON) {
      // } else if (type === MAP_DRAW_LINE) {
      // } else if (type === MAP_DRAW_CIRCLE) {
      // } else if (type === MAP_DRAW_GEOMETRYCOLLECTION) {
      // }
      this.handle.getTargetElement().style.cursor = "pointer";

      // 暂时注释了，会有问题
      //  如果这个feature 已被选中了，就不再 设置 hover
      this.setHoverFeatureStyle(feature);
    } else {
      this.handle.getTargetElement().style.cursor = "";
      this.resetDcHoverFeatureStyle("hover");
    }
  };

  public dcNodePopupCb = (options: any) => {
    return (event: any) => {
      if (this.isShowDcActionPopup) {
        let pixel = event.pixel;
        if (!pixel.length) {
          pixel = this.handle.getEventPixel(event.originalEvent);
        }
        const feature = this.handle.forEachFeatureAtPixel(pixel, function (feature: any) {
          const isCustom = feature.get(isCustomizeFlag);
          const metadata = feature.get(customMeta);
          const id = metadata?.id;
          if (isCustom && id && id.startsWith("draw_")) {
            return feature;
          }
        });

        if (feature) {
          console.log("dcNodePopupCb 3", feature);
          if (options.callback) {
            options.callback(feature);
            this.vuePopupIns?.updateLayer(this.dcPopupOptions as VueNodeOptions);
          }
          let position = event.coordinate;
          if (options.popupIsCenter) {
            const featureExtent = feature.getGeometry().getExtent();
            position = getCenter(featureExtent);
          }
          this.vuePopupIns?.showPopupByID(this.dcPopupOptions.id, position);

          // 设置选中样式
          this.setDcFeatureStyle(feature);

          // 是否进入重新调整图形模式
          // 在 AI 绘制范围时不进行调整
          if (globalUseVar.route.name != "aiProcess") {
            if (!this.modify) {
              this.intoModifyMode(this.__currentOptions);
            }
          }
        } else {
          // if (options.eventType == mapEventType.pointermove) {
          //   this.vuePopupIns?.hiddenPopupByID(this.dcPopupOptions.id);
          // }
          this.vuePopupIns?.hiddenPopupByID(this.dcPopupOptions.id);
          this.resetDcHoverFeatureStyle("select");
        }
      }
    };
  };

  public setHoverFeatureStyle(feature: any) {
    // 如果这个feature 已被选中了，就不再 设置 hover
    if (this.oldDcNodePopupFeature) {
      if (this.oldDcNodePopupFeature.getId() == feature.getId()) {
        return null;
      }
    }

    // 如果已经设置了hover 就不要重复设置了
    if (this.oldHoverNodePopupFeature) {
      if (this.oldHoverNodePopupFeature.getId() == feature.getId()) {
        return null;
      } else {
        this.resetDcHoverFeatureStyle("hover");
      }
    }
    this.oldHoverNodePopupFeature = feature;

    const hoverStyle = {
      geo: {
        width: 3,
        color: "rgba(255, 127, 0, 1)",
        fillColor: "rgba(255, 127, 0, 0.1)",
        radius: 5,
        radius2: 5,
        lineDash: [0, 0],
        iconWidth: 8,
        iconHeight: 8,
        iconPattern: "pattern",
        iconUrl: "circle",
        iconAnchor: [0.5, 0.5],
        iconOffset: [0, 0],
        arrowPattern: "noNeed",
      },
    };

    const style = this.updateDrawStyleFunction(feature, null, false, false, false, hoverStyle);

    feature.setStyle(style);
  }

  public setDcFeatureStyle(feature: any) {
    if (this.oldDcNodePopupFeature) {
      this.resetDcHoverFeatureStyle("select");
    }
    this.oldDcNodePopupFeature = feature;

    const selectStyle = {
      geo: {
        width: 3,
        color: "rgba(241, 51, 13, 1)",
        fillColor: "rgba(241, 51, 13, 0.1)",
        radius: 5,
        radius2: 5,
        lineDash: [0, 0],
        iconWidth: 8,
        iconHeight: 8,
        iconPattern: "pattern",
        iconUrl: "circle",
        iconAnchor: [0.5, 0.5],
        iconOffset: [0, 0],
        arrowPattern: "noNeed",
      },
    };

    const style = this.updateDrawStyleFunction(feature, null, false, false, false, selectStyle);

    feature.setStyle(style);
  }

  public resetDcHoverFeatureStyle(whichFeature: string) {
    let featrue = this.oldDcNodePopupFeature;
    if (whichFeature === "hover") {
      if (
        this.oldDcNodePopupFeature &&
        this.oldHoverNodePopupFeature &&
        this.oldDcNodePopupFeature.getId() == this.oldHoverNodePopupFeature.getId()
      ) {
        return null;
      } else {
        featrue = this.oldHoverNodePopupFeature;
      }
    }

    // console.log("whichFeature", whichFeature, featrue && featrue.getId());
    // 清除高亮样式
    if (featrue) {
      const customMetaData = featrue.get(customMeta);
      let oldOptions: any = null;
      if (customMetaData) {
        oldOptions = {
          ...customMetaData,
        };
        // this.__currentOptions = oldOptions;
      }

      const isShowSegments = oldOptions.isShowSegments ?? false;
      const isShowLngLat = oldOptions.isShowLngLat ?? false;
      const isShowLabel = oldOptions.isShowLabel ?? false;

      const oldDrawData = featrue.get("__drawData");
      let oldGeojson: any = null;
      let oldGeojsonPorps: any = null;
      let oldGeojsonStyle: any = null;

      if (oldDrawData) {
        oldGeojson = oldDrawData["geojson"];
        if (oldGeojson) {
          oldGeojsonPorps = oldGeojson["properties"];
          if (oldGeojsonPorps) {
            oldGeojsonStyle = oldGeojsonPorps["style"];
          }
        }
      }

      const style = this.updateDrawStyleFunction(
        featrue,
        null,
        isShowSegments,
        isShowLngLat,
        isShowLabel,
        oldGeojsonStyle,
      );

      featrue.setStyle(style);
    }

    if (whichFeature === "hover") {
      this.oldHoverNodePopupFeature = null;
    } else if (whichFeature === "select") {
      this.oldDcNodePopupFeature = null;
    }
  }

  public drawStyleFunction(
    feature: any,
    drawType: any,
    isShowSegments: boolean,
    isShowLngLat: boolean,
    isShowLabel: boolean,
  ) {
    const geoStyleOptions = { ...drawNormalStyleOptions() };

    const textStyleOptions = { ...drawTextStyleOptions() };

    const drawtypeTemp = this.__currentOptions.shape;
    if (drawtypeTemp && drawtypeTemp == MAP_DRAW_TEXT) {
      geoStyleOptions.color = "rgba(24, 144, 255, 0)";
      geoStyleOptions.fillColor = "rgba(24, 144, 255, 0)";
      textStyleOptions.text = "点击编辑文本";
    }

    const styles = [createDrawNormalStyle(geoStyleOptions, textStyleOptions)];
    // // 为了 测地圆的绘制 方案一。
    // const modifyGeometry = feature.get(geodesicModifyGeometryFlag);
    // if (modifyGeometry) {
    //   styles = [createGeodesicStyle()];
    // }

    const geometry = feature.getGeometry();
    if (!geometry) {
      return null;
    }
    const type = geometry.getType();
    let point, lienLabel, areaLabel, line, coordinates;
    let isPolygon = false;

    if (!drawType || drawType === type) {
      if (type === MAP_DRAW_POINT) {
        coordinates = [geometry.getCoordinates()];
        isPolygon = false;
      } else if (type === MAP_DRAW_POLYGON) {
        point = geometry.getInteriorPoint();
        areaLabel = formatArea(geometry);
        coordinates = geometry.getCoordinates()[0];
        line = new LineString(geometry.getCoordinates()[0]);
        isPolygon = true;
      } else if (type === MAP_DRAW_LINE) {
        point = new Point(geometry.getLastCoordinate());
        lienLabel = formatLength(geometry);
        coordinates = geometry.getCoordinates();
        line = geometry;
        isPolygon = false;
      } else if (type === MAP_DRAW_CIRCLE) {
        point = new Point(geometry.getFirstCoordinate());
        const circle = fromCircle(geometry, 128);
        areaLabel = formatArea(circle);
        coordinates = [];
        coordinates.push(geometry.getCenter());
        coordinates.push(geometry.getLastCoordinate());
        coordinates[0][1] = coordinates[0][1] + 700000;
        isPolygon = false;
      } else if (type === MAP_DRAW_GEOMETRYCOLLECTION) {
        const geometries = geometry.getGeometries();
        for (let i = 0; i < geometries.length; i++) {
          if (geometries[i].getType() == MAP_DRAW_POLYGON) {
            areaLabel = formatArea(geometry);
          } else if (geometries[i].getType() == MAP_DRAW_POINT) {
            point = new Point(geometries[i].getCoordinates());
            const coord = geometries[i].getCoordinates();
            coord[1] = coord[1] + 700000;
            coordinates = [coord];
          }
        }
        isPolygon = false;
      }
    }

    if (isShowSegments && line) {
      let count = 0;
      line.forEachSegment((a: any, b: any) => {
        const segment = new LineString([a, b]);
        const label = formatLength(segment);
        if (this.segmentStyles.length - 1 < count) {
          // segmentStyles.clone()
          this.segmentStyles.push(createSegmentStyle({ ...segmentStyleOptions }));
        }
        const segmentPoint = new Point(segment.getCoordinateAt(0.5));
        this.segmentStyles[count].setGeometry(segmentPoint);
        this.segmentStyles[count].getText().setText(label.lengthString);
        styles.push(this.segmentStyles[count]);
        count++;
      });
    }

    if (isShowLngLat && coordinates) {
      let count = 0;
      const lengths = isPolygon ? coordinates.length - 1 : coordinates.length;
      for (let i = 0; i < lengths; i++) {
        const lnglatOrigin = transform(coordinates[i], "EPSG:3857", "EPSG:4326");
        const { longitude, latitude } = calibrateWrapLongitudeLatitude(lnglatOrigin[0], lnglatOrigin[1]);
        const lngLatLabel = `${longitude.toFixed(6)}, ${latitude.toFixed(6)}`;
        if (this.lableLngLatStyles.length - 1 < count) {
          this.lableLngLatStyles.push(createLabelLngLatStyle({ ...lnglatStyleOptions }));
        }
        const segmentPoint = new Point(coordinates[i]);
        this.lableLngLatStyles[count].setGeometry(segmentPoint);
        this.lableLngLatStyles[count].getText().setText(lngLatLabel);
        styles.push(this.lableLngLatStyles[count]);
        count++;
      }
    }

    if (isShowLabel) {
      this.labelStyles = createLabelStyle({ ...labelStyleOptions });
      if (type === MAP_DRAW_POLYGON || type === MAP_DRAW_CIRCLE || type === MAP_DRAW_GEOMETRYCOLLECTION) {
        this.labelStyles.setGeometry(point);
        this.labelStyles.getText().setText(areaLabel?.areaString);
        styles.push(this.labelStyles);
      } else if (type === MAP_DRAW_LINE) {
        this.labelStyles.setGeometry(point);
        this.labelStyles.getText().setText(lienLabel?.lengthString);
        styles.push(this.labelStyles);
      }
    }

    return styles;
  }

  public modifyStyleFunction(feature: any) {
    feature.get("features").forEach((modifyFeature: any) => {
      const modifyGeometry = modifyFeature.get(geodesicModifyGeometryFlag);
      if (modifyGeometry) {
        const modifyPoint = feature.getGeometry().getCoordinates();
        const geometries = modifyFeature.getGeometry().getGeometries();
        const polygon = geometries[0].getCoordinates()[0];
        const center = geometries[1].getCoordinates();
        const projection = this.handle.getView().getProjection();
        let first, last, radius;
        if (modifyPoint[0] === center[0] && modifyPoint[1] === center[1]) {
          // center is being modified
          // get unchanged radius from diameter between polygon vertices
          first = transform(polygon[0], projection, "EPSG:4326");
          last = transform(polygon[(polygon.length - 1) / 2], projection, "EPSG:4326");
          radius = getDistance(first, last) / 2;
        } else {
          // radius is being modified
          first = transform(center, projection, "EPSG:4326");
          last = transform(modifyPoint, projection, "EPSG:4326");
          radius = getDistance(first, last);
        }
        // update the polygon using new center or radius
        const circle = circular(transform(center, projection, "EPSG:4326"), radius, 128);
        circle.transform("EPSG:4326", projection);
        geometries[0].setCoordinates(circle.getCoordinates());
        // save changes to be applied at the end of the interaction
        modifyGeometry.setGeometries(geometries);
      }
    });
    return this.defaultModifyStyle(feature);
  }

  // todo
  // 获取的数据 太过 冗余，这里要想办法重新处理一下。
  public getDrawData = (options: DrawOnlyGeoOptions) => {
    return (event: any) => {
      const shape = options.shape;
      this.customCallbackFunc = options.callback;
      let formatGeoJson: any = null;
      let formatCoords: any = null;
      let areaTemp = {
        area: 0,
        areaString: "0 m2",
      };
      let lengthTemp = {
        length: 0,
        lengthString: "0 m",
      };
      let geoType = "";
      let center: any = [];

      let poly = null;
      let propFeature = null;
      let drawType: any = null;
      const featureId = `draw_${nanoid(10)}`;
      if (event.type == "drawend") {
        propFeature = event.feature;
        poly = event.feature.getGeometry();
        drawType = poly.getType();
      } else if (event.type == "modifyend") {
        const features = event.features.getArray();
        propFeature = features[0];
        poly = features[0].getGeometry();
        drawType = poly.getType();
      }

      propFeature.setId(featureId);
      propFeature.setProperties({
        [isCustomizeFlag]: true,
        [customMeta]: {
          ...options,
          id: featureId,
        },
      });

      if (shape == MAP_DRAW_TEXT || shape == MAP_DRAW_POINT) {
        geoType = MAP_DRAW_POINT;
        const coord = poly.getCoordinates();
        const polyType = poly.getType();

        if (polyType == "MultiPoint") {
          formatCoords = new MultiPoint(coord).transform("EPSG:3857", "EPSG:4326").getCoordinates();
          const featureExtent = poly.getExtent();
          const centerTemp = getCenter(featureExtent);
          const centerTemp2 = getCorrdinateLongitudeLatitude(centerTemp);
          center = [centerTemp2.longitude, centerTemp2.latitude];
        } else {
          formatCoords = getCorrdinateLongitudeLatitude(coord);
          formatCoords = [formatCoords.longitude, formatCoords.latitude];
          center = [formatCoords[0], formatCoords[1]];
        }

        this.__drawData = {
          id: featureId,
          shape: shape,
          geoType: geoType,
          coordinates: formatCoords,
          center: center,
          area: areaTemp,
          length: lengthTemp,
        };

        if (polyType == "MultiPoint") {
          formatGeoJson = getGeoPointFromCoordsArray(formatCoords, this.__drawData);
        } else {
          formatGeoJson = getGeoPointFromCoords(formatCoords, this.__drawData);
        }
      } else if (
        shape == MAP_DRAW_SQUARE ||
        shape == MAP_DRAW_RECTANGLE ||
        shape == MAP_DRAW_POLYGON ||
        shape == MAP_MEASURE_AREA
      ) {
        geoType = MAP_DRAW_POLYGON;
        const coord = poly.getCoordinates();
        const polyType = poly.getType();
        if (polyType == "MultiPolygon") {
          formatCoords = new MultiPolygon(coord).transform("EPSG:3857", "EPSG:4326").getCoordinates();
        } else {
          formatCoords = [this.getCoordinatesLngLat(coord)];
        }
        areaTemp = formatArea(poly);

        const featureExtent = poly.getExtent();
        const centerTemp = getCenter(featureExtent);
        const centerTemp2 = getCorrdinateLongitudeLatitude(centerTemp);
        center = [centerTemp2.longitude, centerTemp2.latitude];

        this.__drawData = {
          id: featureId,
          shape: shape,
          geoType: geoType,
          coordinates: formatCoords,
          center: center,
          area: areaTemp,
          length: lengthTemp,
        };

        if (polyType == "MultiPolygon") {
          formatGeoJson = getGeoMultiPolygonFromPolygonArray(formatCoords, this.__drawData);
        } else {
          formatGeoJson = getGeoPolygonFromPolygonArray(formatCoords, this.__drawData);
        }
      } else if (shape == MAP_DRAW_LINE || shape == MAP_MEASURE_DISTANCE) {
        geoType = MAP_DRAW_LINE;
        const polyType = poly.getType();

        const coord = [poly.getCoordinates()];
        if (polyType == "MultiLineString") {
          formatCoords = new MultiLineString(coord).transform("EPSG:3857", "EPSG:4326").getCoordinates();
          const featureExtent = poly.getExtent();
          const centerTemp = getCenter(featureExtent);
          const centerTemp2 = getCorrdinateLongitudeLatitude(centerTemp);
          center = [centerTemp2.longitude, centerTemp2.latitude];
        } else {
          formatCoords = this.getCoordinatesLngLat(coord);
          // center 这里可能有问题，要针对 MultiLineString 单独处理
          const centerLength = Math.floor(formatCoords.length / 2);
          const centerTemp = formatCoords[centerLength];
          center = [centerTemp[0], centerTemp[1]];
        }
        lengthTemp = formatLength(poly);

        this.__drawData = {
          id: featureId,
          shape: shape,
          geoType: geoType,
          coordinates: formatCoords,
          center: center,
          area: areaTemp,
          length: lengthTemp,
        };

        if (polyType == "MultiLineString") {
          formatGeoJson = getGeoMultiLineFromCoordsArray(formatCoords, this.__drawData);
        } else {
          formatGeoJson = getGeoLineFromArray(formatCoords, this.__drawData);
        }
      } else if (shape == MAP_DRAW_GEOMETRY_CIRCLE) {
        geoType = MAP_DRAW_POLYGON;
        const circle = fromCircle(poly, 128);
        const coordinates = circle.getCoordinates();
        formatCoords = [this.getCoordinatesLngLat(coordinates)];
        areaTemp = formatArea(circle);

        const centerTemp = poly.getCenter();
        const centerTemp2 = getCorrdinateLongitudeLatitude(centerTemp);
        center = [centerTemp2.longitude, centerTemp2.latitude];

        this.__drawData = {
          id: featureId,
          shape: shape,
          geoType: geoType,
          coordinates: formatCoords,
          center: center,
          area: areaTemp,
          length: lengthTemp,
        };

        formatGeoJson = getGeoPolygonFromPolygonArray(formatCoords, this.__drawData);
      } else if (shape == MAP_DRAW_GEODESIC_CIRCLE) {
        geoType = MAP_DRAW_POLYGON;
        if (poly.getType() == MAP_DRAW_GEOMETRYCOLLECTION) {
          const geometries = poly.getGeometries();
          if (geometries.length == 2) {
            if (geometries[1].getType() == MAP_DRAW_POINT) {
              const coord = geometries[1].getCoordinates();
              const centerTemp2 = getCorrdinateLongitudeLatitude(coord);
              center = [centerTemp2.longitude, centerTemp2.latitude];
            }
          }
          for (let i = 0; i < geometries.length; i++) {
            if (geometries[i].getType() == MAP_DRAW_POLYGON) {
              const coord = geometries[i].getCoordinates();
              formatCoords = [this.getCoordinatesLngLat(coord)];
              areaTemp = formatArea(poly);

              if (center && center.length !== 2) {
                const featureExtent = poly.getExtent();
                const centerTemp = getCenter(featureExtent);
                const centerTemp2 = getCorrdinateLongitudeLatitude(centerTemp);
                center = [centerTemp2.longitude, centerTemp2.latitude];
                console.log(MAP_DRAW_GEOMETRYCOLLECTION, poly, featureExtent, geometries[i].getExtent());
              }

              this.__drawData = {
                id: featureId,
                shape: shape,
                geoType: geoType,
                coordinates: formatCoords,
                center: center,
                area: areaTemp,
                length: lengthTemp,
              };

              formatGeoJson = getGeoPolygonFromPolygonArray(formatCoords, this.__drawData);
              break;
            }
          }
        }
      }

      this.__drawData = {
        id: featureId,
        shape: shape,
        geoType: geoType,
        coordinates: formatCoords,
        center: center,
        geojson: formatGeoJson,
        area: areaTemp,
        length: lengthTemp,
      };

      this.__crurentSelDrawData = lodash.cloneDeep(this.__drawData);

      // 强制更新一次样式，不然切换到文本时样式都会消失
      if (event.type == "drawend") {
        const isShowSegments = options.isShowSegments ?? false;
        const isShowLngLat = options.isShowLngLat ?? false;
        const isShowLabel = options.isShowLabel ?? false;

        const style = this.updateDrawStyleFunction(propFeature, null, isShowSegments, isShowLngLat, isShowLabel, null);

        propFeature.setStyle(style);
      } else if (event.type == "modifyend") {
        const isShowSegments = options.isShowSegments ?? false;
        const isShowLngLat = options.isShowLngLat ?? false;
        const isShowLabel = options.isShowLabel ?? false;

        const oldDrawData = propFeature.get("__drawData");
        let oldGeojson: any = null;
        let oldGeojsonPorps: any = null;
        let oldGeojsonStyle: any = null;

        if (oldDrawData) {
          oldGeojson = oldDrawData["geojson"];
          if (oldGeojson) {
            oldGeojsonPorps = oldGeojson["properties"];
            if (oldGeojsonPorps) {
              oldGeojsonStyle = oldGeojsonPorps["style"];
            }
          }
        }
        console.log("oldGeojson", oldDrawData, oldGeojson, oldGeojsonStyle);
        const style = this.updateDrawStyleFunction(
          propFeature,
          null,
          isShowSegments,
          isShowLngLat,
          isShowLabel,
          oldGeojsonStyle,
        );

        propFeature.setStyle(style);

        // 要把修改过的旧的值设置回去。
        if (oldGeojsonStyle) {
          this.__drawData["geojson"]["properties"][editPropsKeyName] =
            oldDrawData["geojson"]["properties"][editPropsKeyName];
          this.__drawData["geojson"]["properties"]["style"] = oldGeojsonStyle;
        }
      }

      // 这是为了后面加载回以前画的数据，不得不这么做的原因。
      this.__drawData.oldDrawOptions = lodash.cloneDeep(options);
      this.__drawData["geojson"]["properties"]["__drawData"] = lodash.cloneDeep(this.__drawData);
      propFeature.set("__drawData", this.__drawData);

      if (this.customCallbackFunc) {
        if (event.type == "drawend") {
          this.customCallbackFunc(drawActionType.draw, this.__drawData);
        } else if (event.type == "modifyend") {
          this.customCallbackFunc(drawActionType.modify, this.__drawData);
        }
      }
    };
  };

  public drawShape(options: DrawOnlyGeoOptions) {
    const shape = options.shape;
    const isClear = options.isClear ?? false;
    const isFreehand = options.isFreehand ?? false;

    const isShowSegments = options.isShowSegments ?? false;
    const isShowLngLat = options.isShowLngLat ?? false;
    const isShowLabel = options.isShowLabel ?? false;
    this.isShowDcActionPopup = options.isShowAction ?? false;
    this.isShowTipPopup = options.isShowTip ?? false;

    if (this.handle && this.olBaseHandle) {
      if (isClear) {
        this.clearAllDrawShape();
      }
      // 隐藏了显示着的控件。
      if (this.dcPopupOptions && this.dcPopupOptions.id) {
        this.vuePopupIns?.hiddenPopupByID(this.dcPopupOptions.id);
      }

      // 隐藏 tip 的控件。
      if (!this.isShowTipPopup) {
        this.vuePopupIns?.hiddenPopupByID(this.drawTipPopupOptions.id);
      }

      this.removeCancelDrawCB();
      this.setCancelDrawCB();
      this.removeallInteraction();
      this.olBaseHandle.setConstrainedView(true);

      this.__currentOptions = options;
      this.__drawData = null;
      // 要不要先清楚以前的图层呢？
      this.drawType = shape;
      this.drawModel = shape;
      this.customCallbackFunc = options.callback;

      let geometryFunction: any = null;

      if (shape === MAP_DRAW_TEXT) {
        this.drawType = MAP_DRAW_POINT;
      } else if (shape == MAP_DRAW_POINT) {
        this.drawType = MAP_DRAW_POINT;
      } else if (shape == MAP_DRAW_SQUARE) {
        this.drawType = MAP_DRAW_CIRCLE;
        // geometryFunction = createRegularPolygon(4);

        // 为了控制经度在 -180 到 180 之间
        geometryFunction = createCustomGeometryFunction(createRegularPolygon(4));
      } else if (shape == MAP_DRAW_RECTANGLE) {
        this.drawType = MAP_DRAW_CIRCLE;
        // geometryFunction = createBox();

        // 为了控制经度在 -180 到 180 之间
        geometryFunction = createCustomGeometryFunction(createBox());
      } else if (shape == MAP_DRAW_POLYGON) {
        this.drawType = MAP_DRAW_POLYGON;
      } else if (shape == MAP_DRAW_LINE) {
        this.drawType = MAP_DRAW_LINE;
      } else if (shape == MAP_DRAW_GEOMETRY_CIRCLE) {
        this.drawType = MAP_DRAW_GEOMETRY_CIRCLE;
        // 为了控制经度在 -180 到 180 之间 ,如果不考虑图形变迁，则可删除
        geometryFunction = customCircleGeometryFunction;
      } else if (shape == MAP_DRAW_GEODESIC_CIRCLE) {
        this.drawType = MAP_DRAW_CIRCLE;
        geometryFunction = function (coordinates: any, geometry: any, projection: any) {
          if (!geometry) {
            geometry = new GeometryCollection([new Polygon([]), new Point(coordinates[0])]);
          }
          const geometries = geometry.getGeometries();
          const center = transform(coordinates[0], projection, "EPSG:4326");
          const last = transform(coordinates[1], projection, "EPSG:4326");
          const radius = getDistance(center, last);
          const circle = circular(center, radius, 128);
          calcGeometryFunctionCoords(circle);
          circle.transform("EPSG:4326", projection);
          geometries[0].setCoordinates(circle.getCoordinates());
          geometry.setGeometries(geometries);
          return geometry;
        };
      } else if (shape == MAP_MEASURE_DISTANCE) {
        this.drawType = MAP_DRAW_LINE;
      } else if (shape == MAP_MEASURE_AREA) {
        this.drawType = MAP_DRAW_POLYGON;
      }

      if (this.drawTag) {
        this.drawTag = null;
      }

      this.drawTag = new Draw({
        source: this.interactionSource,
        type: this.drawType,
        geometryFunction: geometryFunction,
        style: (feature: any) => {
          return this.drawStyleFunction(feature, this.drawType, isShowSegments, isShowLngLat, isShowLabel);
        },
        freehand: isFreehand,
        wrapX: false,
      });

      // this.InteractionLayer.setStyle(createDrawNormalStyle());
      this.InteractionLayer.setStyle((featrue: any) => {
        return this.drawStyleFunction(featrue, null, isShowSegments, isShowLngLat, isShowLabel);
      });

      this.drawTag.on("drawstart", (event: any) => {
        this.olBaseHandle.setConstrainedView(true);
        // if (this.interactionSource.getFeatures().length !== 0) {
        //   this.interactionSource.clear();
        // }
        // console.log("drawstart", event);
        if (this.dcPopupOptions && this.dcPopupOptions.id) {
          this.vuePopupIns?.hiddenPopupByID(this.dcPopupOptions.id);
        }
        this.setDrawBackCB();
        this.drawLayerZIndex = this.olBaseHandle.getCurrentzIndex() + 1;
        this.InteractionLayer.setZIndex(this.drawLayerZIndex);
        if (options.needModify && this.modify) {
          this.modify.setActive(false);
        }

        // 以下是为了获取 geo 信息进行处理。
        // this.sketchFeature = event.feature;
        // let tooltipCoord = event.coordinate;
        // this.listener = this.sketchFeature.getGeometry().on("change", (e: any) => {
        //   // 在这里可以获取geo 信息进行处理。
        //   console.log("listener", e);
        // });
      });

      this.drawTag.on("drawend", (event: any) => {
        this.olBaseHandle.setConstrainedView(false);

        // console.log("drawend", event, event.feature.getGeometry());
        this.removeDrawBackCB();
        // this.sketchFeature = null;
        // unByKey(this.listener);
        if (options.needModify && this.modify) {
          this.modify.setActive(true);
        }

        this.getDrawData(options)(event);

        if (options.once) {
          if (!options.needModify) {
            if (this.drawTag) {
              this.removeallInteraction();
            }
          } else {
            if (this.drawTag) {
              this.handle.removeInteraction(this.drawTag);
              this.drawTag = null;
            }
          }
          this.removeCancelDrawCB();
        } else {
          if (!options.needModify) {
            this.handle.removeInteraction(this.modify);
            this.handle.removeInteraction(this.snapTag);
          }
        }
      });

      if (options.needModify) {
        // 如何消除旧的 modify ???
        if (this.modify) {
          this.modify = null;
        }

        this.modify = new Modify({
          source: this.interactionSource,
          style: (feature: any) => {
            return this.modifyStyleFunction(feature);
          },
        });

        this.modify.on("modifystart", (event: any) => {
          this.olBaseHandle.setConstrainedView(true);

          if (this.dcPopupOptions && this.dcPopupOptions.id) {
            this.vuePopupIns?.hiddenPopupByID(this.dcPopupOptions.id);
          }
          event.features.forEach((feature: any) => {
            const geometry = feature.getGeometry();
            if (geometry.getType() === MAP_DRAW_GEOMETRYCOLLECTION) {
              feature.set(geodesicModifyGeometryFlag, geometry.clone(), true);
            }
          });
        });

        this.modify.on("modifyend", (event: any) => {
          this.olBaseHandle.setConstrainedView(false);

          event.features.forEach((feature: any) => {
            const modifyGeometry = feature.get(geodesicModifyGeometryFlag);
            if (modifyGeometry) {
              feature.setGeometry(modifyGeometry);
              feature.unset(geodesicModifyGeometryFlag, true);
            }
          });
          // 因为有可能会去修改别的图形，所以这里要做处理
          const features = event.features.getArray();
          const propFeature = features[0];
          const customMetaData = propFeature.get(customMeta);
          let oldOptions: any = null;
          if (customMetaData) {
            oldOptions = {
              ...customMetaData,
            };
          }
          console.log("modifyend", oldOptions, options);
          if (oldOptions) {
            this.__currentOptions = oldOptions;
            this.getDrawData(oldOptions)(event);
          } else {
            this.__currentOptions = options;
            this.getDrawData(options)(event);
          }
        });
      }

      this.handle.addInteraction(this.drawTag);
      this.handle.addInteraction(this.snapTag);
      if (options.needModify) {
        this.handle.addInteraction(this.modify);
        this.modify.setActive(true);
      }
    }
  }

  public intoModifyMode = (options: any) => {
    if (this.modify) {
      return;
    }

    this.removeCancelDrawCB();
    this.setCancelDrawCB();

    this.modify = new Modify({
      source: this.interactionSource,
      style: (feature: any) => {
        return this.modifyStyleFunction(feature);
      },
    });

    this.modify.on("modifystart", (event: any) => {
      this.olBaseHandle.setConstrainedView(true);

      if (this.dcPopupOptions && this.dcPopupOptions.id) {
        this.vuePopupIns?.hiddenPopupByID(this.dcPopupOptions.id);
      }
      event.features.forEach((feature: any) => {
        const geometry = feature.getGeometry();
        if (geometry.getType() === MAP_DRAW_GEOMETRYCOLLECTION) {
          feature.set(geodesicModifyGeometryFlag, geometry.clone(), true);
        }
      });
    });

    this.modify.on("modifyend", (event: any) => {
      this.olBaseHandle.setConstrainedView(false);

      event.features.forEach((feature: any) => {
        const modifyGeometry = feature.get(geodesicModifyGeometryFlag);
        if (modifyGeometry) {
          feature.setGeometry(modifyGeometry);
          feature.unset(geodesicModifyGeometryFlag, true);
        }
      });
      // 因为有可能会去修改别的图形，所以这里要做处理
      const features = event.features.getArray();
      const propFeature = features[0];
      const customMetaData = propFeature.get(customMeta);
      let oldOptions: any = null;
      if (customMetaData) {
        oldOptions = {
          ...customMetaData,
        };
      }
      console.log("modifyend 2", event.features, oldOptions, options);
      if (oldOptions) {
        this.__currentOptions = oldOptions;
        this.getDrawData(oldOptions)(event);
      } else {
        this.__currentOptions = options;
        this.getDrawData(options)(event);
      }
    });

    this.handle.addInteraction(this.snapTag);
    this.handle.addInteraction(this.modify);
    this.modify.setActive(true);
  };

  public outModifyMode() {
    if (this.handle) {
      this.removeCancelDrawCB();
      if (this.modify) {
        this.handle.removeInteraction(this.modify);
        this.handle.removeInteraction(this.snapTag);
        this.modify = null;
      }
    }
  }

  public getCoordinatesLngLat(coordinates: any) {
    const coordinatesNew: any = [];
    coordinates[0].forEach((coordinate: any) => {
      const lngLatOrigin = transform(coordinate, "EPSG:3857", "EPSG:4326");
      const { longitude, latitude } = calibrateWrapLongitudeLatitude(lngLatOrigin[0], lngLatOrigin[1]);
      coordinatesNew.push([longitude, latitude]);
    });

    return coordinatesNew;
  }

  public updateAllDrawDataLabelStyle(
    isShowSegments: boolean,
    isShowLngLat: boolean,
    isShowLabel: boolean,
    isShowTip: boolean,
  ) {
    this.isShowTipPopup = isShowTip;
    // 隐藏 tip 的控件。
    if (!this.isShowTipPopup) {
      this.vuePopupIns?.hiddenPopupByID(this.drawTipPopupOptions.id);
    }

    this.interactionSource.forEachFeature((feature: any) => {
      const isCustom = feature.get(isCustomizeFlag);
      const metadata = feature.get(customMeta);

      // metadata = {
      //   ...metadata,
      //   isShowLabel: isShowLabel,
      //   isShowLngLat: isShowLngLat,
      //   isShowSegments: isShowSegments,
      //   isShowTip: isShowTip,
      // };

      metadata.isShowLabel = isShowLabel;
      metadata.isShowLngLat = isShowLngLat;
      metadata.isShowSegments = isShowSegments;
      metadata.isShowTip = isShowTip;

      feature.setProperties({
        [customMeta]: metadata,
      });

      const oldDrawData = feature.get("__drawData");
      let oldGeojson: any = null;
      let oldGeojsonPorps: any = null;
      let oldGeojsonStyle: any = null;
      if (oldDrawData) {
        oldGeojson = oldDrawData["geojson"];
        if (oldGeojson) {
          oldGeojsonPorps = oldGeojson["properties"];
          if (oldGeojsonPorps) {
            oldGeojsonStyle = oldGeojsonPorps["style"];
          }
        }
      }

      console.log("updateAllDrawDataLabelStyle featrue", feature, metadata);

      if (isCustom) {
        const style = this.updateDrawStyleFunction(
          feature,
          null,
          isShowSegments,
          isShowLngLat,
          isShowLabel,
          oldGeojsonStyle,
        );

        feature.setStyle(style);
      }
    });
  }

  public getAllDrawData() {
    const allGeojson = {
      type: "FeatureCollection",
      features: [],
    };

    this.interactionSource.forEachFeature((feature: any) => {
      // console.log("getAllDrawData featrue", feature);
      const isCustom = feature.get(isCustomizeFlag);
      // const metadata = feature.get(customMeta);
      const drawData = feature.get("__drawData");
      if (isCustom) {
        const geojosnTemp = lodash.cloneDeep(drawData.geojson);
        allGeojson.features.push(geojosnTemp);
      }
    });

    return allGeojson;
  }

  public saveAllDrawData(fileName = "geojson.json") {
    const allGeojson = this.getAllDrawData();
    if (allGeojson && allGeojson.features && allGeojson.features.length) {
      const allGeojsonStr = JSON.stringify(allGeojson);
      const blob = new Blob([allGeojsonStr], { type: "application/json" });

      const url = URL.createObjectURL(blob);
      const downloadBtn = document.createElement("a");
      downloadBtn.href = url;
      downloadBtn.download = fileName;
      document.body.appendChild(downloadBtn);
      downloadBtn.click();
      document.body.removeChild(downloadBtn);
      return allGeojson;
    } else {
      return null;
    }
  }

  public addGeojsonData(options: any) {
    if (!options.data || !options.id) {
      return null;
    }
    // 为了能编辑新加载的数据
    this.isShowDcActionPopup = options.isShowAction ?? false;

    // 为了不串了绘制属性。
    this.__currentOptions = null;

    const GeoJsonReader = new GeoJSON({
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857",
    });

    const featrues = GeoJsonReader.readFeatures(options.data);

    this.interactionSource.addFeatures(featrues);

    const featureLength = featrues.length;
    let handFeatureIndex = 0;
    console.log("index1", handFeatureIndex, featureLength, featrues);

    // this.interactionSource.forEachFeature((feature: any) => {
    featrues.forEach((feature: any) => {
      const customMetaData = feature.get(customMeta);
      const isCustomOldDraw = feature.get(isCustomOldDrawData);
      const isCustom = feature.get(isCustomizeFlag);

      // todo  解决边界 180 变成 -180 180 变成180 的情况

      // console.log("geojosn", customMetaData, isCustomOldDraw, isCustom);
      if (!isCustomOldDraw && isCustom && customMetaData) {
      } else {
        const oldCalcDrawData = feature.get("__drawData");
        console.log("geojosn2", oldCalcDrawData);
        // 恢复其旧的ID
        let oldId = oldCalcDrawData && oldCalcDrawData.id;
        console.log("geojosn3", oldId);
        if (!oldId) {
          oldId = `draw_${nanoid(10)}`;
        }

        feature.setId(oldId);

        // 恢复其旧的样式
        let isShowSegments = options.isShowSegments;
        let isShowLngLat = options.isShowLngLat;
        let isShowLabel = options.isShowLabel;

        const meta = {
          [isCustomizeFlag]: true,
          [customMeta]: {
            id: oldId,
            addId: options.id,
          },
          [isCustomOldDrawData]: true, // 为了只删除增加进来的数据。
        };

        const oldGeojsonStyle = feature.get("style");
        const oldGeojsonProps = feature.get("editProps");

        if (oldCalcDrawData) {
          if (oldCalcDrawData.oldDrawOptions) {
            const oldDrawOptions = oldCalcDrawData.oldDrawOptions;
            isShowSegments = oldDrawOptions.isShowSegments ?? true;
            isShowLngLat = oldDrawOptions.isShowLngLat ?? true;
            isShowLabel = oldDrawOptions.isShowLabel ?? true;
            this.__currentOptions = oldDrawOptions;
            meta[customMeta] = {
              ...oldDrawOptions,
              callback: options.callback,
              id: oldId,
              addId: options.id,
            };
          }

          oldCalcDrawData["geojson"]["properties"][editPropsKeyName] = lodash.cloneDeep(oldGeojsonProps);

          oldCalcDrawData["geojson"]["properties"]["style"] = lodash.cloneDeep(oldGeojsonStyle);
          oldCalcDrawData["geojson"]["properties"]["__drawData"] = lodash.cloneDeep(oldCalcDrawData);

          if (options.callback) {
            options.callback(drawActionType.draw, oldCalcDrawData);
          }
        } else {
          const poly = feature.getGeometry();
          const drawType = poly.getType();
          console.log("geojson drawType", drawType);
          if (drawType === "Point" || drawType === "MultiPoint") {
            options.shape = MAP_DRAW_POINT;
          } else if (drawType === "Polygon" || drawType === "MultiPolygon") {
            options.shape = MAP_DRAW_POLYGON;
          } else if (drawType === "LineString" || drawType === "MultiLineString") {
            options.shape = MAP_DRAW_LINE;
          } else {
            options.shape = MAP_DRAW_POLYGON;
          }
          meta[customMeta] = {
            ...options,
            id: oldId,
            addId: options.id,
          };
          this.getDrawData(options)({
            type: "drawend",
            feature: feature,
          });
        }

        let style: any = null;

        if (oldGeojsonStyle) {
          style = this.updateDrawStyleFunction(
            feature,
            null,
            isShowSegments,
            isShowLngLat,
            isShowLabel,
            oldGeojsonStyle,
          );
        } else {
          style = this.updateDrawStyleFunction(feature, null, isShowSegments, isShowLngLat, isShowLabel, null);
        }
        feature.setStyle(style);
        feature.setProperties(meta);
        feature.setProperties({
          [isCustomOldDrawData]: true, // 为了只删除增加进来的数据。
        });
      }

      handFeatureIndex = handFeatureIndex + 1;
      console.log("index", handFeatureIndex, featureLength);
      if (handFeatureIndex === featureLength) {
        console.log("featureLength", feature.getGeometry().getCoordinates());
        this.olBaseHandle!.fitToFeature(feature, [120, 120, 120, 120]);
      }
    });
  }

  public removeGeojsonData(options: GeojsonOptions) {
    const needRemoveFeature: any = [];
    this.interactionSource.forEachFeature((feature: any) => {
      const customMetaData = feature.get(customMeta);
      const isCustomOldDraw = feature.get(isCustomOldDrawData);
      // console.log("removeGeojsonData", feature, customMetaData, isCustomOldDraw);

      if (isCustomOldDraw) {
        if (customMetaData && customMetaData.addId == options.id) {
          needRemoveFeature.push(feature);
        }
      }
    });

    needRemoveFeature.forEach((feature: any) => {
      this.interactionSource.removeFeature(feature);
    });
  }

  public getOrginDrawData() {
    return this.__drawData;
  }

  public clearAllDrawShape() {
    if (this.dcPopupOptions && this.dcPopupOptions.id) {
      this.vuePopupIns?.hiddenPopupByID(this.dcPopupOptions.id);
    }
    this.interactionSource && this.interactionSource.clear();
  }

  public hasLayerByID(id: string) {
    if (this.olBaseHandle && this.__layers.size) {
      return this.__layers.has(this.__Id(id));
    }
    return false;
  }

  public removeLayerByID(id: string) {
    if (this.handle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        this.handle.removeLayer(layerObj.layer);
        this.__layers.delete(this.__Id(id));
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public clearLayer() {
    if (this.handle && this.__layers.size) {
      this.__layers.forEach((layerObj: any) => {
        this.handle.removeLayer(layerObj.layer);
      });
      this.__layers.clear();
      return true;
    } else {
      return false;
    }
  }
}
