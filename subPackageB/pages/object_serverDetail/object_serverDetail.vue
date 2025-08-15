<template>
	<view class="container">
		<custom-nav title="病人信息" :isHomePage="false"></custom-nav>
		<view class="patient-card">
			<view class="patient-info">
				<view class="name">{{ patient.name }}</view>
				<view class="detail">
					<text class="age">{{ patient.age }}岁</text>
					<text class="gender">{{ patient.gender }}| &nbsp; </text>
					<text class="phone">{{ patient.phone }}</text>
				</view>
				<view class="value">
					<text class="relationship">与就诊人关系: {{ patient.relationship }}</text>
				</view>
				<view class="certification">
					<text class="certified">{{ patient.is_certified ? "已认证" : "未认证" }}</text>
				</view>
			</view>
			<view class="patient-avatar">
				<image :src="patient.photo" mode="aspectFill"></image>
			</view>
		</view>
		<view class="introduction">
			<text class="introduction-title">病历信息</text>
			<view class="introduction-content">
				<text>{{ patient.medicalInfo }}</text>
			</view>
		</view>
		<view class="appointment">
			<text class="appointment-title">评价</text>
			<view class="reviews">
				<view
					class="review-item"
					v-for="(item, index) in patient.reviews"
					:key="index"
				>
					<view class="review-rating">评分: {{ item.rating }}</view>
					<view class="review-text">{{ item.review }}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				patient: {}, // 用于存储病人信息
			}
		},
		onLoad(options) {
			if (options.patient) {
				this.patient = JSON.parse(decodeURIComponent(options.patient));
			}
			console.log(this.patient);
		},
		methods: {
			
		}
	}
</script>

<style>
	.container {
		padding: 0 20rpx;
		padding-top: 200rpx;
	}
	.patient-card {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		background-color: #fff;
		border-radius: 50rpx;
		width: 100%;
		height: 450rpx;
	}
	.patient-info {
		flex: 1;
	}
	.patient-avatar {
		width: 300rpx;
		height: 300rpx;
		border-radius: 50%;
		overflow: hidden;
		margin-right: 50rpx;
		background-color: #043a78;
	}
	.patient-avatar image {
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
	.phone {
		color: #03968d;
		font-weight: bold;
	}
	.certification {
		font-size: 30rpx;
		margin-left: 30rpx;
	}
	.introduction {
		margin-top: 30rpx;
		background-color: #ffffff;
		padding: 20rpx;
		border-radius: 50rpx;
		width: 95%;
	}
	.introduction-title {
		font-size: 35rpx;
	}
	.introduction-content {
		font-size: 30rpx;
		margin-top: 20rpx;
		margin-left: 30rpx;
		width: 80%;
		font-family: serif;
		font-weight: bold;
	}
	.appointment {
		margin-top: 30rpx;
		background-color: #ffffff;
		padding: 20rpx;
		border-radius: 50rpx;
		width: 95%;
	}
	.appointment-title {
		font-size: 35rpx;
	}
	.reviews {
		display: flex;
		flex-direction: column;
		gap: 10rpx;
	}
	.review-item {
		padding: 10rpx;
		background-color: #f9f9f9;
		border-radius: 8rpx;
		box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.1);
	}
	.review-rating {
		font-size: 24rpx;
		color: #f39c12;
		margin-bottom: 5rpx;
	}
	.review-text {
		font-size: 30rpx;
		color: #333;
	}
</style>
