<template>
  <view class="webview-container">
    <custom-nav :title="'医院官网'" :isHomePage="false" />
    <web-view :src="url" style="margin-top: 44px;" />
  </view>
</template>

<script>
import customNav from '@/components/custom-nav/custom-nav.vue'
export default {
  components: { customNav },
  data() {
    return {
      url: ''
    }
  },
  onLoad(options) {
    if (options.url) {
      this.url = decodeURIComponent(options.url);
    }
  }
}
</script>

<style scoped>
.webview-container {
  width: 100%;
  height: 100vh;
}
</style>