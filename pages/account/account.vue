<template>
	<scroll-view scroll-y class="page-container" @scroll="handleScroll" :style="{
	      paddingTop: navHeight + 'px',
	      height: 'calc(100vh - ' + navHeight + 'px)'
	    }" :scroll-top="scrollTop":show-scrollbar="false">
		<custom-nav :title="pageTitle" :isHomePage="false" :scrollTop="scrollTop" />
<view class="content" >
		<view class="account" @click="toApply">
			<view class="account-header">
				<text class="account-title">我的账户</text>
				<button>我要提现</button>
			</view>
			<view class="account-info">
				<view class="account-item">
					<text class="account-value">{{(accountInfo.withdrawable_amount / 100).toFixed(2)}}</text>
					<text class="account-label">可提取金额</text>
				</view>
				<view class="account-item">
					<text class="account-value">{{(accountInfo.pending_amount / 100).toFixed(2)}}</text>
					<text class="account-label">待结算金额</text>
				</view>
				<view class="account-item">
					<text class="account-value">{{(accountInfo.balance / 100).toFixed(2)}}</text>
					<text class="account-label">累计已结算金额</text>
				</view>
			</view>
		</view>
		<view class="list" @click="toggleList">
			<text>交易详情</text>
			<image :src="icon" mode="aspectFit"></image>
		</view>
		<view class="list-container" :class="{ 'show': isShow }">
			<view class="list-item" v-for="(item, index) in listData" :key="index">
				<img src="../../static/images/mine/outMoney.png" alt="" />
				<view class="list-left">
					<view class="list-label">{{item['list-label']}}</view>
					<view class="list-time">{{item['list-time']}}</view>
					<view class="list-id">{{item['list-id']}}</view>
				</view>
				<view class="list-right">
					<view class="list-money">{{item['list-money']}}</view>
					<view class="list-state">{{item['list-state']}}</view>
				</view>
			</view>
		</view>
		</view>
	</scroll-view>
</template>

<script>
	export default {
		data() {
			return {
				pageTitle: '我的账户',
				scrollTop: 0,
				navHeight: 0, // 添加导航栏高度存储
				isShow: false,
				listData: [{
					"list-label": "交易提现",
					"list-time": "2022-03-22 20:00",
					"list-id": "888888888888888888",
					"list-money": "+200",
					"list-state": "提现中"
				}, {
					"list-label": "交易提现",
					"list-time": "2022-03-22 20:00",
					"list-id": "888888888888888888",
					"list-money": "+200",
					"list-state": "提现中"
				}],
				icon: '../../static/images/mine/down.png',
				accountInfo:''
			}
		},
		onLoad(options) {
			// 获取导航栏高度
			const systemInfo = uni.getSystemInfoSync();
			this.navHeight = systemInfo.statusBarHeight + 44;
			if (options.accountInfo) {
			  this.accountInfo = JSON.parse(decodeURIComponent(options.accountInfo));
			  console.log(this.accountInfo)
			}
			
		},
		methods: {
			toggleList() {
				this.isShow = !this.isShow;
				this.icon = this.isShow 
					? '../../static/images/mine/up.png'
					: '../../static/images/mine/down.png';
			},
		
			
		}
	}
</script>

<style>
	.page-container {
			min-height: 100vh;
			position: relative;
			padding: 0 rpx;
			padding-left: 25rpx;
			padding-right: 25rpx;
			margin: 0;
			width: 100%;
			box-sizing: border-box; /* 关键：让 width 包含 padding */	
				-webkit-overflow-scrolling: touch; /* 平滑滚动 */
				scrollbar-width: none; /* Firefox */
		}
	.page-container ::-webkit-scrollbar {
	  display: none; /* Chrome/Safari */
	  width: 0 !important; /* 微信小程序可能需要 */
	  height: 0 !important;
	}
	
		.content {
			width: 100%;
			  max-width: 100%; /* 限制最大宽度（可选） */
			  margin: 0 ; /* 水平居中 */
			  padding:0;
			  box-sizing: border-box;
		}

	.account {
		background-color: #8ce5ef;
		border-radius: 15rpx;
		padding: 20rpx;
		
		margin-top: 50rpx;
	}

	.account-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 0;
		
	}

	.account-header button {
		background-color: white;
		color: #333;
		font-size: 28rpx;
		padding: 0 30rpx;
		height: 60rpx;
		line-height: 60rpx;
		border-radius: 30rpx;
		margin-left: 330rpx;
	}

	.account-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-left: 30rpx;
	}

	.account-info {
		border-top: 1rpx solid rgba(255, 255, 255, 0.5);
		display: flex;
		justify-content: space-between;
		padding: 20rpx 0;
	}

	.account-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
	}

	.account-label {
		font-size: 26rpx;
		color: #ffffff;
	}

	.account-value {
		font-size: 50rpx;
		font-weight: bold;
		color: #ffffff;
		margin: 10rpx 0 20rpx;
	}

	.list {
		background-color: #ffffff;
		
		margin-top: 50rpx;
		padding: 25rpx 30rpx;
		border-radius: 15rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.list text {
		font-size: 32rpx;
		font-weight: bold;
	}

	.list image {
		width: 50rpx;
		height: 50rpx;
	}

	.list-container {
		max-height: 0;
		margin: 0 25rpx;
		overflow: hidden;
		transition: max-height 0.3s ease-out;
		
		border-radius: 0 0 15rpx 15rpx;
		
	}

	.list-container.show {
		max-height: 1000rpx;
		transition: max-height 0.3s ease-in;
	}

	.list-item {
		padding: 30rpx;
		border-bottom: 1rpx solid #eee;
		display: flex;
		justify-content: space-between;
		background-color: #ffffff;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	.list-item img{
		width: 50rpx;
		height: 50rpx;
		margin-right: 20rpx;
	}
	.list-left {
		flex: 1;
	}

	.list-label {
		font-size: 30rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
	}

	.list-time, .list-id {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 5rpx;
	}

	.list-right {
		text-align: right;
	}

	.list-money {
		font-size: 32rpx;
		font-weight: bold;
		color: #07C160;
		margin-bottom: 10rpx;
	}

	.list-state {
		font-size: 24rpx;
		color: #FF976A;
	}
</style>