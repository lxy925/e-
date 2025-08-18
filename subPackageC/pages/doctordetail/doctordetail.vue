<template>
	<view class="container">
		<custom-nav :title="pageTitle" :isHomePage="false" :scrollTop="scrollTop"  />
		<!-- 内容区域 -->
				  <scroll-view class="page-container" :style="{ paddingTop: navHeight + 'px' }">
			<view class="doctor-card">
				<view class="doctor-info">
					<view class="name">{{ doctor.name }}</view>
					<view class="detail">
						<text class="location">{{ doctor.location }}</text>
						<text class="gender">{{ doctor.gender }} | </text>
						<text class="age">{{ doctor.age }}岁</text>
					</view>
					<view class="value">
						<image class="value-icon" src="../../../static/images/index/value.png"></image>
						{{ doctor.moreInfo.rating }}
					</view>
					<view class="specialty-container">
						<text :class="[
              'doctor-certification',
              doctor.is_certified ? 'certified' : 'uncertified',
            ]">
							{{ doctor.is_certified ? "已认证" : "未认证" }}
						</text>
					</view>
				</view>
				<view class="doctor-avatar">
					<image :src="doctor.avatarUrl" mode="aspectFill"></image>
				</view>
			</view>
			
			<view class="section-card">
				<view class="section-header">
					<uni-icons type="person-filled" size="30" class="section-icon" color="#16969d"></uni-icons>
					<text class="section-title">自我介绍</text>
				</view>
				<view class="section-content">
					<text>{{ doctor.moreInfo.self_introduction }}</text>
				</view>
				<view class="work-container">
					<text class="doctor-work">{{ doctor.moreInfo.language }}</text>
					<text class="doctor-work" v-if="doctor.moreInfo.provide_transport">可接送</text>
				</view>
			</view>
			
			<view class="section-card" v-if="doctor.certificate">
				<view class="section-header">
					<uni-icons type="star-filled" size="30" class="section-icon" color="#16969d"></uni-icons>
					<text class="section-title">技能证书</text>
				</view>
				<image :src="doctor.certificate" mode="aspectFill" class="certificate-image"></image>
			</view>

			<view class="section-card">
				<view class="section-header">
						<uni-icons type="shop-filled" size="30" class="section-icon" color="#16969d"></uni-icons>
					<text class="section-title">熟悉医院</text>
				</view>
				<view class="hospital-list">
					<view v-for="(hospital, index) in doctor.moreInfo.familiar_hospitals" :key="index"
						class="hospital-item">
						{{ hospital }}
					</view>
				</view>
			</view>
			
			<view class="section-card">
				<view class="section-header">
					<uni-icons type="hand-up-filled" size="30" class="section-icon" color="#16969d"></uni-icons>
				
					<text class="section-title">熟悉科室</text>
				</view>
				<view class="department-tags">
					<view v-for="(department, index) in doctor.moreInfo.familiar_departments" :key="index"
						class="department-tag">
						{{ department }}
					</view>
				</view>
			</view>
			
			<view class="section-card">
				<view class="section-header">
					<uni-icons type="chat-filled" size="30" class="section-icon" color="#16969d"></uni-icons>
					<text class="section-title">用户评价</text>
				</view>
				<view class="reviews">
					<view class="review-item" v-for="(item, index) in doctor.moreInfo.review" :key="index">
						<view class="review-header">
							<view class="review-rating">
								<text class="rating-star">★</text>
								<text>{{ item.rating }}</text>
							</view>
							<view class="review-date">{{ item.date || '2023-01-01' }}</view>
						</view>
						<view class="review-text">{{ item.review }}</view>
					</view>
				</view>
			</view>
			
		<!-- 	<view class="action-bar">
				<button class="contact-btn">联系陪诊师</button>
				<button class="appointment-btn">立即预约</button>
			</view> -->
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				pageTitle: "陪诊师详情",
				scrollTop: 0,
				navHeight: 0,
				doctor: {}
			};
		},
		onPageScroll(e) {
			// console.log('页面滚动:', e.scrollTop);
			this.scrollTop = e.scrollTop;
		},
		onLoad(options) {
			const systemInfo = uni.getSystemInfoSync();
			this.navHeight = systemInfo.statusBarHeight + 44;
			if (options.doctor) {
				this.doctor = JSON.parse(decodeURIComponent(options.doctor));
				console.log("this.doctor",this.doctor)
			}
		},
		methods: {
			handleScroll(e) {
				if (this.scrollTimer) clearTimeout(this.scrollTimer)
				this.scrollTimer = setTimeout(() => {
					this.scrollTop = e.detail.scrollTop
				}, 16)
			},
		},
	};
</script>

