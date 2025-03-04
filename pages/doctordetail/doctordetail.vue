<template>
  <view class="container">
    <custom-nav title="e陪无忧" :isHomePage="false"></custom-nav>
    <view class="doctor-card">
      <view class="doctor-info">
        <view class="name">{{ doctor.name }}</view>
        <view class="detail">
          <text class="location">{{ doctor.location }}</text>
          <text class="gender">{{ doctor.gender }}| &nbsp; </text>
          <text class="age">{{ doctor.age }}</text>
        </view>
        <view class="value">
          <img
            class="value-icon"
            src="../../static/images/index/value.png"
            alt=""
          />
          {{ doctor.moreInfo.rating }}
        </view>
        <view class="specialty-container">
          <text
            :class="[
              'doctor-certification',
              doctor.is_certified ? 'certified' : 'uncertified',
            ]"
          >
            {{ doctor.is_certified ? "已认证" : "未认证" }}
          </text>
          <text
            :class="[
              'doctor-availability',
              doctor.is_bookable ? 'available' : 'unavailable',
            ]"
          >
            {{ doctor.is_bookable ? "可预约" : "不可预约" }}
          </text>
        </view>
      </view>
      <view class="doctor-avatar">
        <image :src="doctor.avatarUrl" mode="aspectFill"></image>
      </view>
    </view>
    <view class="introduction">
      <img
        class="introduction-icon"
        src="../../static/images/doctor/user.png"
        alt=""
      />
      <text class="introduction-title">自我介绍</text>
      <view class="introduction-content">
        <text>{{ doctor.moreInfo.self_introduction }}</text>
      </view>
      <view class="work-container">
        <text class="doctor-work">{{ doctor.moreInfo.language }}</text>
        <text class="doctor-work" v-if="doctor.moreInfo.provide_transport"
          >可接送</text
        >
      </view>
    </view>
    <view class="tech">
      <img
        class="tech-icon"
        src="../../static/images/index/star (2).png"
        alt=""
      />
      <text class="tech-title">技能证书</text>
      <image :src="doctor.moreInfo.certificate" mode="aspectFill" class="tech-container"></image>
    </view>
    <view class="appointment">
      <img
        class="appointment-icon"
        src="../../static/images/doctor/hospital.png"
        alt=""
      />
      <text class="appointment-title">评价</text>
      <view class="reviews">
        <view
          class="review-item"
          v-for="(item, index) in doctor.moreInfo.review"
          :key="index"
        >
          <view class="review-rating">评分: {{ item.rating }}</view>
          <view class="review-text">{{ item.review }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      doctor: {},
    };
  },

  /**
   * 生命周期函数--监听页面加载
   */ onLoad(options) {
    if (options.doctor) {
      this.doctor = JSON.parse(decodeURIComponent(options.doctor));
    }
    console.log(this.doctor);
    console.log(this.doctor.moreInfo.certificate);
    
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
  methods: {},
};
</script>

