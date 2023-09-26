import * as echarts from "echarts";
import ecStat from "echarts-stat";
import { createApp } from "vue";

export default class EchartBase {
  public container = "";
  public pixelRatio = 1;
  public language = "zh_CN";
  public handle: any = null;
  public dom: any = null;

  constructor(target: string, options: any) {
    this.container = target;
    this.pixelRatio = options.pixelRatio || (window ? window.devicePixelRatio : 1);
    this.language = options.language || "zh_CN";

    echarts.registerTransform(ecStat.transform.regression);

    if (window) {
      window.addEventListener("resize", this.onWindowResize);
    }
  }

  public destructor() {
    console.log("我被销毁了");
    if (this.handle) {
      if (window) {
        window.removeEventListener("resize", this.onWindowResize);
      }
      this.handle.dispose();
      this.handle = null;
      this.dom = null;
    }
  }

  public initEchart() {
    if (this.container) {
      this.dom = document.getElementById(this.container);
      if (this.dom) {
        if (this.handle) {
          this.handle.dispose();
          this.handle = null;
        }
        this.dom.removeAttribute("_echarts_instance_");
        this.handle = echarts.init(this.dom);
      }
    }
  }

  public updateOptions(optionsNew: any) {
    this.initEchart();
    if (this.handle) {
      this.handle.setOption(optionsNew);
    }
  }

  public renderError(vNode: any, options: any) {
    if (this.container) {
      this.dom = document.getElementById(this.container);
      if (this.dom) {
        if (this.handle) {
          this.handle.dispose();
          this.handle = null;
        }
        this.dom.removeAttribute("_echarts_instance_");

        const errorVueInstance = createApp(vNode, {
          ...options,
        });

        errorVueInstance.mount(this.dom);
      }
    }
  }

  public onWindowResize() {
    if (this.handle) {
      this.handle.resize();
    }
  }
}
