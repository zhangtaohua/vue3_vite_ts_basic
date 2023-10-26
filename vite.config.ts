import { resolve } from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import cesium from "vite-plugin-cesium";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    cesium(),
    Components({
      resolvers: [AntDesignVueResolver()],
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        charset: false,
      },
    },
  },
  server: {
    proxy: {
      "/map": {
        target: "http://192.168.3.247:58787",
        // target: "http://82.157.180.248:58787",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/map/, ""),
      },
      "/geojson": {
        target: "http://belt-and-road-1256849727.cos.ap-beijing.myqcloud.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/geojson/, ""),
      },
      "/climateTrace": {
        target: "http://192.168.3.247:31101",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/climateTrace/, ""),
      },
    },
  },
});
