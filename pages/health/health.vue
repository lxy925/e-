<template>
    <view class="page">
        <view class="custom-nav">
            <custom-nav title="e陪无忧" :isHomePage="true"></custom-nav>
        </view>
        <view class="announcement-bar">
            <img class="notice" src="../../static/images/health/notice.png" alt="">
            <view class="scroll-container">
                <view class="announcement-text">复诊提醒！距离您下次复诊的时间还有三天！请注意安排时间，提前挂号预约哦！</view>
            </view>
        </view>
        <view class="first">
        <view class="drug">
            <view class="drug-title">
                <img class="tip" src="../../static/images/health/tip.png" alt="">
              <text class="title"> 药品提醒</text>
            </view>

            <view class="drug-content">
                <img class="water" src="../../static/images/health/water.png" alt="">
                <view class="drug-text">
                <text class="time">今日早上</text>
                <text class="eat">头孢  1片</text>
                <text class="eat">阿莫西林  1片</text>
            </view>
            </view>
            <view class="divider"></view> <!-- 分割线 -->
            <view class="drug-content">
                <img class="cup" src="../../static/images/health/cup.png" alt="">
                <view class="drug-text">
                <text class="date">已经按时服药</text>
            </view>
            <text class="dalay">4天</text>
        </view>
    </view>
</view>
        <view class="share">
          <view class="share-title">
            <img class="title-img" src="../../static/images/health/adver.png" alt="">
            <text class="title">相关药物 / 药械推荐</text>
            <text class="more">更多 ></text>
          </view>
          <view class="share-content">
            <view class="share-item">
              <img class="share-img" src="../../static/images/health/watch.jpg" alt="">
              <text class="share-text">健康手环</text>
              <view class="share-price">￥199
              <img class="car" src="../../static/images/health/car.png" alt="">
            </view>
            </view>
            <view class="share-item">
              <img class="share-img" src="../../static/images/health/drug.jpg" alt="">
              <text class="share-text">通血管药物</text>
              <view class="share-price">￥199
              <img class="car" src="../../static/images/health/car.png" alt="">
            </view>
            </view>
            <view class="share-item">
              <img class="share-img" src="../../static/images/health/seng.jpg" alt="">
              <text class="share-text">人参</text>
              <view class="share-price">￥199
              <img class="car" src="../../static/images/health/car.png" alt="">
            </view>
            </view>
          </view>
        </view>
        <view class="share-two">
          <view class="share-title">
            <img class="title-img" src="../../static/images/health/adver.png" alt="">
            <text class="title">相关服务推荐</text>
            <text class="more">更多 ></text>
          </view>
          <view class="share-info">
            <img class="share-img" src="../../static/images/health/daster.jpg" alt="">
            <view class="details">
            <text class="share-info-text">特殊疾病保险</text>
            <text class="detail">高保险，包括心老血管相关疾病、脑神经等等都可以有保障</text>
        </view>
            <text class="know">了解详情 —></text>
          </view>
        </view>
    </view>
</template>

<script>
// pages/health/health.js
export default {
    data() {
        return {};
    },
    /**
     * 生命周期函数--监听页面加载
     */
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
/* pages/health/health.wxss */
.page {
    background: linear-gradient(to bottom, #0bd6c8, #99efe9,#ddf5f4,rgb(226, 226, 226));
}
.first {
    display: flex;
    flex-direction: column;
    justify-content: center; /* 水平居中 */
    align-items: center; /* 垂直居中 */
}
.announcement-bar {
    width: 100%;
    overflow: hidden;
    background-color: #f5f5f5;
    padding: 20rpx 0;
    display: flex;
    align-items: center;
    position: relative;
    margin-top: 180rpx;
}

.notice {
    position: absolute;
    left: 20rpx;
    width: 60rpx;
    height: 60rpx;
    z-index: 1; /* 确保图片在文字上方 */
}

.scroll-container {
    display: flex;
    overflow: hidden;
    margin-left: 80rpx; /* 为滚动区域留出图片的宽度 */
}

.announcement-text {
    white-space: nowrap;
    animation: scroll-left 15s linear infinite;
}

@keyframes scroll-left {
    0% {
        transform: translateX(100%);
    }
    100% {
        transform: translateX(-100%);
    }
}
.drug {
    background-color: #f5f5f5;
    padding: 20rpx;
    margin-top: 50rpx;
    width: 85%;
    border: 3px solid #e5e5e5;
    border-radius: 20rpx;
    position: relative; 
    height: 350rpx;
}
.drug-title {
    display: flex;
    align-items: center;
    font-weight: bold;
}
.tip {
    width: 60rpx;
    height: 60rpx;
    margin-right: 20rpx;
}
.drug-content {
    display: flex;
    align-items: center;
}

.water {
    width: 120rpx;
    height: 120rpx;
    margin-right: 20rpx;
    margin-top: 40rpx;
}

.drug-text {
    display: flex;
    flex-direction: column;
    margin-left: 20rpx;
}

.time{
    margin-bottom: 8rpx;
    font-size: 40rpx;
}
.eat{
    font-size: 25rpx;
    margin-bottom: 5rpx;
}
.divider {
    width: 100%;
    height: 10rpx;
    background-color: #e5e5e5;
    margin: 15rpx 0;
}
.cup {
    width: 100rpx;
    height: 100rpx;
    margin-right: 40rpx;
}
.date {
    font-size:35rpx;
    color: dimgrey;
}
.dalay {
    font-size: 60rpx;
    color: limegreen;
    font-weight: bolder;
    position: absolute;
    right: 100rpx; /* 将 delay 元素定位到右边 */
}
.share {
    display: flex;
    flex-direction: column;
    margin-top: 40rpx;
}
.title-img{
    width: 60rpx;
    height: 60rpx;
    margin-right: 20rpx;
    margin-left: 30rpx;
}
.more {
    color:dimgray;
    font-size: 30rpx;
    margin-left: auto;
    margin-right: 10rpx;
}
.share-title {
    display: flex;
    font-weight: bold;
    align-items: center;
}
.share-content {
    display: flex;
    justify-content:space-evenly;
    margin-top: 20rpx;
}
.share-item {
    display: flex;
    flex-direction: column;
    background-color: aliceblue;
    border-radius: 20rpx;
    padding: 20rpx;
}
.share-img {
    width: 180rpx;
    height: 180rpx;
}
.share-text {
    font-size: 30rpx;
    margin-top: 20rpx;
    font-weight: bold;
}
.share-price {
    font-size: 30rpx;
    color: red;
    margin-top: 20rpx;
    display: flex;
}
.car {
    width: 60rpx;
    height: 60rpx;
    margin-left: auto;
}
.share-two {
    margin-top: 40rpx;
}

.share-info {
    display: flex;
    background-color: aliceblue;
    border-radius: 20rpx;
    padding: 20rpx;
    margin: 20rpx;

}
.details {
    display: flex;
    flex-direction: column;
    margin-left: 20rpx;
    width: 300rpx;
}
.share-info-text {
    font-size: 30rpx;
    font-weight: bold;
    color: #FDBD2F;
}
.detail {
    font-size: 25rpx;
    margin-top: 20rpx;
    color: dimgrey;
}

.know {
    font-size: 20rpx;
    background-color: #FDBD2F;
    color: white;
    padding: 15rpx;
    margin-left: auto;
    border-radius: 30rpx;
    height: 20rpx;
    margin-top: 10%;
}
</style>