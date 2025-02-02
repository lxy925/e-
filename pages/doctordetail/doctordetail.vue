<template>
    <view class="container">
        <view class="doctor-card">
            <view class="doctor-info">
                <view class="name">{{doctor.name}}</view>
                <view class="detail">
                    <text class="location">{{doctor.location}}</text>
                    <text class="gender">{{doctor.gender}}|  &nbsp; </text>
                    <text class="age">{{doctor.age}}</text>
                </view>
                <view class="value">
                    <img class="value-icon" src="../../static/images/index/value.png" alt="">
                    {{doctor.value}}
                </view>
                <view class="specialty-container">
        <text class="doctor-specialty">{{doctor.specialty}}</text>
        <text class="doctor-specialty">{{doctor.specialty2}}</text>
    </view>

            </view>
			<view class="doctor-avatar">
				<image :src="doctor.avatar" mode="aspectFill"></image>
			</view>
		</view>
        <view class="introduction">
            <img class="introduction-icon" src="../../static/images/index/user.png" alt="">
            <text class="introduction-title">自我介绍</text>
            <view class="introduction-content">
            <text >{{doctor.introduction}}</text>
        </view>
            <view class="work-container">
        <text class="doctor-work">{{doctor.work}}</text>
        <text class="doctor-work">{{doctor.work2}}</text>
    </view>
        </view>
        <view class="tech">
            <img class="tech-icon" src="../../static/images/index/star (2).png" alt="">
            <text class="tech-title">技能证书</text>
            <view class="tech-container">证书</view>
        </view>
        <view class="appointment">
            <img class="appointment-icon" src="../../static/images/index/hospital.png" alt="">
            <text class="appointment-title">熟悉的医院</text>
                <view class="appointment-text">{{doctor.hospital}}</view>
                <view class="appointment-title2">熟悉的科室</view>
                <view class="appointment-container">
                    <view class="appointment-room">{{doctor.room}}</view>
                    <view class="appointment-room">{{doctor.room2}}</view>

            </view>
        </view>
    </view>
</template>


<script>
export default {
    data() {
        return {
            doctor: {
                avatar: '/static/images/index/doctor.jpg',
                name: '张医生',
                location: '广州市 天河区',
                gender: '女',
                age: '30岁',
                value: '4.9',
                specialty: '尽职尽责',
                specialty2: '陪诊技能',
                introduction: '广州市中山大学附属第一医院退休三年，现为社区大队长',
                work: '全程陪诊',
                work2: '代理拿药',
                hospital: '广州市中山大学附属第一医院',
                room: '外科',
                room2: '骨科'
            }
        };
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
.doctor-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    background-color: #fff;
    border-radius: 50rpx;
    width: 95%;
    height: 450rpx;
}
.doctor-info {
    flex: 1;
}
.doctor-avatar {
    width: 200rpx;
    height: 200rpx;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 50rpx;
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
    color: #03968D;
    margin-left: 30rpx;
    font-weight:bold;
}
.age {
    color: #03968D;
    font-weight:bold;
}
.value {
    font-size: 40rpx;
    color: #FF9B17;
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

.doctor-specialty {
    font-size: 30rpx;
    color: #209C8A;
    line-height: 1.4;
    border: 1px solid #CCE6E2;
    border-radius: 15rpx;
    padding: 4rpx 12rpx;
    margin-top: 10rpx;
}
.introduction{
    margin-top: 30rpx;
    background-color: #FFFFFF;
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
    font-family:serif;
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
    background-color: #FFFFFF;
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
    background-color: #FCDB92;
    border-radius: 20rpx;
    width: 250rpx;
    height: 120rpx;
    text-align: center;
    line-height: 120rpx;
}
.appointment {
    margin-top: 30rpx;
    background-color: #FFFFFF;
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
    font-size: 25rpx;
    margin-top: 20rpx;
    margin-left: 30rpx;
    font-family: serif;
    font-weight: bold;
    margin-bottom: 20rpx;
}
.appointment-room {
    font-size: 30rpx;
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
    color: #043A78;
    margin-left: 70rpx;
}

















</style>
