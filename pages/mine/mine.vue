<template>
    <view class="page">
        <view class="header">
     <img src="../../static/images/index/doctor.jpg" alt="">   
     <text class="username"> 用户名</text> 
     <text class="user-info"> 已实名</text>
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
        <view class="box">
            <image src="../../static/images/index/pay.png" alt=""></image>
            <text class="box-title">待付款</text>
        </view>
        <view class="box">
            <image src="../../static/images/index/ordering.png" alt=""></image>
            <text class="box-title">进行中</text>
        </view>
        <view class="box">
            <image src="../../static/images/index/finish.png" alt=""></image>
            <text class="box-title">已完成</text>
        </view>
        <view class="box">
            <image src="../../static/images/index/cancel.png" alt=""></image>
            <text class="box-title">已取消</text>
        </view>
    </view>
</view>
<view class="order-box">
        <text class="order-title">我的工具</text>
        <view class="order-item">
        <view class="box">
            <image src="../../static/images/index/address.png" alt=""></image>
            <text class="box-title">地址管理</text>
        </view>
        <view class="box">
            <image src="../../static/images/index/patient.png" alt=""></image>
            <text class="box-title">就诊人管理</text>
        </view>
        <view class="box">
            <image src="../../static/images/index/doctor.png" alt=""></image>
            <text class="box-title">我的陪诊师</text>
        </view>
        <view class="box">
            <image src="../../static/images/index/advice.png" alt=""></image>
            <text class="box-title">投诉建议</text>
        </view>
        <view class="box">
            <image src="../../static/images/index/help.png" alt=""></image>
            <text class="box-title">陪诊师入驻</text>
        </view>
        <view class="box">
            <image src="../../static/images/index/set.png" alt=""></image>
            <text class="box-title">设置中心</text>
        </view>
    </view>
</view>
    </view>
</template>

<script>
// pages/mine/mine.js
export default {
    data() {
        return {};
    }
    /**
     * 生命周期函数--监听页面加载
     */,
    onLoad(options) {},
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
    methods: {}
};
</script>
<style>
/* pages/mine/mine.wxss */
.page {
    min-height: 100vh;
    background: linear-gradient(to bottom, #54c69a, #fffcf9);
    padding-top: 0;
    margin-top: -1px; /* 消除可能的间隙 */
}
.header {
    display: flex;
}
.header img {
    width: 180rpx;
    height: 180rpx;
    border-radius: 50%;
    margin-left: 50rpx;
    margin-top: 50rpx;
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
    margin-top: 150rpx;
    background-color: #A5D63F;
    padding: 10rpx;
    height: 40rpx;
    border-radius: 15rpx;
}
.info-box {
    display: flex;
    margin-top: 40rpx;
    justify-content:space-evenly;
    background-color: #fff;
    border-radius: 15rpx;
    padding: 30rpx;
    margin-left: 20rpx;
    margin-right: 20rpx;
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
.money image     {
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
    padding: 30rpx;
    margin-left: 20rpx;
    margin-right: 20rpx;
}
.order-title {
    font-size: 18px;
    font-weight: bold;
    margin-left: 20rpx;
}
.order-item {
    display: flex;
    justify-content:flex-start; 
    margin-top: 20rpx;
    flex-wrap: wrap;
    gap: 20rpx 0;
}
.box {
    display: flex;
    align-items: center;
    flex-direction: column;
    margin-left: 30rpx;
    width: 20%;
    margin-bottom: 20rpx;
}
.box image {
    width: 70rpx;
    height: 70rpx;
}

.box-title {
    font-size: 13px;
    font-weight: bold;
    margin-top: 10rpx;
}



</style>

