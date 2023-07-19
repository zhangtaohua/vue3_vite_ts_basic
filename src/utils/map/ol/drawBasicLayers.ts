import { Map as olMap } from "ol";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";

import { Draw, Modify, Snap } from "ol/interaction";
import { createBox, createRegularPolygon } from "ol/interaction/Draw";
import { GeometryCollection, Point, Polygon } from "ol/geom";
import { circular, fromCircle } from "ol/geom/Polygon";
import { getDistance } from "ol/sphere";

import OlBase from "./base";
import { drawNormalStyle } from "./style";
import { transform } from "ol/proj";
import { calibrateWrapLongitudeLatitude } from "../geoCommon";
import { formatArea } from "./olTools";
import { nanoid } from "nanoid";

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
  MAP_DRAW_CLEAR,
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
  public darwModel = "";
  public modify: Modify | null = null;

  public interactionSource: VectorSource | null = null;
  public InteractionLayer: VectorLayer | null = null;

  public drawLayerZIndex = 20;

  constructor(mapBaseIns: OlBase) {
    this.olBaseHandle = mapBaseIns;
    this.handle = mapBaseIns.handle;
    this.__layers = new Map();

    this.interactionSource = new VectorSource();
    // this.interactionSource = new VectorSource({wrapX: false});
    this.InteractionLayer = new VectorLayer({
      source: this.interactionSource,
      zIndex: this.olBaseHandle.getCurrentzIndex(),
    });

    const id = "CUSTOM_INTER_" + nanoid(10);
    this.InteractionLayer.set("id", this.__Id(id));
    this.InteractionLayer.set("name", this.__Name(id));

    this.snapTag = new Snap({
      source: this.interactionSource,
    });

    this.modify = new Modify({
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

  // 设置回退点击功能
  public drawBackOnePoint = (event: any) => {
    if (this.drawTag) {
      if (event.keyCode === 27) {
        // if (event.code === "Escape") {
        this.drawTag.removeLastPoint();
      }
    }
  };

  public setDrawBackFunc = () => {
    window.addEventListener("keyup", this.drawBackOnePoint);
  };

  public removeDrawBackFunc = () => {
    window.removeEventListener("keyup", this.drawBackOnePoint);
  };

  public removeallInteraction() {
    if (this.handle) {
      // this.handle.un('singleclick', this.softDeleteConfrimFeature)
      this.handle.removeInteraction(this.drawTag);
      this.handle.removeInteraction(this.snapTag);
      this.handle.removeInteraction(this.modify);
    }
  }

  public drawShape(shape: string, isClear = true, isFreehand = false) {
    return new Promise((resolve, reject) => {
      if (this.handle && this.olBaseHandle) {
        if (isClear) {
          this.clearAllDrawShape();
        }

        this.removeallInteraction();

        this.__drawData = null;
        // 要不要先清楚以前的图层呢？
        this.drawType = shape;
        this.darwModel = shape;

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
        }

        this.drawTag = new Draw({
          source: this.interactionSource,
          type: this.drawType,
          geometryFunction: geometryFunction,
          style: drawNormalStyle,
          freehand: isFreehand,
        });

        this.InteractionLayer.setStyle(drawNormalStyle);

        this.drawTag.on("drawstart", (event: any) => {
          // if (this.interactionSource.getFeatures().length !== 0) {
          //   this.interactionSource.clear();
          // }
          // console.log('drawstart', event)
          this.setDrawBackFunc();
          this.drawLayerZIndex = this.olBaseHandle.getCurrentzIndex() + 1;
          this.InteractionLayer.setZIndex(this.drawLayerZIndex);
        });

        this.drawTag.on("drawend", (event: any) => {
          console.log("drawend", event, event.feature.getGeometry());
          this.removeDrawBackFunc();
          let farmerGeoJson: any = null;
          let area = 0;

          const poly = event.feature.getGeometry();

          if (shape == MAP_DRAW_POINT) {
            const coord = poly.getCoordinates();
            farmerGeoJson = transform(coord, "EPSG:3857", "EPSG:4326");
            area = 0;
          } else if (shape == MAP_DRAW_SQUARE || shape == MAP_DRAW_RECTANGLE || shape == MAP_DRAW_POLYGON) {
            const coord = poly.getCoordinates();
            farmerGeoJson = [this.getCoordinatesLngLat(coord)];
            const { outputHtml, outputMu } = formatArea(poly);
            area = outputMu;
          } else if (shape == MAP_DRAW_LINE) {
            const coord = [poly.getCoordinates()];
            farmerGeoJson = [this.getCoordinatesLngLat(coord)];
            area = 0;
          } else if (shape == MAP_DRAW_GEOMETRY_CIRCLE) {
            const circle = fromCircle(poly, 128);
            const coordinates = circle.getCoordinates();
            farmerGeoJson = [this.getCoordinatesLngLat(coordinates)];
            const { outputHtml, outputMu } = formatArea(circle);
            area = outputMu;
          } else if (shape == MAP_DRAW_GEODESIC_CIRCLE) {
            if (poly.getType() == "GeometryCollection") {
              const geometries = poly.getGeometries();
              for (let i = 0; i < geometries.length; i++) {
                if (geometries[i].getType() == "Polygon") {
                  const coord = geometries[i].getCoordinates();
                  farmerGeoJson = [this.getCoordinatesLngLat(coord)];
                  const { outputHtml, outputMu } = formatArea(poly);
                  area = outputMu;
                  break;
                }
              }
            }
          }

          this.removeallInteraction();
          this.__drawData = {
            type: shape,
            coordinates: farmerGeoJson,
            area: area,
          };
          resolve(this.__drawData);
        });

        this.handle.addInteraction(this.drawTag);
        this.handle.addInteraction(this.snapTag);
        this.handle.addInteraction(this.modify);
      }
    });
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
