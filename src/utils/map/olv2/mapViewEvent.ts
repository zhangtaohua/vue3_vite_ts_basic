import { Map as olMap, View } from "ol";
import lodash from "lodash";

import OlBase from "./base";
import type { EventOptions } from "./mapEventTypes";

export default class OlViewEvent {
  public olBaseHandle: OlBase | null = null;
  public handle: olMap | null = null;
  public viewHandle: View | null = null;
  private __events: any = null;
  private __eventIdPrefix = "VIEW_EVENT_";
  private __eventTypePrefix = {
    change: "change",
    "change:center": "change:center",
    "change:resolution": "change:resolution",
    "change:rotation": "change:rotation",
    error: "error",
    propertychange: "propertychange",
  };

  private __debounceEvent: Array<string> = ["propertychange"];

  constructor(mapBaseIns: OlBase) {
    this.olBaseHandle = mapBaseIns;
    this.handle = mapBaseIns.handle;
    this.viewHandle = mapBaseIns.viewHandle;
    this.__events = new Map();
  }

  public destructor() {
    this.clearEvent();
    this.olBaseHandle = null;
    this.handle = null;
    this.viewHandle = null;
    this.__events = null;
  }

  private __Id(id: string) {
    return `${this.__eventIdPrefix}${id}`;
  }

  public addEvent(option: EventOptions) {
    if (this.viewHandle) {
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

      this.viewHandle.on(type, eventFunc);
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
    if (this.viewHandle) {
      const eventObj = this.__events.get(this.__Id(id));
      if (eventObj) {
        const type = eventObj.option.type;
        this.viewHandle.un(type, eventObj.eventFunc);
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
    if (this.viewHandle && this.__events.size) {
      this.__events.forEach((eventObj: any) => {
        const type = eventObj.option.type;
        this.viewHandle!.un(type, eventObj.eventFunc);
      });
      this.__events.clear();
      return true;
    } else {
      return false;
    }
  }
}
