<template>
  <div class="wh_100vw_100vh app_container">
    <router-view />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.app_container {
  margin: 0;
  padding: 0;
  overflow: scroll;
  scroll-behavior: smooth;
}

.app_container::-webkit-scrollbar {
  display: none;
  width: 0;
}
</style>