<style lang="scss">
	.container {
		// background-color: #f5f7fa;
		min-height: 100vh;
	}
	
	.page-container {
		padding:  25rpx;
		box-sizing: border-box;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		
		&::-webkit-scrollbar {
			display: none;
			width: 0 !important;
			height: 0 !important;
		}
	}
	
	/* 医生卡片样式 */
	.doctor-card {
		display: flex;
		align-items: center;
		background: linear-gradient(135deg, #29d7e3, #1ac8d9);
		border-radius: 24rpx;
		padding: 30rpx;
		color: #fff;
		box-shadow: 0 10rpx 20rpx rgba(31, 199, 214, 0.2);
		margin-bottom: 30rpx;
	}
	
	.doctor-info {
		flex: 1;
	}
	
	.doctor-avatar {
		width: 200rpx;
		height: 200rpx;
		border-radius: 50%;
		overflow: hidden;
		border: 4rpx solid #fff;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		
		image {
			width: 100%;
			height: 100%;
		}
	}
	
	.name {
		font-size: 42rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
	}
	
	.detail {
		font-size: 28rpx;
		margin-bottom: 15rpx;
		display: flex;
		align-items: center;
		
		text {
			margin-right: 15rpx;
		}
	}
	
	.value {
		display: flex;
		align-items: center;
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
		
		.value-icon {
			width: 40rpx;
			height: 40rpx;
			margin-right: 10rpx;
		}
	}
	
	.specialty-container {
		display: flex;
		flex-wrap: wrap;
		gap: 15rpx;
	}
	
	.doctor-certification {
		font-size: 24rpx;
		padding: 6rpx 16rpx;
		border-radius: 30rpx;
		background-color: rgba(255, 255, 255, 0.2);
		
		&.certified {
			background-color: rgba(255, 255, 255, 0.3);
		}
	}
	
	/* 通用卡片样式 */
	.section-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}
	
	.section-header {
		display: flex;
		align-items: center;
		margin-bottom: 25rpx;
		padding-bottom: 20rpx;
		border-bottom: 1rpx solid #f1f1f1;
		
		.section-icon {
			
			margin-right: 15rpx;
		}
		
		.section-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}
	}
	
	.section-content {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
	}
	
	/* 工作标签 */
	.work-container {
		display: flex;
		flex-wrap: wrap;
		gap: 15rpx;
		margin-top: 20rpx;
	}
	
	.doctor-work {
		font-size: 24rpx;
		color: #1fc7d6;
		background-color: #e6f7f9;
		border-radius: 30rpx;
		padding: 6rpx 20rpx;
	}
	
	/* 证书图片 */
	.certificate-image {
		width: 100%;
		height: 300rpx;
		border-radius: 12rpx;
		margin-top: 15rpx;
	}
	
	/* 医院列表 */
	.hospital-list {
		display: flex;
		flex-direction: column;
		gap: 15rpx;
	}
	
	.hospital-item {
		padding: 20rpx;
		background-color: #f8fafb;
		border-radius: 12rpx;
		color: #555;
		font-size: 28rpx;
		border-left: 4rpx solid #1fc7d6;
	}
	
	/* 科室标签 */
	.department-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 15rpx;
	}
	
	.department-tag {
		background-color: #1fc7d6;
		color: white;
		padding: 8rpx 20rpx;
		border-radius: 30rpx;
		font-size: 24rpx;
	}
	
	/* 评价区域 */
	.reviews {
		display: flex;
		flex-direction: column;
		gap: 25rpx;
	}
	
	.review-item {
		padding: 20rpx;
		background-color: #f8fafb;
		border-radius: 12rpx;
	}
	
	.review-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15rpx;
	}
	
	.review-rating {
		display: flex;
		align-items: center;
		color: #ffb400;
		font-weight: bold;
		
		.rating-star {
			margin-right: 5rpx;
		}
	}
	
	.review-date {
		font-size: 24rpx;
		color: #999;
	}
	
	.review-text {
		font-size: 28rpx;
		color: #555;
		line-height: 1.5;
	}
	
	/* 底部操作栏 */
	.action-bar {
		display: flex;
		justify-content: space-between;
		padding: 20rpx 0;
		background-color: #fff;
		position: sticky;
		bottom: 0;
		z-index: 10;
		
		button {
			flex: 1;
			height: 80rpx;
			line-height: 80rpx;
			font-size: 30rpx;
			border-radius: 40rpx;
			margin: 0 15rpx;
		}
		
		.contact-btn {
			background-color: #fff;
			color: #1fc7d6;
			border: 1rpx solid #1fc7d6;
		}
		
		.appointment-btn {
			background-color: #1fc7d6;
			color: #fff;
			border: none;
			box-shadow: 0 4rpx 12rpx rgba(31, 199, 214, 0.3);
		}
	}
</style>