<style>
.container {
    padding: 0 20rpx;
  padding-top: 200rpx;
  
}
.doctor-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-radius: 50rpx;
  /* width: 95%; */
  width: 100%;
  height: 450rpx;
}
.doctor-info {
  flex: 1;
}
.doctor-avatar {
  width: 300rpx;
  height: 300rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 50rpx;
  background-color: #043a78;
}
.doctor-avatar image {
  width: 100%;
  height: 100%;
}
.name {
  font-size: 50rpx;
  margin-top: 50rpx;
  margin-bottom: 15rpx;
  margin-left: 30rpx;
  font-weight: bold;
  font-family: cursive;
}
.detail {
  font-size: 30rpx;
  margin-left: 30rpx;
  margin-bottom: 10rpx;
}
.gender {
  color: #03968d;
  margin-left: 30rpx;
  font-weight: bold;
}
.age {
  color: #03968d;
  font-weight: bold;
}
.value {
  font-size: 40rpx;
  color: #ff9b17;
  margin-left: 30rpx;
}
.value-icon {
  width: 50rpx;
  height: 50rpx;
  margin-right: 5rpx;
  padding-top: 10rpx;
}
.specialty-container {
  display: flex;
  gap: 30rpx;
  margin-top: 10rpx;
  margin-bottom: 80rpx;
  margin-left: 30rpx;
}
.doctor-availability,
.doctor-certification {
  font-size: 30rpx;
  padding: 4rpx 8rpx;
  border-radius: 10rpx;
  color: #fff;
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

.doctor-specialty {
  font-size: 30rpx;
  color: #209c8a;
  line-height: 1.4;
  border: 1px solid #cce6e2;
  border-radius: 15rpx;
  padding: 4rpx 12rpx;
  margin-top: 10rpx;
}
.introduction {
  margin-top: 30rpx;
  background-color: #ffffff;
  padding: 20rpx;
  border-radius: 50rpx;
  width: 95%;
  height: 250rpx;
}
.introduction-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 5rpx;
  padding-top: 10rpx;
  margin-left: 30rpx;
}
.introduction-title {
  font-size: 35rpx;
}
.introduction-content {
  font-size: 30rpx;
  margin-top: 20rpx;
  margin-left: 30rpx;
  width: 80%;
  font-family: serif;
  font-weight: bold;
}
.work-container {
  margin-top: 20rpx;
  margin-left: 30rpx;
  gap: 40rpx;
  display: flex;
  flex-direction: row;
}

.doctor-work {
  font-size: 28rpx;
  color: #056660;
  line-height: 1.4;
  background-color: #b0d3d1;
  border-radius: 20rpx;
  padding: 6rpx 30rpx;
}
.tech {
  margin-top: 30rpx;
  background-color: #ffffff;
  padding: 20rpx;
  border-radius: 50rpx;
  width: 95%;
  height: 230rpx;
}
.tech-icon {
  width: 40rpx;

  height: 40rpx;
  margin-right: 5rpx;
  padding-top: 10rpx;
  margin-left: 30rpx;
}
.tech-title {
  font-size: 35rpx;
}
.tech-container {
  font-size: 35rpx;
  margin-top: 20rpx;
  margin-left: 30rpx;
  background-color: #fcdb92;
  border-radius: 20rpx;
  width: 250rpx;
  height: 120rpx;
  text-align: center;
  line-height: 120rpx;
  display: block;
}
.appointment {
  margin-top: 30rpx;
  background-color: #ffffff;
  padding: 20rpx;
  border-radius: 50rpx;
  width: 95%;
  height: 280rpx;
}
.appointment-icon {
  width: 40rpx;

  height: 40rpx;
  margin-right: 5rpx;
  padding-top: 10rpx;
  margin-left: 30rpx;
}
.appointment-title {
  font-size: 35rpx;
}
.appointment-title2 {
  font-size: 35rpx;
  margin-left: 70rpx;
}
.appointment-text {
  font-size: 30rpx;
  margin-top: 20rpx;
  margin-left: 30rpx;
  font-family: serif;
  font-weight: bold;
  margin-bottom: 20rpx;
}
.appointment-room {
  font-size: 40rpx;
}

.appointment-container {
  display: flex;
  flex-direction: row;
  margin-top: 20rpx;
}
.appointment-room {
  font-size: 30rpx;
  background-color: #b9d0ea;
  border-radius: 20rpx;
  padding: 6rpx 60rpx;
  color: #043a78;
  margin-left: 70rpx;
}

.reviews {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.review-item {
  padding: 10rpx;
  background-color: #f9f9f9;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.1);
}

.review-content {
  font-size: 30rpx;
  color: #555;
}

.review-rating {
  font-size: 24rpx;
  color: #f39c12;
  margin-bottom: 5rpx;
}

.review-text {
  font-size: 30rpx;
  color: #333;
}
</style>
