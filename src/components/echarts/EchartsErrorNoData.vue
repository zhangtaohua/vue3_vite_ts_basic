<template>
  <div class="error_containner">
    <svg
      width="0"
      height="0"
      viewBox="0 0 837 1045"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      xmlns:sketch="http://www.bohemiancoding.com/sketch/ns"
    >
      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
        <path
          id="Polygon-1"
          d="M353,9 L626.664028,170 L626.664028,487 L353,642 L79.3359724,487 L79.3359724,170 L353,9 Z"
          stroke="#007FB2"
          stroke-width="6"
          sketch:type="MSShapeGroup"
        />
        <path
          id="Polygon-2"
          d="M78.5,529 L147,569.186414 L147,648.311216 L78.5,687 L10,648.311216 L10,569.186414 L78.5,529 Z"
          stroke="#EF4A5B"
          stroke-width="6"
          sketch:type="MSShapeGroup"
        />
        <path
          id="Polygon-3"
          d="M773,186 L827,217.538705 L827,279.636651 L773,310 L719,279.636651 L719,217.538705 L773,186 Z"
          stroke="#795D9C"
          stroke-width="6"
          sketch:type="MSShapeGroup"
        />
        <path
          id="Polygon-4"
          d="M639,529 L773,607.846761 L773,763.091627 L639,839 L505,763.091627 L505,607.846761 L639,529 Z"
          stroke="#F2773F"
          stroke-width="6"
          sketch:type="MSShapeGroup"
        />
        <path
          id="Polygon-5"
          d="M281,801 L383,861.025276 L383,979.21169 L281,1037 L179,979.21169 L179,861.025276 L281,801 Z"
          stroke="#36B455"
          stroke-width="6"
          sketch:type="MSShapeGroup"
        />
      </g>
    </svg>
    <div class="col_nw_center_center message_box">
      <h1>暂无数据</h1>
      <p>请稍后重试</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "EchartsErrorNoData",
});
</script>

<style scoped lang="scss">
.error_containner {
  position: relative;
  width: 100%;
  height: 100%;
}

svg {
  position: absolute;
  top: 0;
  left: 5%;
  width: 90%;
  height: 90%;
}

.message_box {
  position: absolute;
  width: 100%;
  height: 100%;
  color: #333;
  font-weight: 400;
  text-align: center;
}

.message_box h1 {
  margin-bottom: 2.5rem;
  color: #333;
  font-size: 2.375rem;
  line-height: 2.875rem;
}

#Polygon-1,
#Polygon-2,
#Polygon-3,
#Polygon-4,
#Polygon-4,
#Polygon-5 {
  animation: float 1s infinite ease-in-out alternate;
}

#Polygon-2 {
  animation-delay: 0.2s;
}

#Polygon-3 {
  animation-delay: 0.4s;
}

#Polygon-4 {
  animation-delay: 0.6s;
}

#Polygon-5 {
  animation-delay: 0.8s;
}

@keyframes float {
  100% {
    transform: translateY(20px);
  }
}
</style>
