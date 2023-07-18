import Icon from "ol/style/Icon";
import Text from "ol/style/Text";
import Fill from "ol/style/Fill";
import { Style, Stroke as StrokeStyle, Circle as CircleStyle, RegularShape } from "ol/style";

import lodash from "lodash";

import type {
  StyleColorOptions,
  StyleStrokeOptions,
  StyleTextOptions,
  StyleShapeOptions,
  StyleIconOptions,
} from "./styleTypes";

export function getColor(color: string | Array<number>) {
  let cColor: string | Array<number> = "rgba(255, 0, 0, 1)";
  if (lodash.isString(color)) {
    cColor = color;
  } else if (lodash.isArray(color)) {
    if (color.length === 4) {
      cColor = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
    } else if (color.length === 3) {
      cColor = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
    }
  }
  return cColor;
}

export function createFillByColor(color: string | Array<number>) {
  const fillColor = getColor(color);
  return new Fill({
    color: fillColor,
  });
}

export function createFill(option: StyleColorOptions) {
  let fillColor = option.fillColor || option.color;
  fillColor = getColor(fillColor);

  return new Fill({
    color: fillColor,
  });
}

export function createStroke(option: StyleStrokeOptions) {
  const color = getColor(option.color);
  return new StrokeStyle({
    color: color,
    width: option.width,
  });
}

export function createText(option: StyleTextOptions) {
  const font = option.font || "12px Calibri,sans-serif";
  return new Text({
    text: option.text ?? "",
    font: font,
    fill: createFillByColor(option.color),
    backgroundFill: createFill(option),
    padding: option.padding ?? [3, 3, 3, 3],
    textBaseline: option.textBaseline ?? "center",
    offsetY: option.offsetY,
    offsetX: option.offsetX,
  });
}

export function createCircle(option: StyleShapeOptions) {
  return new CircleStyle({
    stroke: createStroke(option),
    fill: createFill(option),
    radius: option.radius ?? 16,
  });
}

export function createSquare(option: StyleShapeOptions) {
  return new RegularShape({
    stroke: createStroke(option),
    fill: createFill(option),
    points: 4,
    radius: option.radius,
    angle: Math.PI / 4,
  });
}

export function createRectangle(option: StyleShapeOptions) {
  return new RegularShape({
    stroke: createStroke(option),
    fill: createFill(option),
    points: 4,
    radius: option.radius,
    radius2: option.radius2,
    angle: 0,
    scale: [1, 0.5],
  });
}

export function createTriangle(option: StyleShapeOptions) {
  return new RegularShape({
    stroke: createStroke(option),
    fill: createFill(option),
    points: 3,
    radius: option.radius,
    rotation: option.rotation,
    angle: 0,
  });
}

export function createStar(option: StyleShapeOptions) {
  return new RegularShape({
    stroke: createStroke(option),
    fill: createFill(option),
    points: 5,
    radius: option.radius,
    radius2: option.radius2,
    angle: 0,
  });
}

export function createCross(option: StyleShapeOptions) {
  return new RegularShape({
    stroke: createStroke(option),
    fill: createFill(option),
    points: 4,
    radius: option.radius,
    radius2: 0,
    angle: 0,
  });
}

export function createX(option: StyleShapeOptions) {
  return new RegularShape({
    stroke: createStroke(option),
    fill: createFill(option),
    points: 4,
    radius: option.radius,
    radius2: 0,
    angle: Math.PI / 4,
  });
}

export function createIconImage(option: StyleIconOptions) {
  return new Icon({
    src: option.url,
    scale: option.scale ?? 1.0,
  });
}

export function createGeoPoint(option: StyleShapeOptions) {
  return new Style({
    image: new CircleStyle({
      stroke: createStroke(option),
      fill: createFill(option),
      radius: option.radius,
    }),
  });
}

export function createGeoLine(option: StyleShapeOptions) {
  return new Style({
    stroke: createStroke(option as StyleStrokeOptions),
  });
}

export function createGeoPolygon(option: StyleShapeOptions) {
  return new Style({
    stroke: createStroke(option as StyleStrokeOptions),
    fill: createFill(option),
  });
}

export function createIconImagePoint(option: StyleIconOptions) {
  return new Style({
    image: createIconImage(option),
  });
}

export const drawNormalStyle = new Style({
  image: new CircleStyle({
    fill: new Fill({
      color: "rgba(24, 144, 255, .2)",
    }),
    stroke: new StrokeStyle({
      color: "rgba(24, 144, 255, 1)",

      width: 2,
    }),
    radius: 5,
  }),
  fill: new Fill({
    // color: 'rgba(24, 144, 255, .2)',
    color: "rgba(24, 144, 255, 0)",
  }),
  stroke: new StrokeStyle({
    color: "rgba(24, 144, 255, 1)",
    width: 2,
  }),
});

