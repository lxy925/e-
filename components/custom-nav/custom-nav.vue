<template>
  <view class="custom-nav" :style="{ height: navHeight + 'px' }">
    <view class="nav-content" :style="{ marginTop: statusBarHeight + 'px' }">
      <view class="nav-left">
        <template v-if="isHomePage">
          <view class="location">
            <view class="location-icon">
              <image src="/static/images/icons/position.png"></image>
            </view>
            <text class="location-text">{{ location }}</text>
          </view>
        </template>
        <template v-else>
          <view class="back-button" @click="goBack">
            <img src="../../static/images/icons/left-arrow.png" alt="左箭头" style="width: 50rpx;height: 50rpx;">
          </view>
        </template>
      </view>
      <view class="nav-title">{{ title }}</view>
      <view class="nav-right"></view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'custom-nav',
  data() {
    return {
      statusBarHeight: 0,
      navHeight: 0,
      location: '广州'
    }
  },
  props: {
    title: {
      type: String,
      default: '陪诊师'
    },
    isHomePage: {
      type: Boolean,
      default: false
    }
  },
  created() {
    // 获取系统信息
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
    this.navHeight = this.statusBarHeight + 44 // 44是导航栏的高度
    uni.getSetting({
            success: (res) => {
                if (!res.authSetting['scope.userLocation']) {
                    // 如果没有权限，先获取权限
                    uni.authorize({
                        scope: 'scope.userLocation',
                        success: () => {
                            this.getLocationInfo();
                        },
                        fail: (err) => {
                            console.error('授权失败：', err);
                            // 用户拒绝授权
                            uni.showToast({
                                title: '需要位置权限才能获取您的位置信息',
                                icon: 'none'
                            });
                        }
                    });
                } else {
                    // 已有权限，直接获取位置
                    this.getLocationInfo();
                }
            }
        });
    // 获取位置信息
    // this.getLocationInfo()
  },
  methods: {
    getLocationInfo() {
      uni.getSetting({
        success: (res) => {
          if (!res.authSetting['scope.userLocation']) {
            uni.authorize({
              scope: 'scope.userLocation',
              success: () => {
                this.getLocation()
              }
            })
          } else {
            this.getLocation()
          }
        }
      })
    },
    getLocation() {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.getCity(res.latitude, res.longitude)
        }
      })
    },
    getCity(latitude, longitude) {
      uni.request({
        url: 'https://restapi.amap.com/v3/geocode/regeo',
        data: {
          location: `${longitude},${latitude}`,
          key: '5781b7732ae9793dce03c709a9d0b0af',
          extensions: 'base'
        },
        success: (res) => {
          if (res.data.status === '1') {
            this.location = res.data.regeocode.addressComponent.city
          }
        }
      })
    },
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style>
.custom-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #1ee8d4;
  z-index: 999;
}

.nav-content {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
}

.nav-left {
  display: flex;
  align-items: center;
}

.location {
  display: flex;
  align-items: center;
}

.location-icon image {
  width: 20px;
  height: 20px;
}

.location-text {
  color: #fff;
  font-size: 14px;
  margin-left: 5px;
}

.back-button {
  color: #fff;
  font-size: 16px;
  
  margin-right: 75rpx;
}

.nav-title {
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
 
}

.nav-right {
  width: 60px;
}
</style> 