<template>
    <view class="page">
        <!-- pages/doctor/doctor.wxml -->
        <view class="custom-nav">
            <view class="location">
                <view class="location-icon"><img src="../../static/images/icons/position.png" alt=""></view>
                <text class="location-text">{{location}}</text>
            </view>
            <view class="search-box">
                <image class="search-icon" src="../../static/images/icons/search.png"></image>
                <input type="text" placeholder="搜索" placeholder-class="placeholder-style"/>
            </view>
        </view>
        <view class="first">
            <image src="../../static/images/index/book.png" alt=""></image>
            <text class="first-text">如何成为一位合格的陪诊师？</text>
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
            <view class="second-item2"  @click="goToDoctorListPage">
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
            <text class="third-text">更多课程 ></text>
        </view>
        <view class="next">
                <img class="next-image" src="../../static/images/index/curse.jpg" alt="">
                <view class="next-text">
                    <text class="next-text1">如何提高陪诊师考证通过率？</text>
                    <text class="next-text2">主讲人：金老师</text>
                    <text class="next-text3">时间：2023/4/17 - 7/16</text>
                    <text class="next-text4">￥199</text>
                </view>
            </view>
            <view class="third ">
            <text class="third-title">考证流程</text>
            <text class="third-text">了解更多 ></text>
        </view>
        <view class="process-flow">
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
        </view>
    </view>
</template>

<script>
// pages/doctor/doctor.js
export default {
    data() {
        return {
            location: '广州',
            processSteps: [
                { title: '报名注册', desc: '网上报名并提交材料' },
                { title: '资格审核', desc: '等待审核通过' },
                { title: '培训学习', desc: '参加专业培训课程' },
                { title: '考试认证', desc: '参加资格考试' }
            ]
        };
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 先检查权限
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
        uni.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: '#54c69a'
        });
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
        getLocationInfo() {
            uni.getLocation({
                type: 'gcj02',
                success: (res) => {
                    console.log('当前位置：', res.latitude, res.longitude);
                   // 调用逆地址解析
                   this.getCity(res.latitude, res.longitude);
                },
                fail: (err) => {
                    console.error('获取位置失败：', err);
                }
            });
        },
        getCity(latitude, longitude) {
            // 使用高德地图逆地址解析
            uni.request({
                url: 'https://restapi.amap.com/v3/geocode/regeo',
                data: {
                    location: `${longitude},${latitude}`, // 注意：高德地图是经度在前，纬度在后
                    key: '5781b7732ae9793dce03c709a9d0b0af', // 替换为你的高德地图 key
                    extensions: 'base'
                },
                success: (res) => {
                    if (res.data.status === '1') {
                        this.location = res.data.regeocode.addressComponent.city;
                    } else {
                        console.error('逆地址解析失败：', res);
                        this.location = '广州市';
                    }
                },
                fail: (err) => {
                    console.error('请求失败：', err);
                    this.location = '广州市';
                }
            });
        },

        goToDoctorListPage() {
            uni.navigateTo({
                url: '/pages/doctorlist/doctorlist'
            });
        }
    }
};

</script>
<style>
/* pages/doctor/doctor.wxss */

