import { Map as olMap } from "ol";
import { apply } from "ol-mapbox-style";

import OlBase from "./base";
import type { MapboxOptions } from "./mapboxLayersTypes";

export default class OlMapboxStyleLayers {
  public olBaseHandle: OlBase | null = null;
  public handle: olMap | null = null;
  private __layerIdentifier = "mapbox-style-source";

  constructor(mapBaseIns: OlBase) {
    this.olBaseHandle = mapBaseIns;
    this.handle = mapBaseIns.handle;
  }

  public destructor() {
    this.clearLayer();
    this.olBaseHandle = null;
    this.handle = null;
  }

  public addLayer(
    options: MapboxOptions = {
      url: "",
      id: "",
      isRemoveOld: true,
    },
  ) {
    if (this.handle) {
      if (!options.url || !options.id) {
        return null;
      }
      if (options.isRemoveOld) {
        this.clearLayer();
      }
      apply(this.handle, options.url);
      return true;
    } else {
      return false;
    }
  }

  public clearLayer() {
    if (this.handle) {
      this.handle
        .getLayers()
        .getArray()
        .filter((layer: any) => {
          return layer.get(this.__layerIdentifier);
        })
        .forEach((layer: any) => {
          this.handle.removeLayer(layer);
        });
    }
  }
}
