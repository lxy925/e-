<template>
	<view class="container">
		<view class="header"  @click="handleHeaderClick">
			<view class="up">
				<image :src="userInfo.avatarUrl || '../../static/images/index/touxiang.jpg'" mode="widthFix"></image>
			<text class="user-name" >{{userInfo.realName || '登录/注册'}}</text>
			<!-- <text class="user-id" v-if="userInfo.realName" >{{userInfo.ID}}</text> -->
			<text class="user-info" v-if="userInfo.realName" >已实名</text>
		</view>
		<view class="down">
			<view class="box">
				<text class="header-num">1</text>
				<text class="header-title">总收益（元）</text>
			</view>
			<view class="box">
				<text class="header-num">1</text>
				<text class="header-title">总销量</text>
			</view>
			<view class="box">
				<text class="header-num">1</text>
				<text class="header-title">用户评分</text>
			</view>
		</view>
	</view>
	<view class="content">
		<view class="data">
			<view class="first">
			<image src="../../static/images/mine/data.png" mode="widthFix"></image>
			<text class="data-title">订单数据</text>
			</view>
			<view class="all-box">
			<view class="data-box">
				<text class="num">1</text>
				<text class="title">订单收入（元）</text>
			</view>
			<view class="data-box">
				<text class="num">1</text>
				<text class="title">总订单数</text>
			</view>
			</view>
		</view>
		<view class="data">
			<view class="first">
			<image src="../../static/images/mine/manage.png" mode="widthFix"></image>
			<text class="data-title">订单管理</text>
			</view>
			<view class="all-box">
			<view class="data-box">
				<text class="num">1</text>
				<text class="title">待完成</text>
			</view>
			<view class="data-box">
				<text class="num">1</text>
				<text class="title">总订单数</text>
				</view>
			</view>
			</view>
			<view class="order-box">
				<image src="../../static/images/mine/set.png" mode="widthFix"></image>
      <text class="order-title">设置中心</text>
      <view class="order-item">
        <view class="boxed">
          <image src="../../static/images/mine/location.png" alt=""></image>
          <text class="box-title">地址管理</text>
        </view>
        	<view class="boxed">
          <image src="../../static/images/mine/patient.png" alt=""></image>
          <text class="box-title">个人信息管理</text>
        </view>
        <view class="boxed">
          <image src="../../static/images/mine/advice.png" alt=""></image>
          <text class="box-title">查看用户评价</text>
        </view>
    </view>
</view>
		</view>
		<view class="logout-box" v-if="userInfo.realName">
    <image src="../../static/images/mine/logout.png" alt=""></image>
<button class="logout" @click="logout" >退出登录</button>
</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userInfo: {
                avatarUrl: '',
                realName: '',
                ID: ''
            },
				
			}
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
    const doctorInfo = uni.getStorageSync('doctorInfo');
    if (doctorInfo) {
        this.userInfo =doctorInfo;
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
			handleHeaderClick() {
        if (!this.userInfo.realName) {
            this.getUserProfilePage();
        }
    },
	getUserProfilePage() {
        uni.navigateTo({
                   url: '/pages/userInfoDetail/userInfoDetail?from=doctorlogin'
            });
        },
		logout() {
        // 清除本地存储的用户信息
        uni.removeStorageSync('userInfo');
        // 重置当前页面的用户信息
        this.userInfo = {
            avatarUrl: '',
            realName: '',
            ID: ''
        };
        // 显示提示信息
        uni.showToast({
            title: '退出登录成功',
            icon: 'success',
            duration: 2000
        });
    },
			
		}
	}
</script>

<style>
	.header {
		width: 95%;
		height: 400rpx;
		background-color: #5fe0af;
		display: flex;
		flex-direction: column;
		margin-top: 200rpx;
		margin-left: 20rpx;
		border-radius: 20rpx;
	}
	.up {
		width: 100%;
		height: 200rpx;
		display: flex;

	}
	.up image {
		width: 150rpx;
		height: 150rpx;
		border-radius: 50%;
		margin-left: 40rpx;
		margin-top: 40rpx;
	}
	.user-name {
		font-size: 45rpx;
		color: #fff;
		margin-left: 20rpx;
		margin-top: 100rpx;
		font-weight: bold;
	}
	.user-info {
 font-size: 25rpx;
 font-weight: bold;
 margin-left: 30rpx;
 margin-top: 100rpx;
 background-color:  rgba(169, 255, 205, 0.5);
 padding: 10rpx;
 height: 40rpx;
 border-radius: 15rpx;
 color: #fff;
}
	.down {
		width: 90%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 20rpx;
		border-radius: 20rpx;
		background-color: rgba(169, 255, 205, 0.3);
		padding: 20rpx;
		margin-left: 20rpx;
	}
	.box {
		border-radius: 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-left: 40rpx;
		margin-right: 40rpx;
	}
	.header-num {
		font-size: 35rpx;
		color: #fff;
		margin-top: 20rpx;
		margin-bottom: 10rpx;
		font-weight: bold;
	}
	.header-title {
		font-size: 30rpx;
		color: #fff;
		margin-top: 0;
	}
	.content {
		width: 90%;
		margin: 25rpx;
		border-radius: 20rpx;
		background-color: #f1f1f1;
		padding: 20rpx;
	}
	.data {
		width: 100%;
		height: 280rpx;
		margin-top: 30rpx;
	}
	.data image {
		width: 45rpx;
		height: 45rpx;
	}
	.data-title {
		font-size: 30rpx;
		color: #333;
		margin-left: 20rpx;
		margin-top: 10rpx;
		font-weight: bold;
	}
	.all-box {
		display: flex;
		margin: 30rpx;
		border-radius: 20rpx;
		background-color: rgba(169, 255, 205, 0.3);
		padding: 20rpx;
		justify-content: center;
		height: 120rpx;
		
	}
	.data-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-left: 50rpx;
		margin-right: 50rpx;
		margin-top: 20rpx;
	}
	.num {
		font-size: 35rpx;
		color: #333;
		margin-left: 20rpx;
		margin-right: 20rpx;
		font-weight: bold;
	}
	.title {
		font-size: 28rpx;
		color: #333;
		margin-left: 20rpx;
		margin-right: 20rpx;
	}
	.logout-box {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20rpx;
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
.order-item {
  margin-top: 20rpx;
  display: flex;
  
  flex-wrap: wrap;
  justify-content: space-around;
  /* justify-content: space-a; */
}
.order-box image {
  width: 60rpx;
  height: 60rpx;
}
.order-title {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
  margin-left: 10rpx;
}
.boxed {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 23%;
  margin-bottom: 20rpx;
  margin-left:  15rpx;
}
.boxed image {
  width: 70rpx;
  height: 70rpx;
  margin-bottom: 10rpx;
}
.box-title {
    font-size: 13px;
    font-weight: bold;
    margin-top: 10rpx;
}
	
</style>