.page {
    min-height: 100vh;
    background: linear-gradient(to bottom, #54c69a, #fffcf9);
    padding-top: 0;
    margin-top: -1px; /* 消除可能的间隙 */
}
.custom-nav {
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
}

.location {
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
}
.first {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 80px;
    border-radius: 35px; /* 添加圆角 */
    overflow: hidden; /* 确保圆角生效 */
    position: relative; 
}

.first image {
    width: 90%; /* 使用百分比更灵活 */
    height: 120px; /* 增加高度使图片更明显 */
    object-fit: contain; /* 保持图片比例 */
}
.first-text {
    position: absolute; /* 绝对定位 */
    top: 20px; /* 距离底部距离 */
    color:#ffffff; /* 文字颜色 */
    font-size: 16px; /* 文字大小 */
    font-weight: bolder; /* 文字加粗 */
    text-shadow: 0 0 2px rgba(255, 255, 255, 0.8); /* 添加文字阴影使其更容易辨认 */
    font-family:serif;
}
.second{
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    gap: 20px;
}
.second-item1{
    width: 160px;
    height: 100px;
    background-color:#FFF0B9;
    border-radius: 10px;
    overflow: hidden;
}
.second-item2{
    width: 160px;
    height: 100px;
    background-color: #BAE7FF;
    border-radius: 10px;
    overflow: hidden;
}
.second-item1-text{
    display: flex;
    flex-direction: column;
    margin-left: 10px;
}
.second-item1 image{
    width: 90px;
    height: 90px;
    margin-left: 80px;
    margin-top: -80px;
}
.second-item1-text1{
    font-size: 20px;
    font-weight: bold;
    margin-top: 20px;
    color: #AC6800;
}
.second-item1-text2{
    font-size: 12px;
    color: #FBAE13;
    margin-top: 2px;
}
.second-item1-text3{
    font-size: 9px;
    color:#D38806;
    margin-top: 5px;
    background-color: #ffffff;
    border-radius: 10px;
    padding: 5px;
    width: 40px;
    text-align: center;
}
.second-item2-text{
    display: flex;
    flex-direction: column;
    margin-left: 10px;
}
.second-item2 image{
    width: 100px;
    height: 100px;
    margin-left: 90px;
    margin-top: -80px;
}
.second-item2-text1{
    font-size: 20px;
    font-weight: bold;
    margin-top: 20px;
    color: #0050B2;
}
.second-item2-text2{
    font-size: 12px;
    color: #178FFF;
    margin-top: 2px;
}
.second-item2-text3{
    font-size: 9px;
    color:#0A6DD9;
    margin-top: 5px;
    background-color: #ffffff;
    border-radius: 10px;
    padding: 5px;
    width: 40px;
    text-align: center;
}
.third {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
}

.third-title {
    font-size: 20px;
    font-weight: bold;
}

.third-text {
    font-size: 15px;
    color: #999;
}
.next{
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20rpx;
    background-color: #ffffff;
    border-radius: 20rpx;
    padding: 15rpx;
    width: 80%;
    margin-left: 50rpx;
}   
.next-image{
    width: 250rpx;
    height: 200rpx;
}       
.next-text{
    display: flex;
    flex-direction: column;
    margin-left: 40rpx;
}
.next-text1{
    font-size: 30rpx;
    font-weight: bold;
}
.next-text2{
    font-size: 25rpx;
    color: #999;
}
.next-text3{
    font-size: 25rpx;
    color: #999;
}
.next-text4{
    font-size: 40rpx;
    color: #e50707;
}
.process-flow {
    display: flex;
    margin: 0 10px;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    overflow-x: auto;
    white-space: nowrap;
}

.flow-item {
    display: flex;
    align-items: center;
    position: relative;
    padding: 5px;
    transition: all 0.3s ease;
    flex-shrink: 0;
    width: 80px;
}

.flow-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
.flow-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    justify-content: center;
}

.flow-circle {
    width: 30px;
    height: 30px;
    background: #54c69a;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    margin-bottom: 10px;
}

.flow-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    white-space: normal;
    min-width: 100px;
}

.flow-title {
    font-size: 15px;
    font-weight: bold;
    color: #333;
    margin-bottom: 4px;
}

.flow-desc {
    font-size: 10px;
    color: #666;
}

.flow-arrow {
    margin: 0 10px;
    color: #54c69a;
    font-size: 25px;
    position: relative;
    left: -25px; /* 添加这行来向左移动箭头 */
}

@media screen and (max-width: 768px) {
    .process-flow {
        padding: 15px;
        margin: 0 10px;
    }
    
    .flow-arrow {
        margin: 0 10px;
    }
}

</style>
