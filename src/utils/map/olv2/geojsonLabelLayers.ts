// 此文件其实大部分和 geojsonLayers.ts 文件一样，
// 如果不用加载 本项目中draw Label 实例所画的geojson文件。可以不用此文件。
// 或者不用 geojsonLayers.ts 文件，而直接用此文件，是兼容 geojsonLayers.ts 所有功能的。
// 如果修改了 geojsonLayers.ts  文件功能 记得回来保持修改此文件。
import { Map as olMap } from "ol";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { getCenter } from "ol/extent";
import { Style } from "ol/style";
import { GeoJSON } from "ol/format";

import { formatArea, formatLength } from "./olTools";
import { GeometryCollection, Point, Polygon, LineString, MultiPoint, Circle as CircleGeom } from "ol/geom";
import { circular, fromCircle } from "ol/geom/Polygon";
import { transform } from "ol/proj";

import { nanoid } from "nanoid";

import OlBase from "./base";

import OpenLayersMapEvent from "./mapEvent";
import type { EventOptions } from "./mapEventTypes";

import OpenLayerVueNodePopup from "./vueNodePopupLayers";
import type { VueNodeOptions } from "./vueNodePopupLayersTypes";

import OpenLayersPopup from "./popupLayers";

import { transformExtentTo3857 } from "./olTools";

import type { GeojsonOptions } from "./geojsonLayersTypes";

