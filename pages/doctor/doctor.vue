<template>
  <view class="page">
    <!-- pages/doctor/doctor.wxml -->
    <view class="custom-nav">
        <custom-nav title="e陪无忧" :isHomePage="true"></custom-nav>
    </view>
    <view class="first">
      <swiper class="swiper" circular autoplay interval="3000" duration="500">
        <swiper-item v-for="(banner, index) in banners" :key="index">
          <image
            :src="banner.image"
            mode="aspectFill"
            class="swiper-image"
          ></image>
          <text class="swiper-text">{{ banner.title }}</text>
        </swiper-item>
      </swiper>
    </view>
    <view class="second">
      <view class="second-item1">
        <view class="second-item1-text">
          <text class="second-item1-text1">考证</text>
          <text class="second-item1-text2">精选推荐</text>
          <text class="second-item1-text3">了解更多</text>
        </view>
        <image src="../../static/images/index/listen.png" alt=""></image>
      </view>
      <view class="second-item2" >
        <view class="second-item2-text">
          <text class="second-item2-text1">学习</text>
          <text class="second-item2-text2">一起来分享</text>
          <text class="second-item2-text3">了解更多</text>
        </view>
        <image src="../../static/images/index/money.png" alt=""></image>
      </view>
    </view>
    <view class="third">
      <text class="third-title">课程推荐</text>
      <text class="third-text">更多 ></text>
    </view>
    <view class="next">
      <img
        class="next-image"
        src="../../static/images/index/curse.jpg"
        alt=""
      />
      <view class="next-text">
        <text class="next-text1">如何提高陪诊师考证通过率？</text>
        <text class="next-text2">主讲人：金老师</text>
        <text class="next-text3">时间：2023/4/17 - 7/16</text>
        <text class="next-text4">￥199</text>
      </view>
    </view>
    <view class="third">
      <text class="third-title">优秀陪诊师</text>
      <text class="third-text" @click="goToDoctorListPage">更多 ></text>
    </view>

    <view class="doctor-list">
      <view class="doctor-card" v-for="(doctor, index) in doctors" :key="index" @click="goToDoctorDetailPage(doctor)">
        <view class="doctor-avatar">
          <image :src="doctor.avatarUrl" mode="aspectFill"></image>
        </view>
        <view class="doctor-info">
         <view class="doctor-first">
         	<view class="doctor-name">{{ doctor.name }}</view>
         	 <view class="doctor-gender">{{ doctor.gender }}</view>
         </view>
          <view class="doctor-location">{{doctor.address.cityName}}&nbsp;{{doctor.address.areaName}}</view>
          <view class="doctor-department">
            <img class="value-icon" src="../../static/images/index/value.png" alt="" />
            {{ doctor.moreInfo.rating }} &nbsp; | &nbsp;
            <img
                class="order-icon"
                src="../../static/images/doctor/order.png"
                alt=""
              />
            {{ doctor.moreInfo.order }}
          </view>
          <view class="specialty-container">
            <text class="doctor-specialty1" v-if="doctor.moreInfo.language">{{ doctor.moreInfo.language }}</text>
            <text class="doctor-specialty2" v-if="doctor.moreInfo.provide_transport">
              可接送
            </text>
          </view>
          <view class="doctor-tags">
          
            <text :class="['doctor-certification', doctor.is_certified  ? 'certified' : 'uncertified']">
              {{ doctor.is_certified ? '已认证' : '未认证' }}
            </text>
            <text :class="['doctor-availability', doctor.is_bookable? 'available' : 'unavailable']">
              {{ doctor.is_bookable ? '可预约' : '不可预约' }}
            </text>
          </view>
        </view>
        <view class="doctor-need">
          <view class="doctor-need-item">
            <view class="doctor-need-item-text">最近咨询</view>
            <image src="../../static/images/index/star.png" alt=""></image>
          </view>
        </view>
      </view>
    </view>
      <!-- </scroll-view> -->
    

    <!-- <view class="process-flow">
            <view class="flow-item" v-for="(item, index) in processSteps" :key="index">
                <view class="flow-content">
                    <view class="flow-circle">{{index + 1}}</view>
                    <view class="flow-text">
                        <text class="flow-title">{{item.title}}</text>
                        <text class="flow-desc">{{item.desc}}</text>
                    </view>
                </view>
                <view class="flow-arrow" v-if="index !== processSteps.length - 1">→</view>
            </view>
        </view> -->
  </view>
</template>

