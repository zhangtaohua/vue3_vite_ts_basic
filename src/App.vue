<template>
  <div class="wh_100vw_100vh app_container">
    <router-view />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.app_container {
  overflow: scroll;
  scroll-behavior: smooth;
  margin: 0;
  padding: 0;
}

.app_container::-webkit-scrollbar {
  display: none;
  width: 0;
}
</style>
