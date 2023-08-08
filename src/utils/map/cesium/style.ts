import * as Cesium from "cesium";
import type { BillboardOneOptions } from "./billboardLayersTypes";
import type { PointOneOptions } from "./pointLayersTypes";
import type { CsEntityLabelOptions } from "./baseTypes";
import { getCsColor, getCsCartesian2, getCsCartesian3 } from "./csTools";

export function makePolylineStyle() {}

export function makePolygonStyle() {}

export function makePointStyle(pixelSize: number, color: any, outlineColor: any, outlineWidth: number) {
  return new Cesium.PointGraphics({
    show: true,
    pixelSize: pixelSize,
    color: color,
    outlineColor: outlineColor,
    outlineWidth: outlineWidth,
  });
}

export function makeBillboardStyle() {}

export function makeLabelStyle(labelOpt: CsEntityLabelOptions, name: string | undefined = "") {
  const text = labelOpt.text || name || "";
  const labelScale = labelOpt.scale ?? 1;
  const font = labelOpt.font || "14px MicroSoft YaHei";
  const style = labelOpt.style || Cesium.LabelStyle.FILL;
  const fillColor = getCsColor(labelOpt.fillColor, Cesium.Color.RED);
  const backgroundColor = getCsColor(labelOpt.backgroundColor, Cesium.Color.WHITE);
  const pixelOffset = getCsCartesian2(labelOpt.pixelOffset);

  return new Cesium.LabelGraphics({
    ...labelOpt,
    show: true,
    text: text,
    scale: labelScale,
    font: font,
    style: style,
    fillColor: fillColor,
    pixelOffset: pixelOffset, //偏移量
    backgroundColor: backgroundColor,
  });
}
