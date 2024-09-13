import { Map as olMap } from "ol";
import lodash from "lodash";

import OlBase from "./base";
import type { EventOptions } from "./mapEventTypes";

export default class OlMapEvent {
  public olBaseHandle: OlBase | null = null;
  public handle: olMap | null = null;
  private __events: any = null;
  private __eventIdPrefix = "MAP_EVENT_";
  private __eventTypePrefix = {
    change: "change",
    "change:layerGroup": "change:layerGroup",
    "change:size": "change:size",
    "change:target": "change:target",
    "change:view": "change:view",
    click: "click",
    dblclick: "dblclick",
    error: "error",
    loadend: "loadend",
    loadstart: "loadstart",
    moveend: "moveend",
    movestart: "movestart",
    pointerdrag: "pointerdrag",
    pointermove: "pointermove",
    postcompose: "postcompose",
    postrender: "postrender",
    precompose: "precompose",
    propertychange: "propertychange",
    rendercomplete: "rendercomplete",
    singleclick: "singleclick",
  };

  private __debounceEvent: Array<string> = [
    "pointerdrag",
    "pointermove",
    "precompose",
    "postcompose",
    "postrender",
    "rendercomplete",
  ];

  constructor(mapBaseIns: OlBase) {
    this.olBaseHandle = mapBaseIns;
    this.handle = mapBaseIns.handle;
    this.__events = new Map();
  }

  public destructor() {
    this.clearEvent();
    this.olBaseHandle = null;
    this.handle = null;
    this.__events = null;
  }

  private __Id(id: string) {
    return `${this.__eventIdPrefix}${id}`;
  }

  public addEvent(option: EventOptions) {
    if (this.handle) {
      const type = option.type;
      const id = this.__Id(option.id);
      const delay = option.delay ?? 300;
      const debounce = option.debounce ?? true;
      const debounceOption = option.debounceOption ?? {};
      let debounceCb = option.cb;
      if (debounce && this.__debounceEvent.includes(type)) {
        debounceCb = lodash.debounce(debounceCb, delay, debounceOption);
      }

      const eventFunc = (event: any) => {
        debounceCb(event);
      };

      this.handle.on(type, eventFunc);
      this.__events.set(id, {
        option,
        eventFunc,
      });
      return true;
    } else {
      return false;
    }
  }

  public removeEvent(option: EventOptions) {
    return this.removeEventByID(option.id);
  }

  public removeEventByID(id: string) {
    if (this.handle) {
      const eventObj = this.__events.get(this.__Id(id));
      if (eventObj) {
        const type = eventObj.option.type;
        this.handle.un(type, eventObj.eventFunc);
        this.__events.delete(this.__Id(id));
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public clearEvent() {
    if (this.handle && this.__events.size) {
      this.__events.forEach((eventObj: any) => {
        const type = eventObj.option.type;
        this.handle!.un(type, eventObj.eventFunc);
      });
      this.__events.clear();
      return true;
    } else {
      return false;
    }
  }
}
