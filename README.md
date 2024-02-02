# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support For `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

# git commit

```
  <type> (<scope>) : <subject>
```

types

```
init: 初始化
feat: 新功能 feature
fix: 修复 bug
docs: 文档注释
style: 代码格式(不影响代码运行的变动)
refactor: 重构、优化(既不增加新功能，也不是修复bug)
perf: 性能优化
test: 增加测试
build: 打包 影响项目构建或依赖项修改
ci: 持续集成相关文件修改
merge: 代码合并
sync: 同步主线或分支的Bug
chore: 构建过程或辅助工具的变动
revert: 回退
```

# 使用方法

1、yarn install

2、yarn prepare

3、安装 EditorConfig for VS Code 插件

4、安装 ESLint for VS Code 插件

5、安装 Prettier for VS Code 插件

6、安装 Stylelint for VS Code 插件

# 参考文档

## 1、onlyoffice 修改地方

1、 docker run -i -t -d -p 8701:80 -e JWT_ENABLED=false onlyoffice/documentserver 2、 docker exec -it 6d9cf07ee0e621a3ba916a881bf75936ebf51d17384a53e7e640005d315862a7 /bin/bash 3、 进入后执行 supervisorctl restart all

4、 为了加载本地文件修改 /etc/onlyoffice/documentserver/default.json 中的字段为 “rejectUnauthorized”: false

5、 为了 解决 It is private IP address 错误 修改

/etc/onlyoffice/documentserver/local.json

```
{
  "services": {
    "CoAuthoring": {
      "request-filtering-agent": {
        "allowPrivateIPAddress": true,
        "allowMetaIPAddress": true
      },
```

## 2、 其它

https://github.com/shashwatak/satellite-js https://openlayers.org/workshop/en/webgl/points.html https://lil-gui.georgealways.com/ https://www.mycurvefit.com/

## 3 cesium

https://github.com/alberto-acevedo/cesium-navigation https://github.com/zhangti0708/cesium-measure https://github.com/hongfaqiu/cesium-extends https://github.com/xtfge/cesium-measure https://github.com/mokrayaGISka/cesium_measurementTool.git https://github.com/alberto-acevedo/cesium-navigation.git

https://deep-time.org/

https://help.agi.com/STKWebVisualizationLibrary/Measure.html

https://maplibre.org/maplibre-gl-js/docs/

https://github.com/mbloch/mapshaper

https://juejin.cn/post/7196614877309370427 对 GeoJSON 的重投影 pnpm add reproj-helper pnpm add reproject

https://github.com/missive/emoji-mart https://github.com/delowardev/vue3-emoji-picker

fabric konva pixi.js matter.js gojs butterfly
