/**
 * @description menu config
 * @author RJ(zthvivid@163.com)
 */

export function genConvertToOlMapConfig() {
  return {
    /**
     * 异步获取 RJ-OL-MAP 信息（可能需要在服务端获取）
     * @param title RJ-OL-MAP text
     * @param olMapUrl RJ-OL-MAP url
     * @returns RJ-OL-MAP info
     */
    async getOlMapMenuInfo(title: string, olMapUrl: string): Promise<{ title: string; iconImgSrc: string }> {
      // 该函数，用户自定义配置
      // 1. 使用 iframe 加载 olMapUrl 来获取 title 和 iconImgSrc
      // 2. 但有些网页禁止跨域 iframe 加载（即 X-Frame-Options），此时需要在服务端获取

      return new Promise((resolve) => {
        setTimeout(() => {
          const info = { title: title, iconImgSrc: "" };
          resolve(info);
        }, 100);
      });
    },
  };
}