<script>
// pages/doctor/doctor.js
export default {
  data() {
    return {
      location: "广州",
      // processSteps: [
      //     { title: '报名注册', desc: '网上报名并提交材料' },
      //     { title: '资格审核', desc: '等待审核通过' },
      //     { title: '培训学习', desc: '参加专业培训课程' },
      //     { title: '考试认证', desc: '参加资格考试' }
      // ],
      banners: [],
      doctors: [
       
      ],
    };
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 先检查权限
    // uni.getSetting({
    //     success: (res) => {
    //         if (!res.authSetting['scope.userLocation']) {
    //             // 如果没有权限，先获取权限
    //             uni.authorize({
    //                 scope: 'scope.userLocation',
    //                 success: () => {
    //                     this.getLocationInfo();
    //                 },
    //                 fail: (err) => {
    //                     console.error('授权失败：', err);
    //                     // 用户拒绝授权
    //                     uni.showToast({
    //                         title: '需要位置权限才能获取您的位置信息',
    //                         icon: 'none'
    //                     });
    //                 }
    //             });
    //         } else {
    //             // 已有权限，直接获取位置
    //             this.getLocationInfo();
    //         }
    //     }
    // });
    this.getBanners();
    this.fetchDoctors();
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
  onUnload() {
    // uni.setNavigationBarColor({
    //   frontColor: "#ffffff",
    //   backgroundColor: "#54c69a",
    // });
    
  },
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
    async fetchDoctors() {
      try {
       const cityName = uni.getStorageSync('cityName');
       
        const provinceName = uni.getStorageSync('provinceName');
         const areaName = uni.getStorageSync('areaName');
         this.Location={provinceName,cityName,areaName}
         const location= this.Location;
         console.log("地址",this.Location)
       if (!location) {
         console.error('未找到缓存的位置信息');
         
       }
        const res = await uniCloud.callFunction({
          name: 'getEscorts', // 云函数名称
          data: { location: location }
        });
        if (res.result.success) {
          console.log('获取陪诊师数据成功:', res.result.data);
          this.doctors = res.result.data.data;
		 
        } else {
          console.error('获取陪诊师数据失败:', res.result.error);
        }
      } catch (err) {
        console.error('调用云函数失败:', err);
      }
    },
    goToDoctorDetailPage(doctor) {
      
      const doctorData = encodeURIComponent(JSON.stringify(doctor));
      uni.navigateTo({
        url: `/pages/doctordetail/doctordetail?doctor=${doctorData}`
      });
    },
	goToDoctorListPage(){
		
		uni.navigateTo({
		  url: `/pages/doctorlist/doctorlist`
		});
	},
    async getBanners() {
      try {
        uni.showLoading({
          title: "加载中",
        });

        const { result } = await uniCloud.callFunction({
          name: "getBanners",
        });

        if (result.code === 0) {
          this.banners = result.data;
        } else {
          throw new Error(result.msg);
        }
      } catch (e) {
        uni.showToast({
          title: "获取轮播图失败",
          icon: "none",
        });
      } finally {
        uni.hideLoading();
      }
    },
  },
};
</script>
<style>
/* pages/doctor/doctor.wxss */

