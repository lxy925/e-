<template>
    <view class="page">
        <view class="header" @click="handleHeaderClick">
    <img :src="userInfo.avatarUrl || '../../static/images/index/touxiang.jpg'" alt="">   
    <text class="username" >{{userInfo.realName || '登录/注册'}}</text> 
    <text class="user-info" v-if="userInfo.realName" >已实名</text>
</view>

    <view class="info-box">

    <view class="money">
        <text class="money-num"> 1</text>
        <view class="money-box">
          <image src="../../static/images/index/money (2).png" alt=""></image>
          <text class="money-title"> 当前余额（元）</text>
        </view>
      </view>
      <view class="benefit">
        <text class="benefit-num"> 0</text>
        <view class="benefit-box">
          <image src="../../static/images/index/card.png" alt=""></image>
          <text class="benefit-title">优惠券</text>
        </view>
      </view>
    </view>
    <view class="order-box">
      <text class="order-title">基本功能</text>
      <view class="order-item">
        <view class="box" style="margin-left: 0;">
          <image src="../../static/images/mine/pay.png" alt=""></image>
          <text class="box-title">待付款</text>
        </view>
        <view class="box">
          <image src="../../static/images/mine/ordering.png" alt=""></image>
          <text class="box-title">进行中</text>
        </view>
        <view class="box">
          <image src="../../static/images/mine/finish.png" alt=""></image>
          <text class="box-title">已完成</text>
        </view>
        <view class="box">
          <image src="../../static/images/mine/cancel.png" alt=""></image>
          <text class="box-title">已取消</text>
        </view>
      </view>
    </view>
    <view class="order-box">
      <text class="order-title">我的工具</text>
      <view class="order-item">
        <view class="box" id="box1" style="margin-left: 0;">
          <image src="../../static/images/mine/location.png" alt=""></image>
          <text class="box-title">地址管理</text>
        </view>
        <view class="box">
          <image src="../../static/images/mine/patient.png" alt=""></image>
          <text class="box-title">就诊人管理</text>
        </view>
        <view class="box">
          <image src="../../static/images/mine/doctor.png" alt=""></image>
          <text class="box-title">我的陪诊师</text>
        </view>
        <view class="box">
          <image src="../../static/images/mine/advice.png" alt=""></image>
          <text class="box-title">投诉建议</text>
        </view>
        <view class="box" style="margin-left: 0;" @click="doctorRegister">
          <image src="../../static/images/mine/help.png" alt=""></image>
          <text class="box-title">陪诊师入驻</text>
        </view>
        <view class="box">
          <image src="../../static/images/mine/setting.png" alt=""></image>
          <text class="box-title">设置中心</text>
        </view>
    </view>
</view>
<view class="logout-box" v-if="userInfo.realName">
    <image src="../../static/images/mine/logout.png" alt=""></image>
<button class="logout" @click="logout"  >退出登录</button>
</view>
    </view>
</template>



<script>
// pages/mine/mine.js
export default {
    data() {
        return {
            userInfo: {
                avatarUrl: '',
                realName: ''
            },
        };
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {},
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {},
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
         // 从本地存储获取用户信息
    const userInfo = uni.getStorageSync('userInfo');
    if (userInfo) {
        this.userInfo = userInfo;
    }
       
    },
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
       getUserProfilePage() {
        uni.navigateTo({
               url: '/pages/userInfoDetail/userInfoDetail?from=mine'
            });
        },
        logout() {
        // 清除本地存储的用户信息
        uni.removeStorageSync('userInfo');
        // 重置当前页面的用户信息
        this.userInfo = {
            avatarUrl: '',
            realName: ''
        };
        // 显示提示信息
        uni.showToast({
            title: '退出登录成功',
            icon: 'success',
            duration: 2000
        });
    },
    doctorRegister() {
        uni.navigateTo({
            url: '/pages/doctorlogin/doctorlogin'
        });
    },
    handleHeaderClick() {
        if (!this.userInfo.realName) {
            this.getUserProfilePage();
        }
    }

    }
}


</script>
<style>
/* pages/mine/mine.wxss */
.page {
  min-height: 100vh;
  background: linear-gradient(
    to bottom,
    #0bd6c8,
    #99efe9,
    #ddf5f4,
    rgb(226, 226, 226)
  );
  padding-top: 0 50rpx;
  margin-top: -1px; /* 消除可能的间隙 */
  padding-top: 150rpx;
}
.header {
  display: flex;
  align-items:center;
}
.header img {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  margin-left: 50rpx;
  margin-top: 50rpx;
}
.user{
  display: flex;
  flex-direction: column;
  justify-content: baseline;
}
.username {
  font-size: 25px;
  font-weight: bold;
  margin-left: 50rpx;
  margin-top: 130rpx;
}
.user-info {
  font-size: 13px;
  font-weight: bold;
  margin-left: 30rpx;
  margin-top: 140rpx;
  background-color: #a5d63f;
  padding: 10rpx;
  height: 40rpx;
  border-radius: 15rpx;
}
.info-box {
  display: flex;
  margin-top: 40rpx;
  justify-content: space-evenly;
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-left: 50rpx;
  margin-right: 50rpx;
  /* width: 100%; */
}
.money {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.money-box {
  display: flex;
  align-items: center;
  margin-right: 20rpx;
  margin-top: 70rpx;
}
.benefit {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.benefit-box {
  display: flex;
  align-items: center;
  margin-right: 40rpx;
  margin-top: 70rpx;
}

.money-num {
  font-size: 25px;
  font-weight: bold;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.benefit-num {
  font-size: 25px;
  font-weight: bold;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.money-title {
  font-size: 13px;
  font-weight: bold;
  margin-left: 10rpx;
}
.benefit-title {
  font-size: 13px;
  font-weight: bold;
  margin-left: 10rpx;
}
.money image {
  width: 48rpx;
  height: 48rpx;
}
.benefit image {
  width: 50rpx;
  height: 50rpx;
}
.order-box {
  margin-top: 40rpx;
  background-color: #fff;
  border-radius: 15rpx;
  padding: 20rpx;
  margin-left: 50rpx;
  margin-right: 50rpx;
}
.order-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-left: 20rpx;
}
.order-item {
  margin-top: 20rpx;
  display: flex;
  
  flex-wrap: wrap;
  /* justify-content: space-a; */
}
.box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 23%;
  margin-bottom: 20rpx;
  margin-left:  15rpx;
}
.box image {
  width: 70rpx;
  height: 70rpx;
  margin-bottom: 10rpx;
}
.box-title {
    font-size: 13px;
    font-weight: bold;
    margin-top: 10rpx;
}
.logout-box {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 40rpx;
}
.logout-box image {
    width: 50rpx;
    height: 50rpx;
    position: absolute;  /* 使用绝对定位 */
    left: calc(50% - 120rpx);  /* 调整图标位置 */
    z-index: 1;

}

.logout-box button {
    width: 400rpx;
    height: 80rpx;
    background-color: #54c69a;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-left: 50rpx; 
}





</style>