import {
  createFill,
  createStroke,
  createCircle,
  createText,
  getColor,
  createGeoPoint,
  geojsonStyleFunction,
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

import { earthExtent, popupType, isCustomizeFlag, customMeta, isCustomOldDrawData } from "../geoConstant";

import { mapEventType } from "./olConstant";

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

import {
  calibrateWrapLongitudeLatitude,
  getGeoPointFromCoords,
  getGeoPolygonFromPolygonArray,
  getGeoLineFromArray,
} from "../geoCommon";

const editPropsKeyName = "editProps";

export default class OlGeojsonLabelLayers {
  public olBaseHandle: OlBase | null = null;
  public handle: olMap | null = null;

  public vuePopupIns: OpenLayerVueNodePopup | null = null;
  public normalPopupIns: OpenLayersPopup | null = null;
  public mapEventIns: OpenLayersMapEvent | null = null;

  private __layers: any = null;
  private __layerIdPrefix = "GEOJSON_BASIC_";

  private __currentOptions: any = null;

  constructor(mapBaseIns: OlBase) {
    this.olBaseHandle = mapBaseIns;
    this.handle = mapBaseIns.handle;
    this.__layers = new Map();

    this.mapEventIns = new OpenLayersMapEvent(mapBaseIns);
    this.normalPopupIns = new OpenLayersPopup(mapBaseIns);
    this.vuePopupIns = new OpenLayerVueNodePopup(mapBaseIns);
  }

  public destructor() {
    this.normalPopupIns!.destructor();
    this.vuePopupIns!.destructor();
    this.mapEventIns!.destructor();

    this.clearLayer();
    this.olBaseHandle = null;
    this.handle = null;
    this.__layers.clear();
    this.__layers = null;
  }

  private __Id(id: string) {
    return `${this.__layerIdPrefix}${id}`;
  }

  private __Name(name: string) {
    return `${this.__layerIdPrefix}${name}`;
  }

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

    if (isShowSegments && line) {
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

    if (isShowLngLat && coordinates) {
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

    if (isShowLabel) {
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

  public toggleStyleFunction = (options: any) => {
    return (feature: any) => {
      const isCustomOldDraw = feature.get(isCustomOldDrawData);
      if (isCustomOldDraw) {
        const oldCalcDrawData = feature.get("__drawData");
        console.log("toggleStyleFunction1", feature, oldCalcDrawData);

        let isShowSegments = true;
        let isShowLngLat = true;
        let isShowLabel = true;

        const oldGeojsonStyle = feature.get("style");

        if (oldCalcDrawData) {
          if (oldCalcDrawData.oldDrawOptions) {
            const oldDrawOptions = oldCalcDrawData.oldDrawOptions;
            isShowSegments = oldDrawOptions.isShowSegments ?? true;
            isShowLngLat = oldDrawOptions.isShowLngLat ?? true;
            isShowLabel = oldDrawOptions.isShowLabel ?? true;
            this.__currentOptions = oldDrawOptions;
          }
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

        return style;
      } else {
        let fillColor = "rgba(20 ,20, 20, 0.2)";
        let color = "rgba(20 ,20, 20, 1)";
        let width = 2;
        let fontColor = "rgba(20 ,20, 20, 1)";
        let fontFillColor = "rgba(255 ,255, 255, 0.2)";
        let radius = 12;
        let style = null;
        const metadata = feature?.get(customMeta);
        const orgStyle = feature?.get("style");
        if (orgStyle) {
          let fillColorTemp = orgStyle["fillColor"];
          if (fillColorTemp) {
            fillColorTemp = getColor(fillColorTemp);
            fillColor = fillColorTemp;
          }

          let colorTemp = orgStyle["color"];
          if (colorTemp) {
            colorTemp = getColor(colorTemp);
            color = colorTemp;
          }

          let widthTemp = orgStyle["width"];
          if (widthTemp) {
            widthTemp = parseInt(widthTemp);
            if (isNaN(widthTemp)) {
              width = 2;
            } else {
              width = widthTemp;
            }
          }

          let radiusTemp = orgStyle["radius"];
          if (radiusTemp) {
            radiusTemp = parseInt(radiusTemp);
            if (isNaN(radiusTemp)) {
              radius = 2;
            } else {
              radius = radiusTemp;
            }
          }

          let fontFillColorTemp = orgStyle["fontFillColor"];
          if (fontFillColorTemp) {
            fontFillColorTemp = getColor(fontFillColorTemp);
            fontFillColor = fontFillColorTemp;
          }

          let fontColorTemp = orgStyle["fontColor"];
          if (fontColorTemp) {
            fontColorTemp = getColor(fontColorTemp);
            fontColor = fontColorTemp;
          }
        } else if (metadata) {
          const metaStyle = metadata["style"];
          const metaStyleFunc = metadata["styleFunction"];
          if (metaStyle) {
            let fillColorTemp = metaStyle["fillColor"];
            if (fillColorTemp) {
              fillColorTemp = getColor(fillColorTemp);
              fillColor = fillColorTemp;
            }

            let colorTemp = metaStyle["color"];
            if (colorTemp) {
              colorTemp = getColor(colorTemp);
              color = colorTemp;
            }

            let widthTemp = metaStyle["width"];
            if (widthTemp) {
              widthTemp = parseInt(widthTemp);
              if (isNaN(widthTemp)) {
                width = 2;
              } else {
                width = widthTemp;
              }
            }

            let radiusTemp = metaStyle["radius"];
            if (radiusTemp) {
              radiusTemp = parseInt(radiusTemp);
              if (isNaN(radiusTemp)) {
                radius = 2;
              } else {
                radius = radiusTemp;
              }
            }

            let fontFillColorTemp = metaStyle["fontFillColor"];
            if (fontFillColorTemp) {
              fontFillColorTemp = getColor(fontFillColorTemp);
              fontFillColor = fontFillColorTemp;
            }

            let fontColorTemp = metaStyle["fontColor"];
            if (fontColorTemp) {
              fontColorTemp = getColor(fontColorTemp);
              fontColor = fontColorTemp;
            }
          } else if (metaStyleFunc) {
            style = metaStyleFunc(feature);
            return style;
          }
        }

        const name = feature?.get("name") ?? "";
        const optionStyle = {
          fillColor: fillColor,
          color: color,
          width: width,
          radius: radius,
          text: name,
        };

        const textOptionStyle = {
          fillColor: fontFillColor,
          color: fontColor,
          width: width,
          text: name,
        };
        return new Style({
          fill: createFill(optionStyle),
          stroke: createStroke(optionStyle),
          image: createCircle(optionStyle),
          text: createText(textOptionStyle),
        });
      }
    };
  };

  public setFeatureStyle = (options: any) => {
    let fillColor = "rgba(20 ,20, 20, 0.2)";
    let color = "rgba(20 ,20, 20, 1)";
    let width = 2;
    let fontColor = "rgba(20 ,20, 20, 1)";
    let fontFillColor = "rgba(255 ,255, 255, 0.2)";
    let radius = 12;
    let style = null;
    const metaStyle = options["style"];
    if (metaStyle) {
      let fillColorTemp = metaStyle["fillColor"];
      if (fillColorTemp) {
        fillColorTemp = getColor(fillColorTemp);
        fillColor = fillColorTemp;
      }

      let colorTemp = metaStyle["color"];
      if (colorTemp) {
        colorTemp = getColor(colorTemp);
        color = colorTemp;
      }

      let widthTemp = metaStyle["width"];
      if (widthTemp) {
        widthTemp = parseInt(widthTemp);
        if (isNaN(widthTemp)) {
          width = 2;
        } else {
          width = widthTemp;
        }
      }

      let radiusTemp = metaStyle["radius"];
      if (radiusTemp) {
        radiusTemp = parseInt(radiusTemp);
        if (isNaN(radiusTemp)) {
          radius = 2;
        } else {
          radius = radiusTemp;
        }
      }

      let fontFillColorTemp = metaStyle["fontFillColor"];
      if (fontFillColorTemp) {
        fontFillColorTemp = getColor(fontFillColorTemp);
        fontFillColor = fontFillColorTemp;
      }

      let fontColorTemp = metaStyle["fontColor"];
      if (fontColorTemp) {
        fontColorTemp = getColor(fontColorTemp);
        fontColor = fontColorTemp;
      }
    }
    const optionStyle = {
      fillColor: fillColor,
      color: color,
      width: width,
      radius: radius,
      text: "",
    };

    const textOptionStyle = {
      fillColor: fontFillColor,
      color: fontColor,
      width: width,
      text: "",
    };

    style = new Style({
      fill: createFill(optionStyle),
      stroke: createStroke(optionStyle),
      image: createCircle(optionStyle),
      text: createText(textOptionStyle),
    });

    if (options.id) {
      if (this.hasLayer(options)) {
        if (this.handle) {
          const layerObj = this.__layers.get(this.__Id(options.id));
          if (layerObj) {
            layerObj.layer.setStyle(style);
          }
        }
      }
    }
  };

  public resetFeatureStyle = (options: any) => {
    if (options.id) {
      if (this.hasLayer(options)) {
        if (this.handle) {
          const layerObj = this.__layers.get(this.__Id(options.id));
          if (layerObj) {
            const styleFunction = this.toggleStyleFunction(options) || geojsonStyleFunction;
            layerObj.layer.setStyle(styleFunction);
          }
        }
      }
    }
  };

  public createLayerByUrl(
    options: GeojsonOptions = {
      url: "",
      id: "",
      name: "",
      zIndex: 0,
      wrapX: true,
      style: {
        fillColor: "rgba(20 ,20, 20, 0.2)",
        color: "rgba(20 ,20, 20, 1)",
      },
    },
  ) {
    if (!options.url || !options.id) {
      return null;
    }

    const id = this.__Id(options.id);
    let name = options.name ? options.name : nanoid(10);
    name = this.__Name(name);

    let wrapX = options.wrapX;
    if (wrapX == undefined) {
      wrapX = true;
    }

    const source = new VectorSource({
      url: options.url,
      format: new GeoJSON(),
      wrapX: wrapX,
    });
    source.set("id", id);
    source.set("name", name);

    const zIndex = options.zIndex ? options.zIndex : this.olBaseHandle!.getCurrentzIndex();
    const layer = new VectorLayer({
      source: source,
      zIndex: zIndex,
    });
    options.calZIndex = zIndex;

    layer.set("id", id);
    layer.set("name", name);

    const meta = {
      [isCustomizeFlag]: true,
      [customMeta]: options,
    };
    const styleFunction = this.toggleStyleFunction(options);
    source.on("addfeature", (result: any) => {
      result.feature.setProperties(meta);
      const style = styleFunction(result.feature);
      result.feature?.setStyle(style);
    });

    source.on("featuresloadend", (result: any) => {
      // this.olBaseHandle!.fitToExtent(source.getExtent(), [0, 0, 0, 0], true)
      this.olBaseHandle!.fitToLayerSourceByID(this.__Id(options.id));
    });

    const layerObj = {
      options,
      source,
      layer,
    };
    return layerObj;
  }

  public createLayerByData(options: GeojsonOptions) {
    if (!options.data || !options.id) {
      return null;
    }
    const id = this.__Id(options.id);
    let name = options.name ? options.name : nanoid(10);
    name = this.__Name(name);
    const meta: any = {
      [isCustomizeFlag]: true,
      [customMeta]: options,
      [isCustomOldDrawData]: false,
    };

    const GeoJsonReader = new GeoJSON({
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857",
    });

    let wrapX = options.wrapX;
    if (wrapX == undefined) {
      wrapX = true;
    }

    const source = new VectorSource({
      features: GeoJsonReader.readFeatures(options.data),
      wrapX: wrapX,
    });

    source.set("id", id);
    source.set("name", name);
    source.forEachFeature((feature: any) => {
      const oldCalcDrawData = feature.get("__drawData");
      // console.log("createLayerByData", feature, oldCalcDrawData);
      if (oldCalcDrawData) {
        meta[isCustomOldDrawData] = true;
      }
      feature.setProperties(meta);
    });

    const zIndex = options.zIndex ? options.zIndex : this.olBaseHandle!.getCurrentzIndex();
    const styleFunction = this.toggleStyleFunction(options) || geojsonStyleFunction;
    const layer = new VectorLayer({
      source: source,
      style: styleFunction,
      zIndex: zIndex,
    });
    options.calZIndex = zIndex;

    layer.setProperties(meta);

    layer.set("id", id);
    layer.set("name", name);

    const layerObj = {
      options,
      source,
      layer,
    };
    return layerObj;
  }

  public narmalPopupCb = (options: GeojsonOptions) => {
    return (event: any) => {
      console.log(`Nor: ${options.id}_CB`);
      let pixel = event.pixel;
      if (!pixel.length) {
        pixel = this.handle.getEventPixel(event.originalEvent);
      }
      // if(this.handle.hasFeatureAtPixel(pixel)) {}
      const feature = this.handle.forEachFeatureAtPixel(pixel, function (feature: any) {
        const isCustom = feature.get(isCustomizeFlag);
        const metadata = feature.get(customMeta);
        const id = metadata?.id;
        if (isCustom && id === options.id) {
          return feature;
        }
      });

      if (feature) {
        if (options.callback) {
          options.callback(feature, options);
        }
        let position = event.coordinate;
        if (options.popupIsCenter) {
          const featureExtent = feature.getGeometry().getExtent();
          position = getCenter(featureExtent);
        }
        this.normalPopupIns?.showPopupByID(options.id, position, options.htmlString);
      } else {
        if (options.eventType == mapEventType.pointermove) {
          this.normalPopupIns?.hiddenPopupByID(options.id);
        }
      }
    };
  };

  public vNodePopupCb = (options: GeojsonOptions) => {
    return (event: any) => {
      let pixel = event.pixel;
      if (!pixel.length) {
        pixel = this.handle.getEventPixel(event.originalEvent);
      }
      const feature = this.handle.forEachFeatureAtPixel(pixel, function (feature: any) {
        const isCustom = feature.get(isCustomizeFlag);
        const metadata = feature.get(customMeta);
        const id = metadata?.id;
        if (isCustom && id === options.id) {
          return feature;
        }
      });

      if (feature) {
        if (options.callback) {
          options.callback(feature, options);
          this.vuePopupIns?.updateLayer(options as VueNodeOptions);
        }
        if (options.preCloseAll) {
          this.vuePopupIns?.hiddenPopupAll();
        }
        let position = event.coordinate;
        if (options.popupIsCenter) {
          const featureExtent = feature.getGeometry().getExtent();
          position = getCenter(featureExtent);
        }
        this.vuePopupIns?.showPopupByID(options.id, position);
      } else {
        if (options.eventType == mapEventType.pointermove) {
          this.vuePopupIns?.hiddenPopupByID(options.id);
        }
      }
    };
  };

  public addLayer(options: GeojsonOptions) {
    if (this.handle) {
      let layerObj: any = null;
      if (options.url) {
        layerObj = this.createLayerByUrl(options);
      } else if (options.data) {
        layerObj = this.createLayerByData(options);
      } else {
        return false;
      }
      if (layerObj) {
        this.handle.addLayer(layerObj.layer);
        this.__layers.set(this.__Id(options.id), layerObj);

        const delay = options.delay ?? 300;
        const debounce = options.debounce ?? true;
        const debounceOption = options.debounceOption ?? {};
        if (options.isPopup) {
          // 采用普通的popup
          if (options.popupType == popupType.normal) {
            this.normalPopupIns!.addLayer(options);

            if (options.eventType) {
              const eventOptions: EventOptions = {
                id: options.id,
                type: options.eventType,
                cb: this.narmalPopupCb(options),
                delay,
                debounce,
                debounceOption,
              };
              this.mapEventIns!.addEvent(eventOptions);
            }
          } else if (options.popupType == popupType.vnode) {
            this.vuePopupIns?.addLayer(options as VueNodeOptions);

            if (options.eventType) {
              const eventOptions: EventOptions = {
                id: options.id,
                type: options.eventType,
                cb: this.vNodePopupCb(options),
                delay,
                debounce,
                debounceOption,
              };
              this.mapEventIns!.addEvent(eventOptions);
            }
          }
        }
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public fitToView(options: GeojsonOptions) {
    if (this.olBaseHandle) {
      if (options.extent) {
        this.olBaseHandle.fitToExtent(options.extent, [32, 32, 32, 32]);
        return true;
      } else {
        this.olBaseHandle.fitToLayerSourceByID(this.__Id(options.id), [32, 32, 32, 32]);
        return true;
      }
    } else {
      return false;
    }
  }

  public hasLayer(options: GeojsonOptions) {
    if (this.olBaseHandle && this.__layers.size) {
      return this.__layers.has(this.__Id(options.id));
    }
    return false;
  }

  public hasLayerByID(id: string) {
    if (this.olBaseHandle && this.__layers.size) {
      return this.__layers.has(this.__Id(id));
    }
    return false;
  }

  public clearFeatures(options: GeojsonOptions) {
    this.clearFeaturesById(options.id);
  }

  public clearFeaturesById(id: string) {
    if (this.handle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        layerObj.source.clear();
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public updateFeaturesData(options: GeojsonOptions) {
    if (!options.data || !options.id) {
      return null;
    }
    this.updateFeaturesDataById(options.id, options.data, options);
  }

  public updateFeaturesDataById(id: string, geojsonData: any, options: any) {
    if (this.handle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        layerObj.source.clear();
        const GeoJsonReader = new GeoJSON({
          dataProjection: "EPSG:4326",
          featureProjection: "EPSG:3857",
        });
        const features = GeoJsonReader.readFeatures(geojsonData);
        layerObj.source.addFeatures(features);
        const meta = {
          [isCustomizeFlag]: true,
          [customMeta]: options,
        };

        layerObj.source.forEachFeature((feature: any) => {
          feature.setProperties(meta);
        });
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public removeLayer(options: GeojsonOptions) {
    return this.removeLayerByID(options.id);
  }

  public removeLayerByID(id: string) {
    if (this.handle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        this.handle.removeLayer(layerObj.layer);
        this.__layers.delete(this.__Id(id));

        if (layerObj.options && layerObj.options.isPopup) {
          if (layerObj.options.popupType == popupType.normal) {
            this.normalPopupIns!.removeLayerByID(id);
            this.mapEventIns!.removeEventByID(id);
          } else if (layerObj.options.popupType == popupType.vnode) {
            this.vuePopupIns!.removeLayerByID(id);
            this.mapEventIns!.removeEventByID(id);
          }
        }
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
      // for (let [key, layerObj] of this.__layers.entries()) {
      // 	this.handle.removeLayer(layerObj.layer)
      // }
      this.__layers.forEach((layerObj: any) => {
        this.handle!.removeLayer(layerObj.layer);

        if (layerObj.options && layerObj.options.isPopup) {
          const id = layerObj.options.id;
          if (layerObj.options.popupType == popupType.normal) {
            this.normalPopupIns!.removeLayerByID(id);
            this.mapEventIns!.removeEventByID(id);
          } else if (layerObj.options.popupType == popupType.vnode) {
            this.vuePopupIns!.removeLayerByID(id);
            this.mapEventIns!.removeEventByID(id);
          }
        }
      });
      this.__layers.clear();
      return true;
    } else {
      return false;
    }
  }

  public setLayerOpacity(options: GeojsonOptions, opacity: number) {
    return this.setLayerOpacityByID(options.id, opacity);
  }

  public setLayerOpacityByID(id: string, opacity: number) {
    if (this.olBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        layerObj.layer.setOpacity(opacity);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public showHiddenLayer(options: GeojsonOptions, isShow: boolean) {
    return this.showHiddenLayerByID(options.id, isShow);
  }

  public showHiddenLayerByID(id: string, isShow: boolean) {
    if (this.olBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        layerObj.layer.setVisible(isShow);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public setLayerIndex(options: GeojsonOptions, index: number) {
    return this.setLayerIndexByID(options.id, index);
  }

  public setLayerIndexByID(id: string, index: number) {
    if (this.olBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        layerObj.layer.setZIndex(index);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public resetLayerIndex(options: GeojsonOptions) {
    return this.resetLayerIndexByID(options.id);
  }

  public resetLayerIndexByID(id: string) {
    if (this.olBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        const zIndex = layerObj.options.calZIndex;
        layerObj.layer.setZIndex(zIndex);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
