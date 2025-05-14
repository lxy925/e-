<template>
 <view 
     class="custom-nav" 
     :style="{ 
       height: navHeight + 'px',
       backgroundColor: `rgba(114, 221, 232, ${navOpacity})`,
       color: '#fff' // 强制字体颜色为白色
     }"
   >
    <view class="nav-content" :style="{ marginTop: statusBarHeight + 'px' }">
      <view class="nav-left">
        <template v-if="isHomePage">
          <view class="location" @click="chooseLocation">
            <view class="location-icon">
              <image src="/static/images/icons/position.png"></image>
            </view>
            <text class="location-text" :style="{ color: textColor }">
              {{ locationName }} 
            </text>
          </view>
        </template>
        <template v-else>
          <view class="back-button" @click="goBack">
            <image 
              src="/static/images/icons/left-arrow.png" 
              :style="{ 
                width: '50rpx',
                height: '50rpx',
                filter: textColor === '#fff' ? 'brightness(10)' : 'brightness(1)'
              }"
            />
          </view>
        </template>
      </view>
      <view class="nav-title" :style="{ color: textColor }">
        {{ title }}
      </view>
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
      location: {},
      locationName: '广州',
      locationInfo: null,
      navOpacity: 0
      
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
    },
    scrollTop: {
      type: Number,
      default: 0
    }
  },
 
  watch: {
   scrollTop(newVal) {
         // 修改透明度计算逻辑：从 0 开始，随滚动增加
         this.navOpacity = Math.min(newVal / 100, 1); // 调整分母可改变变化速度
       }
  },
  created() {
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
    this.navHeight = this.statusBarHeight + 44
    this.checkLocationPermission()
  },
  methods: {
    checkLocationPermission() {
      uni.getSetting({
        success: (res) => {
          if (!res.authSetting['scope.userLocation']) {
            uni.authorize({
              scope: 'scope.userLocation',
              success: () => {
                this.getLocationInfo()
              },
              fail: (err) => {
                console.error('授权失败：', err)
                uni.showToast({
                  title: '需要位置权限才能获取您的位置信息',
                  icon: 'none'
                })
              }
            })
          } else {
            this.getLocationInfo()
          }
        }
      })
    },
    chooseLocation() {
      if (!this.location) {
        uni.showToast({
          title: '正在获取定位...',
          icon: 'loading'
        })
        return
      }
      uni.chooseLocation({
        success: (res) => {
          this.getCity(res.latitude, res.longitude)
        },
        fail: (err) => {
          console.error("选择位置失败：", err)
        }
      })
    },
    getLocationInfo() {
      const cachedLocation = uni.getStorageSync('cityName')
      if (cachedLocation) {
        this.locationName = cachedLocation
      } else {
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
      }
    },
    getLocation() {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.location.latitude = res.latitude
          this.location.longitude = res.longitude
          this.getCity(res.latitude, res.longitude)
        }
      })
    },
    getCity(latitude, longitude) {
      uni.request({
        url: 'https://restapi.amap.com/v3/geocode/regeo',
        data: {
          location: `${longitude},${latitude}`,
          key: '06d3e5f2f7ed1bf8504fe90a1a1e04e5',
          extensions: 'base'
        },
        success: (res) => {
          if (res.data.status === '1') {
            this.locationName = res.data.regeocode.addressComponent.city
            uni.setStorageSync('cityName', res.data.regeocode.addressComponent.city)
            uni.setStorageSync('provinceName', res.data.regeocode.addressComponent.province)
            uni.setStorageSync('areaName', res.data.regeocode.addressComponent.district)
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

<style scoped>
.custom-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  transition: all 0.3s ease;
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
  font-size: 14px;
  margin-left: 5px;
  transition: color 0.3s ease;
}

.back-button {
  margin-right: 75rpx;
}

.nav-title {
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  transition: color 0.3s ease;
}

.nav-right {
  width: 60px;
}
</style>