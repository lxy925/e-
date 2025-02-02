<template>
	<view>
		<view class="search-box">
                <image class="search-icon" src="../../static/images/icons/search.png"></image>
                <input type="text" placeholder="搜索陪诊师的名字" placeholder-class="placeholder-style"/>
            </view>
		<view class="doctor-list">
			<view class="doctor-card" v-for="(doctor, index) in doctors" :key="index" @click="goToDoctorListPage">
				<view class="doctor-avatar">
					<image :src="doctor.avatar" mode="aspectFill"></image>
				</view>
				<view class="doctor-info">
					<view class="doctor-name">{{doctor.name}}</view>
					<view class="doctor-location">{{doctor.location}}</view>
					<view class="doctor-department">
                    <img class="value-icon" src="../../static/images/index/value.png" alt="">
                    {{doctor.value}} &nbsp; | &nbsp;
                    <img class="order-icon" src="../../static/images/index/order.png" alt="">
                    {{doctor.order}}
                    </view>
                    <view class="specialty-container">
        <text class="doctor-specialty">{{doctor.specialty}}</text>
        <text class="doctor-specialty">{{doctor.specialty2}}</text>
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
            doctors: [
                {
                    avatar: '/static/images/index/doctor.jpg',
                    name: '张医生',
                    location: '广州市 天河区',
                    value: '4.9',
                    order: '739',
                    specialty: '尽职尽责',
                    specialty2: '陪诊技能'
                },
                { 
                    avatar: '/static/images/index/doctor.jpg',
                    name: '李医生',
                    location: '广州市 天河区',
                    value: '4.9',
                    order: '739',
                    specialty: '尽职尽责',
                    specialty2: '陪诊技能'
                }
                // 可以添加更多医生数据
            ]
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
    methods: {
        goToDoctorListPage() {
            uni.navigateTo({
                url: '/pages/doctordetail/doctordetail'
            });
        }
    }
};
</script>

<style>
.search-box {
    flex: 1;
    position: relative;
    height: 40px;
    background: rgb(255, 255, 255);
    border-radius: 16px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    margin: 10px 10px;
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
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
.doctor-list {
    padding: 20rpx;
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.doctor-card {
    background-color: #fff;
    border-radius: 12rpx;
    padding: 20rpx;
    display: flex;
    box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
    position: relative;
}

.doctor-avatar {
    width: 120rpx;
    height: 120rpx;
    margin-right: 20rpx;
}

.doctor-avatar image {
    width: 100%;
    height: 100%;
    border-radius: 60rpx;
}

.doctor-info {
    flex: 1;
}

.doctor-name {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 8rpx;
}

.doctor-location {
    font-size: 23rpx;
    color: #333333;
    margin-bottom: 8rpx;
    background-color: #d3d3d3;
    border-radius: 10rpx;
    padding: 5rpx 10rpx;
    width: fit-content;
}

.value-icon {
    width: 30rpx;
    height: 30rpx;
    margin-right: 5rpx;
    padding-top: 10rpx;
}

.order-icon {
    width: 25rpx;
    height: 25rpx;
    margin-left: 20rpx;
    margin-right: 5rpx;
    padding-top: 10rpx;
}

.doctor-department {
    font-size: 26rpx;
    color:rgb(255, 0, 0);
    margin-bottom: 8rpx;
}

.specialty-container {
    display: flex;
    gap: 20rpx;
}

.doctor-specialty {
    font-size: 25rpx;
    color: #209C8A;
    line-height: 1.4;
    border: 1px solid #CCE6E2;
    border-radius: 15rpx;
    padding: 4rpx 12rpx;
    margin-top: 10rpx;
}

.doctor-need {
    position: absolute;
    right: 20rpx;
    top: 20rpx;
}

.doctor-need-item {
    align-items: center;
    font-size: 28rpx;
    color: #666;
}

.doctor-need-item-text {
    margin-top: 15rpx;
    margin-right: 20rpx;
    color: #1486FA;
    background-color: #E6F7FF;
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