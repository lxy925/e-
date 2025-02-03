<template>
  <view class="page-container" >
    <custom-nav title="e陪无忧" :isHomePage="true"></custom-nav>
    <view class="textTop"> 祝您有一个健康的一天 </view>
    <view class="uni-margin-wrap">
      <swiper
        class="swiper"
        circular
        :indicator-dots="true"
        :autoplay="true"
        :interval="3000"
        :duration="500"
      >
        <swiper-item v-for="banner in banners" :key="banner._id" @tap="handleBannerClick(banner)">
          <image :src="banner.image" mode="aspectFill" style="width: 100%;"></image>
        </swiper-item>
      </swiper>

      <!-- 新增的图标导航栏 -->
      <view class="icon-nav">
        <view
          class="icon-item"
          v-for="(item, index) in navItems"
          :key="index"
          @tap="handleNavClick(item.path)"
        >
          <image :src="item.icon" mode="aspectFit" class="nav-icon"></image>
          <text class="nav-text">{{ item.text }}</text>
        </view>
      </view>
    </view>

    <!-- 热门医院推荐 -->
    <view class="hospital-section">
     
        <view class="section-header">
          <text class="section-title">热门医院推荐</text>
          <view class="more-link" @tap="navigateToMore">
            更多<text class="arrow">></text>
          </view>
        </view>

        <view class="hospital-list">
         <scroll-view>
          <view
            class="hospital-item"
            v-for="hospital in hospitals"
            :key="hospital.id"
            @tap="navigateToHospital(hospital.id)"
          >
            <image
              :src="hospital.image"
              mode="aspectFill"
              class="hospital-image"
            ></image>
            <view class="hospital-info">
              <view class="hospital-header">
                <text class="hospital-name">{{ hospital.name }}</text>
                <text class="hospital-level">{{ hospital.level }}</text>
              </view>
              <view class="hospital-detail">
                <view class="detail-item">
                  <text class="label">类型：</text>
                  <text class="value">{{ hospital.type }}</text>
                </view>
                <view class="detail-item">
                  <text class="label">电话：</text>
                  <text class="value">{{ hospital.phone }}</text>
                </view>
                <view class="detail-item address">
                  <text class="label">地址：</text>
                  <text class="value">{{ hospital.address }}</text>
                </view>
              </view>
            </view>
            
          </view>
        </scroll-view>
        </view>
     
    </view>
  </view>
</template>

<script>
// pages/index/index.js
export default {
  data() {
    return {
      banners: [],
      indicatorDots: true,
      autoplay: true,
      interval: 2000,
      duration: 500,
      startY: 0,
      endY: 0,
      navItems: [
        {
          icon: "/static/images/index/index-service.png",
          text: "我要陪诊",
          path: "/pages/service/service",
        },
        {
          icon: "/static/images/index/index-help.png",
          text: "急救方法",
          path: "/pages/help/help",
        },
        {
          icon: "/static/images/index/index-prevent.png",
          text: "重疾防治",
          path: "/pages/prevent/prevent",
        },
        {
          icon: "/static/images/index/index-test.png",
          text: "陪诊师考题",
          path: "/pages/test/test",
        },
      ],
      hospitals: [
        {
          id: 1,
          name: "北京协和医院",
          level: "三级甲等",
          type: "综合医院",
          phone: "010-69156114",
          address: "北京市东城区帅府园一号",
          image: "/static/images/hospitals/hospital1.jpg",
        },
        {
          id: 2,
          name: "北京大学第一医院",
          level: "三级甲等",
          type: "综合医院",
          phone: "010-83572211",
          address: "北京市西城区西什库大街8号",
          image: "/static/images/hospitals/hospital2.jpg",
        },
        {
          id: 3,
          name: "中国医学科学院肿瘤医院",
          level: "三级甲等",
          type: "综合医院",
          phone: "010-65156114",
          address: "北京市朝阳区潘家园南里17号",
          image: "/static/images/hospitals/hospital3.jpg",
        },
        {
          id: 4,
          name: "北京友谊医院",
          level: "三级甲等",
          type: "综合医院",
          phone: "010-65156114",
          address: "北京市西城区永安路95号",
          image: "/static/images/hospitals/hospital4.jpg",
        },
      ],
    };
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getBanners()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
  methods: {
    handleNavClick(path){
      uni.navigateTo({
        url: path,
      });
    },
    navigateToMore() {
      uni.navigateTo({
        url: "/pages/more/more",
      });
    },
    navigateToHospital(id) {
      uni.navigateTo({
        url: `/pages/hospital/detail?id=${id}`,
      });
    },
    // 获取轮播图数据
    async getBanners() {
      try {
        uni.showLoading({
          title: '加载中'
        })
        
        const { result } = await uniCloud.callFunction({
          name: 'getBanners'
        })
        
        if (result.code === 0) {
          this.banners = result.data
        } else {
          uni.showToast({
            title: result.msg || '获取轮播图失败',
            icon: 'none'
          })
        }
      } catch (e) {
        uni.showToast({
          title: '获取轮播图失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    // 处理轮播图点击
    handleBannerClick(banner) {
      if (banner.url) {
        uni.navigateTo({
          url: banner.url,
          fail() {
            uni.showToast({
              title: '页面跳转失败',
              icon: 'none'
            })
          }
        })
      }
    },
  },
};
</script>
<style>

.page-container {
 height: min-content;
  /* background: linear-gradient(to bottom, #02D4C6, #1E90FF); */
  position: relative;
  padding-top: 180rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-self: center;
}
.textTop {
  text-align: left;
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  margin-top: 50rpx;
  width: 650rpx;
}
.uni-margin-wrap {
  width: 650rpx;
  padding: 35rpx;
  padding-top: 10rpx;
  margin-top: 40rpx;
}
.swiper {
  height: 250rpx;
  border-radius: 20rpx;
  overflow: hidden;
}
.swiper-item {
  display: block;
  height: 200rpx;
  line-height: 300rpx;
}
.swiper-item image {
  width: 100%;
  height: 100%;
  border-radius: 20rpx;
}

.icon-nav {
  background-color: #ffffff;
  height: 120rpx;
  border-radius: 20rpx;
  margin-top: 45rpx;
  padding: 30rpx 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.icon-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10rpx;
}

.nav-icon {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 10rpx;
}

.nav-text {
  font-size: 26rpx;
  color: #333333;
}

.hospital-section {
  padding: 0 30rpx;
  margin-top: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.more-link {
  font-size: 26rpx;
  color: #666;
}

.arrow {
  margin-left: 4rpx;
  color: #999;
}

.hospital-list {
  width: 650rpx;
  overflow: scroll;
  height: 544rpx;
}

.hospital-item {
  display: flex;
  background: #ffffff;
  padding: 20rpx;
  margin-bottom: 20rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.hospital-image {
  width: 180rpx;
  height: 180rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
}

.hospital-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hospital-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  align-items: flex-start; 
}

.hospital-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-right: 16rpx;
  width: 250rpx;
}

.hospital-level {
  font-size: 24rpx;
  color: #02d4c6;
  background: rgba(2, 212, 198, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.hospital-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.detail-item {
  display: flex;
  font-size: 26rpx;
  margin-bottom: 8rpx;
}

.detail-item .label {
  color: #999;
  min-width: 80rpx;
}

.detail-item .value {
  color: #666;
  flex: 1;
}

.detail-item.address {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.detail-item.address .value {
  word-break: break-all;
}
</style>
