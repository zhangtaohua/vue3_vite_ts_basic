import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/homemap",
  },
  {
    path: "/homemap",
    name: "mapExample",
    component: () => import("@/views/mapExample.vue"),
  },
  {
    path: "/openlayers",
    name: "openlayerExample",
    children: [
      {
        path: "/openlayers/xyz",
        name: "xyzExample",
        component: () => import("@/views/ol/xyzLayerExample.vue"),
      },
      {
        path: "/openlayers/mapbox",
        name: "mapboxExample",
        component: () => import("@/views/ol/mapboxStyleLayerExample.vue"),
      },
      {
        path: "/openlayers/image",
        name: "StaticExample",
        component: () => import("@/views/ol/staticImageExample.vue"),
      },
      {
        path: "/openlayers/geoImage",
        name: "geoExample",
        component: () => import("@/views/ol/geoImageExample.vue"),
      },
      {
        path: "/openlayers/geojson",
        name: "GeojsonExample",
        component: () => import("@/views/ol/geojsonExample.vue"),
      },
      {
        path: "/openlayers/dawnline",
        name: "DawnlineExample",
        component: () => import("@/views/ol/dawnLineExample.vue"),
      },
      {
        path: "/openlayers/orbit",
        name: "OrbitExample",
        component: () => import("@/views/ol/SatelliteOrbitExample.vue"),
      },
      {
        path: "/openlayers/draw",
        name: "DrawExample",
        component: () => import("@/views/ol/drawExample.vue"),
      },
      {
        path: "/openlayers/drawlabel",
        name: "DrawLabelExample",
        component: () => import("@/views/ol/drawLabelExample.vue"),
      },
      {
        path: "/openlayers/comprehensive",
        name: "CompreExample",
        component: () => import("@/views/ol/comprehensiveExample.vue"),
      },
    ],
  },
  {
    path: "/cesium",
    name: "cesiumExample",
    children: [
      {
        path: "/cesium/load",
        name: "cesiumLoadExample",
        component: () => import("@/views/cesium/basicLoadExample.vue"),
      },
      {
        path: "/cesium/orbit",
        name: "cesiumOrbitExample",
        component: () => import("@/views/cesium/satelliteOrbitExample.vue"),
      },
      {
        path: "/cesium/point",
        name: "cesiumpointExample",
        component: () => import("@/views/cesium/pointExample.vue"),
      },
      {
        path: "/cesium/billboard",
        name: "cesiumBillboardExample",
        component: () => import("@/views/cesium/billboardExample.vue"),
      },
      {
        path: "/cesium/model",
        name: "cesiumModelExample",
        component: () => import("@/views/cesium/modelExample.vue"),
      },
      {
        path: "/cesium/singleimg",
        name: "cesiumSingleImageExample",
        component: () => import("@/views/cesium/singleImageExample.vue"),
      },
      {
        path: "/cesium/geojson",
        name: "cesiumGeojsonExample",
        component: () => import("@/views/cesium/geojsonExample.vue"),
      },
      {
        path: "/cesium/draw",
        name: "cesiumDrawExample",
        component: () => import("@/views/cesium/drawExample.vue"),
      },
    ],
  },
  // pathMatch is the name of the param, e.g., going to /not/found yields
  // { params: { pathMatch: ['not', 'found'] }}
  // this is thanks to the last *, meaning repeated params and it is necessary if you
  // plan on directly navigating to the not-found route using its name
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    redirect: "/homemap",
  },
  // if you omit the last `*`, the `/` character in params will be encoded when resolving or pushing
  {
    path: "/:pathMatch(.*)",
    name: "bad-not-found",
    redirect: "/homemap",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
