<template>
	<view class="page">
		<custom-nav title="我的账户" :isHomePage="false"></custom-nav>

		<view class="account" @click="toAccount">
			<view class="account-header">
				<text class="account-title">我的账户</text>
				<button>我要提现</button>
			</view>
			<view class="account-info">
				<view class="account-item">
					<text class="account-value">193.07</text>
					<text class="account-label">可提取金额</text>
				</view>
				<view class="account-item">
					<text class="account-value">17.05</text>
					<text class="account-label">待结算金额</text>
				</view>
				<view class="account-item">
					<text class="account-value">193.07</text>
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
</template>

<script>
	export default {
		data() {
			return {
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
				icon: '../../static/images/mine/down.png'
			}
		},
		methods: {
			toggleList() {
				this.isShow = !this.isShow;
				this.icon = this.isShow 
					? '../../static/images/mine/up.png'
					: '../../static/images/mine/down.png';
			},
			toAccount() {
				uni.navigateTo({
					url: `/pages/getMoney/getMoney`
					
				});
			}
		}
	}
</script>

<style>
	.page {
		padding-top: 150rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	.account {
		background-color: #8ce5ef;
		border-radius: 15rpx;
		padding: 20rpx;
		margin: 25rpx;
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
		margin: 25rpx;
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