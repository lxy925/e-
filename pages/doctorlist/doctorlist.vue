<template>
  <view class="page">
    <custom-nav title="e陪无忧" :isHomePage="false"></custom-nav>
    <view class="search-box">
      <image class="search-icon" src="../../static/images/icons/search.png"></image>
      <input type="text" placeholder="搜索陪诊师的名字" placeholder-class="placeholder-style" />
    </view>
    <view class="doctor-list">
      <view class="doctor-card" v-for="(doctor, index) in doctors" :key="index" @click="goToDoctorDetailPage(doctor)">
        <view class="doctor-avatar">
          <image :src="doctor.avatar" mode="aspectFill"></image>
        </view>
        <view class="doctor-info">
          <view class="doctor-name">{{ doctor.name }}</view>
          <view class="doctor-location">{{ doctor.address }}</view>
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
            <text class="doctor-specialty1">{{ doctor.moreInfo.language }}</text>
            <text class="doctor-specialty2" v-if="doctor.moreInfo.provide_transport">
              可接送
            </text>
          </view>
          <view class="doctor-tags">
            <text :class="['doctor-gender', (doctor.gender=='男')? 'male' : 'female']">{{ doctor.gender }}</text>
            
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
  </view>
</template>

<script>
// pages/health/health.js
export default {
  data() {
    return {
      doctors: []
    };
  },
  /**
   * 生命周期函数--监听页面加载
   */ onLoad(options) {
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
    async fetchDoctors() {
      try {
        const location = uni.getStorageSync('location');
        if (!location) {
          console.error('未找到缓存的位置信息');
          location="广州市";
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
  },
};
</script>

<style>
.page{
  padding:0 50rpx;
padding-top: 200rpx;

}
.search-box {
  flex: 1;
  position: relative;
  height: 40px;
  background: rgb(255, 255, 255);
  border-radius: 16px;
  display: flex;
  align-items: center;
  padding: 0 px;
  margin: 10px 0px;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.search-box input {
  flex: 1;
  height: 100%;
  font-size: 14px;
  padding-right: 20px;
  margin-left: 20px;
  /* background-color: #2980b9; */
}

.search-icon {
  width: 20px;
  height: 20px;
  margin-left: 20px;
}

.placeholder-style {
  color: #999;
  font-size: 14px;
  margin-left: 10px;
}
.doctor-list {
  /* padding: 20rpx; */
  padding-top: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.doctor-card {
  border-radius: 12rpx;
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

.doctor-gender,
.doctor-availability,
.doctor-certification {
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 10rpx;
  color: #fff;
}

.doctor-gender {
  background-color: #3498db;
}
.doctor-gender {
  background-color: #ed32be;
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
