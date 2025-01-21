<template>
    
       <view>
       		<view class="uni-margin-wrap">
       			<swiper class="swiper" circular :indicator-dots="indicatorDots" :autoplay="autoplay" :interval="interval"
       				:duration="duration">
       				<swiper-item v-for="background in backgrounds" :key="background.id">
       					<view class="swiper-item" :style="{ backgroundImage: 'url(' + background.src + ')' }"></view>
       				</swiper-item>
       			</swiper>
       		</view>
			<textarea name="" id="" cols="30" rows="10"></textarea>
    </view>
</template>

<script>
// pages/index/index.js
export default {
    data() {
        return {
			backgrounds: [
                {id:1,src:'/static/index/banner1.jpg'},
                {id:2,src:'/static/banner/banner2.jpg'},
                {id:3,src:'/static/banner/banner3.jpg'}
            ],
			indicatorDots: true,
			autoplay: true,
			interval: 2000,
			duration: 500
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
	.uni-margin-wrap {
			width: 690rpx;
			width: 100%;
		}
		.swiper {
			height: 500rpx;
		}
		.swiper-item {
			display: block;
			height: 500rpx;
			line-height: 300rpx;
			text-align: center;
			background-size: cover;
			background-position: center;
		}
</style>
