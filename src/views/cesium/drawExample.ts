import CsBase from "@/utils/map/cesium/base";
import type { CesiumBasicOptions } from "@/utils/map/cesium/baseTypes";

import CsUrlTemplateLayers from "@/utils/map/cesium/urlTemplateLayers";
import type { UrlTemplateOptions } from "@/utils/map/cesium/urlTemplateLayersTypes";

import CsBingMapsLayers from "@/utils/map/cesium/bingmapsLayers";
import type { BingMapsOptions } from "@/utils/map/cesium/bingmapsLayersTypes";

import CsGoogleEarthLayers from "@/utils/map/cesium/googleEarthLayers";
import type { GoogleEarthOptions } from "@/utils/map/cesium/googleEarthLayersTypes";

import CsOsmMapsLayers from "@/utils/map/cesium/osmLayers";
import type { OsmOptions } from "@/utils/map/cesium/osmLayersTypes";

import CsWmtsLayers from "@/utils/map/cesium/wmtsLayers";
import type { WMTSOptions } from "@/utils/map/cesium/wmtsLayersTypes";

import CsDrawLayers from "@/utils/map/cesium/drawLayers";
import type { Drawptions } from "@/utils/map/cesium/drawLayersTypes";

import {
  mapXYZUrl,
  bingmapImagerySet,
  bingMapCsBaseUrl,
  mapWMTSUrl,
  googleEarthCsBaseUrl,
  OsmCsBaseUrl,
  OsmStamenMapsCsBaseUrl,
} from "@/utils/map/sourceUrl";

import { defaultMapOptions, mapKeys } from "@/utils/map/geoConstant";

import {
  gaodeMap,
  googleImgUrlMap,
  googleVecUrlMap,
  googleEarthMap,
  bingMap,
  bingLightMap,
  mapboxBasic,
  mapboxAllBlue,
  osm,
  osmStamen,
  tianditu,
  tiandituZh,
  tiandituZhUrl,
  tiandituEn,
} from "./MapConst";

import { nanoid } from "nanoid";

export default class CsMapHelper extends CsBase {
  private __bgLayers: any = null; // 底图
  private __funcLayers: any = null; // 功能图层
  public csUrlIns: CsUrlTemplateLayers | null = null;
  public csBingmapIns: CsBingMapsLayers | null = null;
  public csGoogleEarthIns: CsGoogleEarthLayers | null = null;
  public csOsmIns: CsOsmMapsLayers | null = null;
  public csWmtsIns: CsWmtsLayers | null = null;
  public csDrawIns: CsDrawLayers | null = null;

  private __gaodeUrlOptions: UrlTemplateOptions = {
    id: gaodeMap,
    name: gaodeMap,
    url: mapXYZUrl.aMap_vec_single,
  };

  private __googleImgUrlOptions: UrlTemplateOptions = {
    id: googleImgUrlMap,
    name: googleImgUrlMap,
    url: mapXYZUrl.google_img,
  };

  private __googleVecUrlOptions: UrlTemplateOptions = {
    id: googleVecUrlMap,
    name: googleVecUrlMap,
    url: mapXYZUrl.google_vec,
  };

  private __mapboxBasicUrlOptions: UrlTemplateOptions = {
    id: mapboxBasic,
    name: mapboxBasic,
    url: mapXYZUrl.mapbox_local_basic,
  };

  private __mapboxAllBlueUrlOptions: UrlTemplateOptions = {
    id: mapboxAllBlue,
    name: mapboxAllBlue,
    url: mapXYZUrl.mapbox_local_allblue,
  };

  private __tiandituUrlOptions: UrlTemplateOptions = {
    id: `${tianditu}_zhurl`,
    name: `${tianditu}_zhurl`,
    url: mapXYZUrl.tiandi_cs_spm_vec,
    subdomains: mapXYZUrl.tiandi_subdomains,
    // tilingScheme : new Cesium.WebMercatorTilingScheme(),
  };

  private __tiandituZhUrlLabelOptions: UrlTemplateOptions = {
    id: `${tianditu}_zhurl_label`,
    name: `${tianditu}_zhurl_label`,
    url: mapXYZUrl.tiandi_cs_spm_vec_zh_label,
    subdomains: mapXYZUrl.tiandi_subdomains,
    // tilingScheme : new Cesium.WebMercatorTilingScheme(),
  };

  private __bingMapAerialOptions: BingMapsOptions = {
    id: bingMap,
    name: bingMap,
    url: bingMapCsBaseUrl,
    mapStyle: bingmapImagerySet.Aerial,
    key: mapKeys.bingmapKey,
    useDefault: true,
  };

  private __bingMapLightOptions: BingMapsOptions = {
    id: bingLightMap,
    name: bingLightMap,
    url: bingMapCsBaseUrl,
    mapStyle: bingmapImagerySet.CanvasLight,
    key: mapKeys.bingmapKey,
    // useDefault: true,
  };

  private __googleEarthOptions: GoogleEarthOptions = {
    id: googleEarthMap,
    name: googleEarthMap,
    url: googleEarthCsBaseUrl,
  };

  private __osmOptions: OsmOptions = {
    id: osm,
    name: osm,
    // url: OsmCsBaseUrl,
  };

  private __osmStamenOptions: OsmOptions = {
    id: osmStamen,
    name: osmStamen,
    url: OsmStamenMapsCsBaseUrl,
  };

