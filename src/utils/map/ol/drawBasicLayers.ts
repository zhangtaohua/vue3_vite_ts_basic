import { Map as olMap } from "ol";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";

import { Draw, Modify, Snap } from "ol/interaction";
import { createBox, createRegularPolygon } from "ol/interaction/Draw";
import { GeometryCollection, Point, Polygon, LineString, MultiPoint, Circle as CircleGeom } from "ol/geom";
import { circular, fromCircle } from "ol/geom/Polygon";
import { getDistance } from "ol/sphere";
import { transform } from "ol/proj";

import OlBase from "./base";
import {
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
} from "./style";

import {
  calibrateWrapLongitudeLatitude,
  getGeoPointFromCoords,
  getGeoPolygonFromPolygonArray,
  getGeoLineFromArray,
} from "../geoCommon";
import { formatArea, formatLength } from "./olTools";
import { nanoid } from "nanoid";

import type { DrawBasicOptions } from "./drawBasicLayersTypes";

import {
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
} from "../geoConstant";
export default class OlDrawBasic {
  public olBaseHandle: OlBase | null = null;
  public handle: olMap | null = null;

  private __layers: any = null;
  private __layerIdPrefix = "DRAW_";
  private __drawData: any = {};

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

  constructor(mapBaseIns: OlBase) {
    this.olBaseHandle = mapBaseIns;
    this.handle = mapBaseIns.handle;
    this.__layers = new Map();

    this.segmentStyles = [createSegmentStyle()];
    this.lableLngLatStyles = [createLabelLngLatStyle()];
    this.labelStyles = createLabelStyle();

    this.interactionSource = new VectorSource();
    // this.interactionSource = new VectorSource({wrapX: false});
    this.InteractionLayer = new VectorLayer({
      source: this.interactionSource,
      zIndex: this.olBaseHandle.getCurrentzIndex(),
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
  }

  public destructor() {
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

  // 取消绘制功能
  public cancelDraw = (event: any) => {
    if (this.drawTag) {
      if (event.keyCode === 27) {
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
      if (event.keyCode === 81) {
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
      this.handle.removeInteraction(this.drawTag);
      this.handle.removeInteraction(this.snapTag);
      this.handle.removeInteraction(this.modify);
    }
  }

  public drawStyleFunction(
    feature: any,
    drawType: any,
    isShowSegments: boolean,
    isShowLngLat: boolean,
    isShowLabel: boolean,
  ) {
    const styles = [createDrawNormalStyle()];

    // // 为了 测地圆的绘制 方案一。
    // const modifyGeometry = feature.get(geodesicModifyGeometryFlag);
    // if (modifyGeometry) {
    //   styles = [createGeodesicStyle()];
    // }

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
      } else if (type === "GeometryCollection") {
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
          this.segmentStyles.push(createSegmentStyle());
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
          this.lableLngLatStyles.push(createLabelLngLatStyle());
        }
        const segmentPoint = new Point(coordinates[i]);
        this.lableLngLatStyles[count].setGeometry(segmentPoint);
        this.lableLngLatStyles[count].getText().setText(lngLatLabel);
        styles.push(this.lableLngLatStyles[count]);
        count++;
      }
    }

    if (isShowLabel) {
      if (type === MAP_DRAW_POLYGON || type === MAP_DRAW_CIRCLE || type === "GeometryCollection") {
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
      // console.log("modifyStyle", modifyGeometry);
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

  public getDrawData = (options: DrawBasicOptions, featureId: string) => {
    return (event: any) => {
      const shape = options.shape;
      const callbackFunc = options.callback;
      let formatGeoJson: any = null;
      let formatCoords: any = null;
      let areaTemp = {
        area: 0,
        areaString: "0 m<sup>2</sup>",
      };
      let lengthTemp = {
        length: 0,
        lengthString: "0 m",
      };
      let geoType = "";

      let poly = null;
      if (event.type == "drawend") {
        poly = event.feature.getGeometry();
      } else if (event.type == "modifyend") {
        const features = event.features.getArray();
        poly = features[0].getGeometry();
      }

      if (shape == MAP_DRAW_POINT) {
        geoType = MAP_DRAW_POINT;
        const coord = poly.getCoordinates();
        formatCoords = transform(coord, "EPSG:3857", "EPSG:4326");
        formatCoords = calibrateWrapLongitudeLatitude(formatCoords[0], formatCoords[1]);
        formatCoords = [formatCoords.longitude, formatCoords.latitude];
        this.__drawData = {
          id: featureId,
          shape: shape,
          geoType: geoType,
          coordinates: formatCoords,
          area: areaTemp,
          length: lengthTemp,
        };

        formatGeoJson = getGeoPointFromCoords(formatCoords, this.__drawData);
      } else if (
        shape == MAP_DRAW_SQUARE ||
        shape == MAP_DRAW_RECTANGLE ||
        shape == MAP_DRAW_POLYGON ||
        shape == MAP_MEASURE_AREA
      ) {
        geoType = MAP_DRAW_POLYGON;
        const coord = poly.getCoordinates();
        formatCoords = [[this.getCoordinatesLngLat(coord)]];
        areaTemp = formatArea(poly);

        this.__drawData = {
          id: featureId,
          shape: shape,
          geoType: geoType,
          coordinates: formatCoords,
          area: areaTemp,
          length: lengthTemp,
        };

        formatGeoJson = getGeoPolygonFromPolygonArray(formatCoords, this.__drawData);
      } else if (shape == MAP_DRAW_LINE || shape == MAP_MEASURE_DISTANCE) {
        geoType = MAP_DRAW_LINE;
        const coord = [poly.getCoordinates()];
        formatCoords = [this.getCoordinatesLngLat(coord)];
        lengthTemp = formatLength(poly);

        this.__drawData = {
          id: featureId,
          shape: shape,
          geoType: geoType,
          coordinates: formatCoords,
          area: areaTemp,
          length: lengthTemp,
        };

        formatGeoJson = getGeoLineFromArray(formatCoords, this.__drawData);
      } else if (shape == MAP_DRAW_GEOMETRY_CIRCLE) {
        geoType = MAP_DRAW_POLYGON;
        const circle = fromCircle(poly, 128);
        const coordinates = circle.getCoordinates();
        formatCoords = [[this.getCoordinatesLngLat(coordinates)]];
        areaTemp = formatArea(circle);

        this.__drawData = {
          id: featureId,
          shape: shape,
          geoType: geoType,
          coordinates: formatCoords,
          area: areaTemp,
          length: lengthTemp,
        };

        formatGeoJson = getGeoPolygonFromPolygonArray(formatCoords, this.__drawData);
      } else if (shape == MAP_DRAW_GEODESIC_CIRCLE) {
        geoType = MAP_DRAW_POLYGON;
        if (poly.getType() == "GeometryCollection") {
          const geometries = poly.getGeometries();
          for (let i = 0; i < geometries.length; i++) {
            if (geometries[i].getType() == "Polygon") {
              const coord = geometries[i].getCoordinates();
              formatCoords = [[this.getCoordinatesLngLat(coord)]];
              areaTemp = formatArea(poly);

              this.__drawData = {
                id: featureId,
                shape: shape,
                geoType: geoType,
                coordinates: formatCoords,
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
        geojson: formatGeoJson,
        area: areaTemp,
        length: lengthTemp,
      };
      if (callbackFunc) {
        callbackFunc(this.__drawData);
      }
    };
  };

  public drawShape(options: DrawBasicOptions) {
    const shape = options.shape;
    const isClear = options.isClear || false;
    const isFreehand = options.isFreehand || false;
    const callbackFunc = options.callback;

    const isShowSegments = options.isShowSegments || false;
    const isShowLngLat = options.isShowLngLat || false;
    const isShowLabel = options.isShowLabel || false;

    if (this.handle && this.olBaseHandle) {
      if (isClear) {
        this.clearAllDrawShape();
      }

      this.removeCancelDrawCB();
      this.setCancelDrawCB();
      this.removeallInteraction();

      this.__drawData = null;
      // 要不要先清楚以前的图层呢？
      this.drawType = shape;
      this.drawModel = shape;

      let geometryFunction: any = null;

      if (shape == MAP_DRAW_POINT) {
        this.drawType = MAP_DRAW_POINT;
      } else if (shape == MAP_DRAW_SQUARE) {
        this.drawType = MAP_DRAW_CIRCLE;
        geometryFunction = createRegularPolygon(4);
      } else if (shape == MAP_DRAW_RECTANGLE) {
        this.drawType = MAP_DRAW_CIRCLE;
        geometryFunction = createBox();
      } else if (shape == MAP_DRAW_POLYGON) {
        this.drawType = MAP_DRAW_POLYGON;
      } else if (shape == MAP_DRAW_LINE) {
        this.drawType = MAP_DRAW_LINE;
      } else if (shape == MAP_DRAW_GEOMETRY_CIRCLE) {
        this.drawType = MAP_DRAW_GEOMETRY_CIRCLE;
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
          circle.transform("EPSG:4326", projection);
          geometries[0].setCoordinates(circle.getCoordinates());
          geometry.setGeometries(geometries);
          // console.log("hhee", coordinates, center, last, radius, circle);
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
      });

      // this.InteractionLayer.setStyle(createDrawNormalStyle());
      this.InteractionLayer.setStyle((featrue: any) => {
        return this.drawStyleFunction(featrue, null, isShowSegments, isShowLngLat, isShowLabel);
      });

      this.drawTag.on("drawstart", (event: any) => {
        // if (this.interactionSource.getFeatures().length !== 0) {
        //   this.interactionSource.clear();
        // }
        // console.log("drawstart", event);
        this.setDrawBackCB();
        this.drawLayerZIndex = this.olBaseHandle.getCurrentzIndex() + 1;
        this.InteractionLayer.setZIndex(this.drawLayerZIndex);
        if (options.needModify) {
          this.modify.setActive(false);
        }

        // 以下是为了获取 geo 信息进行处理。
        // this.sketchFeature = event.feature;
        // let tooltipCoord = event.coordinate;
        // this.listener = this.sketchFeature.getGeometry().on("change", (e: any) => {
        //   // 在这里可以获取geo 信息进行处理。
        // });
      });

      this.drawTag.on("drawend", (event: any) => {
        // console.log("drawend", event, event.feature.getGeometry());
        this.removeDrawBackCB();
        if (options.needModify) {
          this.modify.setActive(true);
        }
        const featureId = `draw_${nanoid(10)}`;
        this.getDrawData(options, featureId)(event);

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
          event.features.forEach((feature: any) => {
            const geometry = feature.getGeometry();
            if (geometry.getType() === "GeometryCollection") {
              feature.set(geodesicModifyGeometryFlag, geometry.clone(), true);
            }
          });
        });

        this.modify.on("modifyend", (event: any) => {
          console.log("event", event.features);
          event.features.forEach((feature: any) => {
            const modifyGeometry = feature.get(geodesicModifyGeometryFlag);
            if (modifyGeometry) {
              feature.setGeometry(modifyGeometry);
              feature.unset(geodesicModifyGeometryFlag, true);
            }
          });
          const featureId = `draw_${nanoid(10)}`;
          this.getDrawData(options, featureId)(event);
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

  public getCoordinatesLngLat(coordinates: any) {
    const coordinatesNew: any = [];
    coordinates[0].forEach((coordinate: any) => {
      const lngLatOrigin = transform(coordinate, "EPSG:3857", "EPSG:4326");
      const { longitude, latitude } = calibrateWrapLongitudeLatitude(lngLatOrigin[0], lngLatOrigin[1]);
      coordinatesNew.push([longitude, latitude]);
    });

    return coordinatesNew;
  }

  public getDrayData() {
    return this.__drawData;
  }

  public clearAllDrawShape() {
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