.page {
  height: min-content;
  padding: 0 50rpx;
  padding-top: 200rpx;
  /* height: min-content; */
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(to bottom, #1cd6c7, #99efe9,rgb(239, 239, 239),rgb(239, 239, 239),rgb(239, 239, 239),rgb(239, 239, 239));
}
/* .custom-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 44px;
    padding-top: var(--status-bar-height);
    display: flex;
    align-items: center;
    padding-left: 16px;
    padding-right: 16px;
    z-index: 999;
} */

/* .location {
    display: flex;
    align-items: center;
    color: #ffffff;
    font-size: 14px;
    margin-right: 10px;
}

.location-text {
    margin-right: 4px;
}
.location-icon img{
    width: 30px;
    height: 30px;
}

.search-box {
    flex: 1;
    position: relative;
    height: 32px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 16px;
    display: flex;
    align-items: center;
    padding: 0 12px;
}

.search-box input {
    flex: 1;
    height: 100%;
    font-size: 14px;
    padding-right: 30px;
    margin-left: 10px;
}

.search-icon {
    width: 20px;
    height: 20px;

}

.placeholder-style {
    color: #999;
    font-size: 14px;
    margin-left: 10px;
} */
.first {
  margin-top: 0px;
  width: 100%;
  height: 250rpx;
  position: relative;
}

.swiper {
  width: 100%;
  height: 100%;
}

.swiper-image {
  width: 100%;
  height: 100%;
  border-radius: 20rpx;
}

.swiper-text {
  position: absolute;
  bottom: 30rpx;
  left: 30rpx;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}
.second {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 50rpx;
}
.second-item1 {
  width: 350rpx;
  height: 180rpx;
  background-color: #fff0b9;
  border-radius: 20rpx;
  overflow: hidden;
}
.second-item2 {
  width: 350rpx;
  height: 180rpx;
  background-color: #bae7ff;
  border-radius: 20rpx;
  overflow: hidden;
}
.second-item1-text {
  display: flex;
  flex-direction: column;
  margin-left: 10px;
}
.second-item1 image {
  width: 150rpx;
  height: 150rpx;
  margin-left: 80px;
  margin-top: -80px;
}
.second-item1-text1 {
  font-size: 40rpx;
  font-weight: bold;
  margin-top: 20px;
  color: #ac6800;
}
.second-item1-text2 {
  font-size: 20rpx;
  color: #fbae13;
  margin-top: 2px;
}
.second-item1-text3 {
  font-size: 18rpx;
  color: #d38806;
  margin-top: 5px;
  background-color: #ffffff;
  border-radius: 20px;
  padding: 5px;
  width: 40px;
  text-align: center;
}
.second-item2-text {
  display: flex;
  flex-direction: column;
  margin-left: 10px;
}
.second-item2 image {
  width: 150rpx;
  height: 150rpx;
  margin-left: 90px;
  margin-top: -80px;
}
.second-item2-text1 {
  font-size: 40rpx;
  font-weight: bold;
  margin-top: 20px;
  color: #0050b2;
}
.second-item2-text2 {
  font-size: 20rpx;
  color: #178fff;
  margin-top: 2px;
}
.second-item2-text3 {
  font-size: 18rpx;
  color: #0a6dd9;
  margin-top: 5px;
  background-color: #ffffff;
  border-radius: 20px;
  padding: 5px;
  width: 40px;
  text-align: center;
}
.third {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 5px;
  width: 100%;
}

.third-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.third-text {
  font-size: 26rpx;
  color: #666;
}
.next {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 15rpx;
  width: 100%;
  box-sizing: border-box;
}
.next-image {
  width: 250rpx;
  height: 180rpx;
}
.next-text {
  display: flex;
  flex-direction: column;
  margin-left: 40rpx;
}
.next-text1 {
  font-size: 30rpx;
  font-weight: bold;
}
.next-text2 {
  font-size: 25rpx;
  color: #999;
}
.next-text3 {
  font-size: 25rpx;
  color: #999;
}
.next-text4 {
  font-size: 40rpx;
  color: #e50707;
}

.doctor-list {
  padding: 20 0rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 20rpx;
}

.doctor-card {
  border-radius: 20rpx;
  padding: 20rpx;
  display: flex;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  position: relative;
  margin-bottom: 15rpx;
  background-color: #ffffff;
}

.doctor-avatar {
  width: 100px;
  height: 100px;
  margin-right: 15rpx;
}

.doctor-avatar image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.doctor-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.doctor-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 5rpx;
}

.doctor-location {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 5rpx;
  background-color: #f0f0f0;
  border-radius: 10rpx;
  padding: 5rpx 10rpx;
  width: fit-content;
}

.value-icon {
  width: 20rpx;
  height: 20rpx;
  margin-right: 5rpx;
}

.order-icon {
  width: 20rpx;
  height: 20rpx;
  margin-left: 10rpx;
}

.doctor-department {
  font-size: 24rpx;
  color: #e74c3c;
  margin-bottom: 5rpx;
}

.specialty-container {
  display: flex;
  gap: 10rpx;
}

.doctor-specialty1 {
  font-size: 22rpx;
  color: #3498db;
  line-height: 1.4;
  border: 1px solid #3498db;
  border-radius: 15rpx;
  padding: 4rpx 10rpx;
}

.doctor-specialty2 {
  font-size: 22rpx;
  line-height: 1.4;
  border-radius: 15rpx;
  padding: 4rpx 10rpx;
  color: #2ecc71;
  border: 1px solid #2ecc71;
}



.doctor-tags {
  display: flex;
  gap: 10rpx;
  margin-top: 10rpx;
}
.doctor-first{
	display: flex;
	flex-direction: row;
	align-items: center;
}

.doctor-availability,
.doctor-certification {
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 10rpx;
  color: #fff;
}

.doctor-gender {
 font-size: 20rpx;
 padding: 4rpx 8rpx;
 color: #3498db;
 margin-left: 20rpx;
/* background-color: #2ecc71; */
}

.doctor-availability.available {
  background-color: #2ecc71;
}

.doctor-availability.unavailable {
  background-color: #e74c3c;
}

.doctor-certification.certified {
  background-color: #f1c40f;
}

.doctor-certification.uncertified {
  background-color: #95a5a6;
}

.doctor-need {
  position: absolute;
  right: 10rpx;
  top: 10rpx;
}

.doctor-need-item {
  align-items: center;
  font-size: 24rpx;
  color: #666;
}

.doctor-need-item-text {
  margin-top: 5rpx;
  margin-right: 5rpx;
  color: #2980b9;
  background-color: #e6f7ff;
  border-radius: 10rpx;
  padding: 5rpx 10rpx;
}

.doctor-need-item image {
  width: 40rpx;
  height: 40rpx;
  margin-left: 50rpx;
  margin-top: 40rpx;
  background-color: #dcf4ff;
  padding: 20rpx;
  border-radius: 50%;
}
</style>
