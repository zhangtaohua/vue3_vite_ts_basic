import { createApp } from "vue";
import { nanoid } from "nanoid";

export default class EchartBase {
  public container = "";
  public pixelRatio = 1;
  public language = "zh_CN";
  public vueIns: any = null;
  public echartHandle: any = null;
  public errorHandle: any = null;
  public dom: any = null;

  constructor(target: string, options: any) {
    this.container = target;
    this.pixelRatio = options.pixelRatio || (window ? window.devicePixelRatio : 1);
    this.language = options.language || "zh_CN";
  }

  public destructor() {
    console.log("我被销毁了");
    this.removeHandle();
    this.dom = null;
  }

  public removeHandle() {
    if (this.echartHandle) {
      this.echartHandle.destroyEcharts();
      this.echartHandle = null;
    }
    if (this.errorHandle) {
      this.errorHandle = null;
    }
    if (this.vueIns) {
      this.vueIns.unmount(this.dom);
      this.vueIns = null;
    }
  }

  public renderEchart(vNode: any, options: any, editor: any, isSelected: boolean) {
    if (this.container) {
      this.dom = document.getElementById(this.container);
      if (this.dom) {
        this.removeHandle();
        const echartId = `rj_echart_inbox_${nanoid(10)}`;

        this.vueIns = createApp(vNode, {
          echartsId: echartId,
          echartsOptions: options,
          editor: editor,
          isSelected: isSelected,
        });

        this.echartHandle = this.vueIns.mount(this.dom);
      }
    }
  }

  public resizeEchart() {
    if (this.echartHandle) {
      this.echartHandle.resizeEcharts();
    }
  }

  public setCanResize() {
    if (this.echartHandle) {
      this.echartHandle.setCanResize();
    }
  }

  public renderError(vNode: any, options: any) {
    if (this.container) {
      this.dom = document.getElementById(this.container);
      if (this.dom) {
        this.removeHandle();

        this.vueIns = createApp(vNode, {
          ...options,
        });

        this.errorHandle = this.vueIns.mount(this.dom);
      }
    }
  }
}
