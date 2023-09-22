// antdv 中组件定们 问题解决
export const getAntdvPopupContainer = () => {
  if (window.__MICRO_APP_ENVIRONMENT__) {
    return document.querySelector("micro-app-body") || document.querySelector("body");
  } else {
    return document.querySelector("body");
  }
};
