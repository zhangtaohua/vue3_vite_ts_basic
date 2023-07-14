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
        path: "/openlayers/comprehensive",
        name: "CompreExample",
        component: () => import("@/views/ol/comprehensiveExample.vue"),
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
