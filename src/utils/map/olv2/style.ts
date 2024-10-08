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

export const geodesicModifyGeometryFlag = "geodesic_circle_modify_geo";
export const geoMaskModifyGeometryFlag = "geo_mask_modify_geometry_flag";

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
    lineDash: option.lineDash,
    width: option.width,
  });
}

export function createText(option: StyleTextOptions) {
  const fontSize = option.fontSize ?? 12;
  const font = option.font || `${fontSize}px Calibri,sans-serif`;
  const rotation = option.rotation ?? 0;
  const rotationR = (rotation * Math.PI) / 180;
  return new Text({
    text: option.text ?? "",
    font: font,
    fill: createFillByColor(option.color),
    backgroundFill: createFill(option),
    padding: option.padding ?? [3, 3, 3, 3],
    textBaseline: option.textBaseline ?? "center",
    offsetY: option.offsetY ?? 0,
    offsetX: option.offsetX ?? 0,
    rotation: rotationR,
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
    radius: option.radius / Math.SQRT2,
    radius2: option.radius,
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
    rotation: option.rotation ?? 0,
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
  let color = option.color || option.fillColor;
  color = getColor(color);
  return new Icon({
    src: option.url,
    width: option.radius,
    height: option.radius2,
    // anchorXUnits: "pixels", // "fraction"
    // anchorYUnits: "pixels", // "fraction"
    color: color,
    anchor: option.iconAnchor,
    offset: option.iconOffset,
    rotation: option.rotation ?? 0,
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

export const drawNormalStyleOptions = () => {
  return {
    width: 2,
    color: "rgba(24, 144, 255, 1)",
    fillColor: "rgba(24, 144, 255, .2)",
    radius: 5,
    radius2: 5,
    lineDash: [0, 0],
    iconWidth: 6,
    iconHeight: 6,
    iconPattern: "pattern",
    iconUrl: "circle",
    iconAnchor: [0.5, 0.5],
    iconOffset: [0, 0],
    arrowPattern: "noNeed",
  };
};

export const drawTextStyleOptions = () => {
  return {
    text: "",
    fontSize: 14,
    offsetY: 0,
    offsetX: 0,
    rotation: 0,
    padding: [0, 0, 0, 0],
    textBaseline: "bottom",
    color: "rgba(24, 144, 255, 1)",
    fillColor: "rgba(24, 144, 255, .2)",
  };
};

export const createDrawNormalStyle = (
  styleOptions: any = drawNormalStyleOptions(),
  textOptions: any = drawTextStyleOptions(),
) => {
  // let lineDash = null;
  // if (styleOptions.lineDash[0] || styleOptions.lineDash[1]) {
  //   lineDash = styleOptions.lineDash;
  // }

  styleOptions.radius = styleOptions.iconWidth;
  styleOptions.radius2 = styleOptions.iconHeight;
  styleOptions.url = styleOptions.iconUrl;

  let imageStyle: any = null;
  if (styleOptions.iconPattern == "pattern") {
    switch (styleOptions.iconUrl) {
      case "circle": {
        imageStyle = createCircle(styleOptions);
        break;
      }
      case "square": {
        imageStyle = createSquare(styleOptions);
        break;
      }
      case "rectangle": {
        imageStyle = createRectangle(styleOptions);
        break;
      }
      case "triangle": {
        imageStyle = createTriangle(styleOptions);
        break;
      }
      case "star": {
        imageStyle = createStar(styleOptions);
        break;
      }
      case "cross": {
        imageStyle = createCross(styleOptions);
        break;
      }
      case "x": {
        imageStyle = createX(styleOptions);
        break;
      }
      default: {
        imageStyle = createCircle(styleOptions);
        break;
      }
    }
  } else if (styleOptions.iconPattern == "icons") {
    if (styleOptions.url) {
      imageStyle = createIconImage(styleOptions);
    } else {
      imageStyle = createCircle(styleOptions);
    }
  } else {
    imageStyle = createCircle(styleOptions);
  }

  if (textOptions.text) {
    return new Style({
      geometry: (feature: any) => {
        const modifyGeometry = feature.get(geodesicModifyGeometryFlag);
        const maskGeometry = feature.get(geoMaskModifyGeometryFlag);
        if (modifyGeometry) {
          return modifyGeometry;
        } else if (maskGeometry && maskGeometry.geometry) {
          return maskGeometry.geometry;
        } else {
          return feature.getGeometry();
        }
      },
      image: imageStyle,
      fill: createFill(styleOptions),
      stroke: createStroke(styleOptions),
      text: createText(textOptions),
    });
  } else {
    return new Style({
      geometry: (feature: any) => {
        const modifyGeometry = feature.get(geodesicModifyGeometryFlag);
        const maskGeometry = feature.get(geoMaskModifyGeometryFlag);
        if (modifyGeometry) {
          return modifyGeometry;
        } else if (maskGeometry && maskGeometry.geometry) {
          return maskGeometry.geometry;
        } else {
          return feature.getGeometry();
        }
      },
      image: imageStyle,
      fill: createFill(styleOptions),
      stroke: createStroke(styleOptions),
    });
  }
};

export const createDrawNormalStyleOld = (styleOptions: any = drawNormalStyleOptions()) => {
  // let lineDash = null;
  // if (styleOptions.lineDash[0] || styleOptions.lineDash[1]) {
  //   lineDash = styleOptions.lineDash;
  // }
  return new Style({
    geometry: (feature: any) => {
      const modifyGeometry = feature.get(geodesicModifyGeometryFlag);
      const maskGeometry = feature.get(geoMaskModifyGeometryFlag);
      if (modifyGeometry) {
        return modifyGeometry;
      } else if (maskGeometry && maskGeometry.geometry) {
        return maskGeometry.geometry;
      } else {
        return feature.getGeometry();
      }
    },
    image: new CircleStyle({
      fill: new Fill({
        color: styleOptions.fillColor,
      }),
      stroke: new StrokeStyle({
        color: styleOptions.color,
        width: styleOptions.width,
      }),
      radius: styleOptions.radius,
    }),
    fill: new Fill({
      // color: 'rgba(24, 144, 255, .2)',
      color: styleOptions.fillColor,
    }),
    stroke: new StrokeStyle({
      color: styleOptions.color,
      lineDash: styleOptions.lineDash,
      width: styleOptions.width,
    }),
  });
};

export const createDrawNormalActiveStyle = (styleOptions: any = drawNormalStyleOptions()) => {
  return new Style({
    image: new CircleStyle({
      fill: new Fill({
        color: styleOptions.fillColor,
      }),
      stroke: new StrokeStyle({
        color: styleOptions.color,
        width: styleOptions.width,
      }),
      radius: styleOptions.radius,
    }),
    fill: new Fill({
      color: styleOptions.fillColor,
    }),
    stroke: new StrokeStyle({
      color: styleOptions.color,
      width: styleOptions.width,
    }),
  });
};

export const createDrawHighlightStyle = (styleOptions: any = drawNormalStyleOptions()) => {
  return new Style({
    image: new CircleStyle({
      fill: new Fill({
        color: styleOptions.fillColor,
      }),
      stroke: new StrokeStyle({
        color: styleOptions.color,
        width: styleOptions.width,
      }),
      radius: styleOptions.radius,
    }),
    fill: new Fill({
      color: styleOptions.fillColor,
    }),
    stroke: new StrokeStyle({
      color: styleOptions.color,
      width: styleOptions.width,
    }),
  });
};

export const segmentStyleOptions = {
  fontSize: 12,
  color: "rgba(255, 255, 255, 1)",
  fillColor: "rgba(0, 0, 0, 0.4)",
};

export const createSegmentStyle = (styleOptions: any = segmentStyleOptions) => {
  return new Style({
    text: new Text({
      font: `${styleOptions.fontSize}px Calibri,sans-serif`,
      fill: new Fill({
        color: styleOptions.color,
      }),
      backgroundFill: new Fill({
        color: styleOptions.fillColor,
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
        color: styleOptions.fillColor,
      }),
    }),
  });
};

export const labelStyleOptions = {
  fontSize: 14,
  color: "rgba(255, 255, 255, 1)",
  fillColor: "rgba(0, 0, 0, 0.7)",
};

export const createLabelStyle = (styleOptions: any = labelStyleOptions) => {
  return new Style({
    text: new Text({
      font: `${styleOptions.fontSize}px Calibri,sans-serif`,
      fill: new Fill({
        color: styleOptions.color,
      }),
      backgroundFill: new Fill({
        color: styleOptions.fillColor,
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
        color: styleOptions.fillColor,
      }),
    }),
  });
};

export const lnglatStyleOptions = {
  fontSize: 12,
  color: "rgba(255, 255, 255, 1)",
  fillColor: "rgba(0, 0, 0, 0.4)",
};

export const createLabelLngLatStyle = (styleOptions: any = lnglatStyleOptions) => {
  return new Style({
    text: new Text({
      font: `${styleOptions.fontSize}px Calibri,sans-serif`,
      fill: new Fill({
        color: styleOptions.color,
      }),
      backgroundFill: new Fill({
        color: styleOptions.fillColor,
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
        color: styleOptions.fillColor,
      }),
    }),
  });
};

export const createGeodesicStyle = () => {
  return new Style({
    geometry: (feature: any) => {
      const modifyGeometry = feature.get(geodesicModifyGeometryFlag);
      const maskGeometry = feature.get(geoMaskModifyGeometryFlag);
      if (modifyGeometry) {
        return modifyGeometry;
      } else if (maskGeometry && maskGeometry.geometry) {
        return maskGeometry.geometry;
      } else {
        return feature.getGeometry();
      }
    },
    fill: new Fill({
      color: "rgba(255, 255, 255, 0.2)",
    }),
    stroke: new StrokeStyle({
      color: "#ff3333",
      width: 2,
    }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: "rgba(0, 0, 0, 0)",
      }),
    }),
  });
};

export const createModifyStyle = () => {
  return new Style({
    image: new CircleStyle({
      radius: 5,
      stroke: new StrokeStyle({
        color: "rgba(0, 0, 0, 0.7)",
      }),
      fill: new Fill({
        color: "rgba(0, 0, 0, 0.4)",
      }),
    }),
    text: new Text({
      text: "Drag to modify",
      font: "12px Calibri,sans-serif",
      fill: new Fill({
        color: "rgba(255, 255, 255, 1)",
      }),
      backgroundFill: new Fill({
        color: "rgba(0, 0, 0, 0.7)",
      }),
      padding: [2, 2, 2, 2],
      textAlign: "left",
      offsetX: 15,
    }),
  });
};

export const createTipStyle = () => {
  return new Style({
    text: new Text({
      font: "12px Calibri,sans-serif",
      fill: new Fill({
        color: "rgba(255, 255, 255, 1)",
      }),
      backgroundFill: new Fill({
        color: "rgba(0, 0, 0, 0.4)",
      }),
      padding: [2, 2, 2, 2],
      textAlign: "left",
      offsetX: 15,
    }),
  });
};

export const transparentPolygonStyle = new Style({
  stroke: new StrokeStyle({
    color: "rgba(255, 255, 255, 0.0)",
    width: 0,
  }),
  fill: new Fill({
    color: "rgba(255, 255, 255, 0.0)",
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

export const geojsonStyleFunction = function (feature: any) {
  return GeoJSONStyles[feature.getGeometry().getType()];
};
