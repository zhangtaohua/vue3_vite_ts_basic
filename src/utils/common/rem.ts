// rem适配
export const calculateSize = () => {
  const screenWidth = window.innerWidth || document.documentElement.clientWidth;
  const baseSize = screenWidth / 38.4;
  document.documentElement.style.fontSize = `${baseSize}px`;
};

export const sizeAdapter = () => {
  calculateSize();
  const resizeEvent = "resize";
  window.addEventListener(resizeEvent, calculateSize, false);
};

export const removeRootElement = () => {
  document.documentElement.style.fontSize = "16px";
};