  private __tiandituImgOptions: WMTSOptions = {
    id: `${tianditu}_img`,
    name: `${tianditu}_img`,
    url: mapWMTSUrl.tiandi_sp_img_full,
  };

  private __tiandituZhLabelOptions: WMTSOptions = {
    id: `${tianditu}_zh_label`,
    name: `${tianditu}_zh_label`,
    url: mapWMTSUrl.tiandi_sp_img_zh_label_full,
  };

  private __tiandituEnLabelOptions: WMTSOptions = {
    id: `${tianditu}_en_label`,
    name: `${tianditu}_en_label`,
    url: mapWMTSUrl.tiandi_sp_img_en_label_full,
  };

  constructor(target: string, csBasicOptions: CesiumBasicOptions) {
    super(target, csBasicOptions);
    this.__bgLayers = new Map();
    this.__funcLayers = new Map();

    this.csUrlIns = new CsUrlTemplateLayers(this);
    this.csBingmapIns = new CsBingMapsLayers(this);
    this.csGoogleEarthIns = new CsGoogleEarthLayers(this);
    this.csOsmIns = new CsOsmMapsLayers(this);
    this.csWmtsIns = new CsWmtsLayers(this);

    this.csDrawIns = new CsDrawLayers(this);
  }

  public destructor() {
    this.csUrlIns!.destructor();
    this.csBingmapIns!.destructor();
    this.csGoogleEarthIns!.destructor();
    this.csOsmIns!.destructor();
    this.csWmtsIns!.destructor();

    this.csDrawIns!.destructor();

    this.__bgLayers = null;
    this.__funcLayers = null;
    super.destructor();
  }

  public __addBgLayer(ins: any, options: any) {
    if (this.__bgLayers.has(options.id)) {
      ins!.showHiddenLayerByID(options.id, true);
    } else {
      const isAdded = ins!.addLayer(options);
      if (isAdded) {
        this.__bgLayers.set(options, ins);
      }
    }
  }

  public __hiddenBgLayer(options: any) {
    if (this.__bgLayers.has(options.id)) {
      const ins = this.__bgLayers.get(options.id);
      ins!.showHiddenLayerByID(options.id, false);
    }
  }

  public hiddenAllBgLayers() {
    if (this.__bgLayers && this.__bgLayers.size) {
      for (const [optionsKey, valueHandle] of this.__bgLayers.entries()) {
        valueHandle.showHiddenLayerByID(optionsKey.id, false);
      }
      return true;
    } else {
      return false;
    }
  }

  public addBgLayer(id: string) {
    // 先隐藏map
    this.hiddenAllBgLayers();
    switch (id) {
      case gaodeMap: {
        this.__addBgLayer(this.csUrlIns, this.__gaodeUrlOptions);
        break;
      }
      case googleImgUrlMap: {
        this.__addBgLayer(this.csUrlIns, this.__googleImgUrlOptions);
        break;
      }
      case googleVecUrlMap: {
        this.__addBgLayer(this.csUrlIns, this.__googleVecUrlOptions);
        break;
      }
      // case googleEarthMap: {
      //   this.__addBgLayer(this.csGoogleEarthIns, this.__googleEarthOptions);
      //   break;
      // }
      case bingMap: {
        this.__addBgLayer(this.csBingmapIns, this.__bingMapAerialOptions);
        break;
      }
      case bingLightMap: {
        this.__addBgLayer(this.csBingmapIns, this.__bingMapLightOptions);
        break;
      }
      case mapboxBasic: {
        this.__addBgLayer(this.csUrlIns, this.__mapboxBasicUrlOptions);
        break;
      }
      case mapboxAllBlue: {
        this.__addBgLayer(this.csUrlIns, this.__mapboxAllBlueUrlOptions);
        break;
      }
      case osm: {
        this.__addBgLayer(this.csOsmIns, this.__osmOptions);

        break;
      }
      case osmStamen: {
        this.__addBgLayer(this.csOsmIns, this.__osmStamenOptions);
        break;
      }
      case tiandituZh: {
        this.__addBgLayer(this.csWmtsIns, this.__tiandituImgOptions);
        setTimeout(() => {
          this.__addBgLayer(this.csWmtsIns, this.__tiandituZhLabelOptions);
        }, 1000);
        break;
      }
      case tiandituZhUrl: {
        this.__addBgLayer(this.csUrlIns, this.__tiandituUrlOptions);
        this.__addBgLayer(this.csUrlIns, this.__tiandituZhUrlLabelOptions);
        break;
      }
      case tiandituEn: {
        this.__addBgLayer(this.csWmtsIns, this.__tiandituImgOptions);
        this.__addBgLayer(this.csWmtsIns, this.__tiandituEnLabelOptions);
        break;
      }
      default: {
        break;
      }
    }
  }

  public draw(drawOpt: Drawptions) {
    if (this.csDrawIns) {
      // this.csDrawIns.addLayer(drawOpt);
    }
  }

  public removeDraw(drawOpt: Drawptions) {
    if (this.csDrawIns) {
      this.csDrawIns.removeLayer(drawOpt);
    }
  }

  public clearDraw() {
    if (this.csDrawIns) {
      // this.csDrawIns.clearEntities();
    }
  }
}
