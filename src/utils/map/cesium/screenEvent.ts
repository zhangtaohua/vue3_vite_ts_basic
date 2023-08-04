import * as Cesium from "cesium";
import lodash from "lodash";

import CesiumBase from "./base";
import type { EventOptions } from "./screenEventTypes";

export default class CsScreenEvent {
  public csBaseHandle: CesiumBase | null = null;
  public imageryLayers: any = null;

  private __events: any = null;
  private __eventIdPrefix = "SCREEN_EVENT_";

  // 在确定不需要时删除
  public eventType = {
    LEFT_DOWN: Cesium.ScreenSpaceEventType.LEFT_DOWN,
    LEFT_UP: Cesium.ScreenSpaceEventType.LEFT_UP,
    LEFT_CLICK: Cesium.ScreenSpaceEventType.LEFT_CLICK,
    LEFT_DOUBLE_CLICK: Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,

    RIGHT_DOWN: Cesium.ScreenSpaceEventType.RIGHT_DOWN,
    RIGHT_UP: Cesium.ScreenSpaceEventType.RIGHT_UP,
    RIGHT_CLICK: Cesium.ScreenSpaceEventType.RIGHT_CLICK,

    MIDDLE_DOWN: Cesium.ScreenSpaceEventType.MIDDLE_DOWN,
    MIDDLE_UP: Cesium.ScreenSpaceEventType.MIDDLE_UP,
    MIDDLE_CLICK: Cesium.ScreenSpaceEventType.MIDDLE_CLICK,

    MOUSE_MOVE: Cesium.ScreenSpaceEventType.MOUSE_MOVE,
    WHEEL: Cesium.ScreenSpaceEventType.WHEEL,

    PINCH_START: Cesium.ScreenSpaceEventType.PINCH_START,
    PINCH_END: Cesium.ScreenSpaceEventType.PINCH_END,
    PINCH_MOVE: Cesium.ScreenSpaceEventType.PINCH_MOVE,
  };

  public modify = {
    SHIFT: Cesium.KeyboardEventModifier.SHIFT,
    CTRL: Cesium.KeyboardEventModifier.CTRL,
    ALT: Cesium.KeyboardEventModifier.ALT,
  };

  private __debounceEvent: Array<string> = ["MOUSE_MOVE", "WHEEL"];

  constructor(mapBaseIns: CesiumBase) {
    this.csBaseHandle = mapBaseIns;
    this.imageryLayers = mapBaseIns.imageryLayers;

    this.__events = new Map();
  }

  public destructor() {
    this.clearEvent();
    this.csBaseHandle = null;
    this.imageryLayers = null;
    this.__events = null;
  }

  private __Id(id: string) {
    return `${this.__eventIdPrefix}${id}`;
  }

  public addEvent(option: EventOptions) {
    if (this.csBaseHandle) {
      const type = option.type;
      const modify = option.modify || false;
      const id = this.__Id(option.id);
      const element = option.element;
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

      const eventHandler = new Cesium.ScreenSpaceEventHandler(element);
      if (modify) {
        eventHandler.setInputAction(eventFunc, type, modify);
      } else {
        eventHandler.setInputAction(eventFunc, type);
      }

      this.__events.set(id, {
        option,
        eventFunc,
        eventHandler,
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
    if (this.csBaseHandle) {
      const eventObj = this.__events.get(this.__Id(id));
      if (eventObj) {
        const type = eventObj.option.type;
        const modify = eventObj.option.modify || false;
        if (modify) {
          eventObj.eventHandler.removeInputAction(type, modify);
          eventObj.eventHandler.destroy();
        } else {
          eventObj.eventHandler.removeInputAction(type);
          eventObj.eventHandler.destroy();
        }
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
    if (this.csBaseHandle && this.__events.size) {
      this.__events.forEach((eventObj: any) => {
        eventObj.eventHandler.destroy();
      });
      this.__events.clear();
      return true;
    } else {
      return false;
    }
  }
}
