// stores/tabbar.js
import { defineStore } from 'pinia';

export const useTabbarStore = defineStore('tabbar', {
  state: () => ({
    // 初始化导航栏配置为空数组
    tabbarConfig: uni.getStorageSync('tabbarConfig') || []
  }),
  actions: {
    // 动态设置导航栏配置
    setTabbar(config) {
      this.tabbarConfig = config;
      // 将导航栏配置存储到本地缓存中
      uni.setStorageSync('tabbarConfig', config);
    }
  }
});