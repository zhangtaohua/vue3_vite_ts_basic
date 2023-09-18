<template>
  <div class="col_nw_fs_center example_container">
    <div class="col_nw_fs_center ol_example_container">
      <div class="row_nw_center_center ol_title">Openlayers 实例</div>
      <div class="row_nw_fs_center ol_example_box">
        <router-link to="/openlayers/xyz" class="ol_example_title">xyzLayer 实例之高德地图</router-link>
        <router-link to="/openlayers/mapbox" class="ol_example_title">mapboxStyleLayer 实例</router-link>
        <router-link to="/openlayers/image" class="ol_example_title">静态图实例</router-link>
        <router-link to="/openlayers/geoImage" class="ol_example_title">geo图实例</router-link>
        <router-link to="/openlayers/geojson" class="ol_example_title">Geojson实例</router-link>
        <router-link to="/openlayers/dawnline" class="ol_example_title">DawnLine 实例</router-link>
        <router-link to="/openlayers/orbit" class="ol_example_title">卫星轨道 实例</router-link>
        <router-link to="/openlayers/draw" class="ol_example_title">普通绘制 实例</router-link>
        <router-link to="/openlayers/drawlabel" class="ol_example_title">绘制标注 实例</router-link>
        <router-link to="/openlayers/comprehensive" class="ol_example_title">综合实例</router-link>
      </div>

      <div class="row_nw_center_center ol_title">cesium 实例</div>
      <div class="row_nw_fs_center ol_example_box">
        <router-link to="/cesium/load" class="ol_example_title">基础底图切换 实例</router-link>
        <router-link to="/cesium/orbit" class="ol_example_title">卫星轨道 实例</router-link>
        <router-link to="/cesium/point" class="ol_example_title">Entity 点(point) 实例</router-link>
        <router-link to="/cesium/billboard" class="ol_example_title">Entity 广告牌(billboard) 实例</router-link>
        <router-link to="/cesium/model" class="ol_example_title">Entity 模型(model) 实例</router-link>
        <router-link to="/cesium/singleimg" class="ol_example_title">图层 单张图片 实例</router-link>
        <router-link to="/cesium/geojson" class="ol_example_title">图层 geojson 实例</router-link>
        <router-link to="/cesium/draw" class="ol_example_title">图层 draw 实例</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.example_container {
  width: 100%;
  height: 100%;
}

.ol_example_container {
  width: 98%;
  height: auto;
}

.ol_title {
  width: 100%;
  height: 60px;
  margin-top: 16px;
  font-weight: bold;
  font-size: 32px;
}

.ol_example_box {
  flex-wrap: wrap;
  width: 100%;
  height: auto;
  margin-top: 16px;
}

.ol_example_title {
  width: 25%;
  height: 48px;
  margin: 0;
  font-size: 20px;
}
</style>