export const drawNormalStyleActive = new Style({
  image: new CircleStyle({
    fill: new Fill({
      color: "rgba(24, 144, 255, .2)",
    }),
    stroke: new StrokeStyle({
      color: "rgba(24, 144, 255, 1)",

      width: 2,
    }),
    radius: 5,
  }),
  fill: new Fill({
    color: "rgba(24, 144, 255, .2)",
  }),
  stroke: new StrokeStyle({
    color: "rgba(24, 144, 255, 1)",
    width: 2,
  }),
});

export const drawHighlightStyle = new Style({
  image: new CircleStyle({
    fill: new Fill({
      color: "rgba(24, 144, 255, .2)",
    }),
    stroke: new StrokeStyle({
      color: "rgba(24, 144, 255, 1)",

      width: 2,
    }),
    radius: 5,
  }),
  fill: new Fill({
    color: "rgba(100, 144, 255, .2)",
  }),
  stroke: new StrokeStyle({
    color: "rgba(100, 144, 255, 1)",
    width: 2,
  }),
});

const _image = new CircleStyle({
  radius: 5,
  fill: undefined,
  stroke: new StrokeStyle({ color: "red", width: 1 }),
});

export const GeoJSONStyles = {
  Point: new Style({
    image: _image,
  }),
  LineString: new Style({
    stroke: new StrokeStyle({
      color: "green",
      width: 1,
    }),
  }),
  MultiLineString: new Style({
    stroke: new StrokeStyle({
      color: "green",
      width: 1,
    }),
  }),
  MultiPoint: new Style({
    image: _image,
  }),
  MultiPolygon: new Style({
    stroke: new StrokeStyle({
      color: "yellow",
      width: 1,
    }),
    fill: new Fill({
      color: "rgba(255, 255, 0, 0.1)",
    }),
  }),
  Polygon: new Style({
    stroke: new StrokeStyle({
      color: "blue",
      lineDash: [4],
      width: 3,
    }),
    fill: new Fill({
      color: "rgba(0, 0, 255, 0.1)",
    }),
  }),
  GeometryCollection: new Style({
    stroke: new StrokeStyle({
      color: "magenta",
      width: 2,
    }),
    fill: new Fill({
      color: "magenta",
    }),
    image: new CircleStyle({
      radius: 10,
      fill: undefined,
      stroke: new StrokeStyle({
        color: "magenta",
      }),
    }),
  }),
  Circle: new Style({
    stroke: new StrokeStyle({
      color: "red",
      width: 2,
    }),
    fill: new Fill({
      color: "rgba(255,0,0,0.2)",
    }),
  }),
};

export const segmentStyle = new Style({
  text: new Text({
    font: "12px Calibri,sans-serif",
    fill: new Fill({
      color: "rgba(255, 255, 255, 1)",
    }),
    backgroundFill: new Fill({
      color: "rgba(0, 0, 0, 0.4)",
    }),
    padding: [2, 2, 2, 2],
    textBaseline: "bottom",
    offsetY: -12,
  }),
  image: new RegularShape({
    radius: 6,
    points: 3,
    angle: Math.PI,
    displacement: [0, 8],
    fill: new Fill({
      color: "rgba(0, 0, 0, 0.4)",
    }),
  }),
});

export const labelLngLatStyle = new Style({
  text: new Text({
    font: "14px Calibri,sans-serif",
    fill: new Fill({
      color: "rgba(255, 255, 255, 1)",
    }),
    backgroundFill: new Fill({
      color: "rgba(0, 0, 0, 0.7)",
    }),
    padding: [3, 3, 3, 3],
    textBaseline: "bottom",
    offsetY: -15,
  }),
  image: new RegularShape({
    radius: 8,
    points: 3,
    angle: Math.PI,
    displacement: [0, 10],
    fill: new Fill({
      color: "rgba(0, 0, 0, 0.7)",
    }),
  }),
});

export const transparentPolygonStyle = new Style({
  stroke: new StrokeStyle({
    color: "rgba(255, 255, 255, 0.0)",
    width: 0,
  }),
  fill: new Fill({
    color: "rgba(255, 255, 255, 0.0)",
  }),
});

export const geojsonStyleFunction = function (feature: any) {
  return GeoJSONStyles[feature.getGeometry().getType()];
};