<template>
	<scroll-view scroll-y class="page-container" @scroll="handleScroll" :style="{ 
	      paddingTop: navHeight + 'px',
	      height: 'calc(100vh - ' + navHeight + 'px)'
	    }" :scroll-top="scrollTop":show-scrollbar="false">
		<custom-nav :title="pageTitle" :isHomePage="true" :scrollTop="scrollTop" />

		<view class="content" >
			<view class="textTop"> 祝您有一个健康的一天 </view>
			<view class="uni-margin-wrap">
				<swiper class="swiper" circular :indicator-dots="true" :autoplay="true" :interval="3000"
					:duration="500">
					<swiper-item v-for="banner in banners" :key="banner._id" @tap="handleBannerClick(banner)">
						<image :src="banner.image" mode="aspectFill" style="width: 100%;"></image>
					</swiper-item>
				</swiper>

				<!-- 新增的图标导航栏 -->
				<view class="icon-nav">
					<view class="icon-item" v-for="(item, index) in navItems" :key="index"
						@tap="handleNavClick(item.path)">
						<image :src="item.icon" mode="aspectFit" class="nav-icon"></image>
						<text class="nav-text">{{ item.text }}</text>
					<!-- AI悬浮按钮 -->
					<view class="ai-float-btn" 
						@touchstart="touchStart" 
						@touchmove="touchMove" 
						@touchend="touchEnd"
						:style="{ left: buttonX + 'px', top: buttonY + 'px' }"
						@tap="navigateToAI">
						<text>AI咨询</text>
					</view>

					<!-- 新增的图标导航栏 -->
					<view class="icon-nav">
						<view class="icon-item" v-for="(item, index) in navItems" :key="index"
							@tap="handleNavClick(item.path)">
							<image :src="item.icon" mode="aspectFit" class="nav-icon"></image>
							<text class="nav-text">{{ item.text }}</text>
						</view>
					</view>
				</view>

			</view>

			<!-- 热门医院推荐 -->
			<view class="hospital-section">

				<view class="section-header">
					<text class="section-title">热门医院推荐</text>
					<view class="more-link" @tap="navigateToMore">
						更多<text class="arrow">></text>
					</view>
				</view>

				<view class="hospital-list">
					<!-- <scroll-view> -->
					<view class="hospital-item" v-for="hospital in hospitals" :key="hospital.id"
						@tap="navigateToHospital(hospital.id)">
						<image :src="hospital.image" mode="aspectFill" class="hospital-image"></image>
						<view class="hospital-info">
							<view class="hospital-header">
								<text class="hospital-name">{{ hospital.name }}</text>
								<text class="hospital-level">{{ hospital.level }}</text>
							</view>
							<view class="hospital-detail">
								<view class="detail-item">
									<text class="label">类型：</text>
									<text class="value">{{ hospital.type }}</text>
								</view>
								<view class="detail-item">
									<text class="label">电话：</text>
									<text class="value">{{ hospital.phone }}</text>
								</view>
								<view class="detail-item address">
									<text class="label">地址：</text>
									<text class="value">{{ hospital.address }}</text>
								</view>
							</view>
						</view>

					</view>
					<!-- </scroll-view> -->
				</view>

			</view>
		</view>

	</scroll-view>

</template>

<script>
	// pages/index/index.js
	export default {
		data() {
			return {
				pageTitle: '首页',
				scrollTop: 0,
				navHeight: 0,// 添加导航栏高度存储
				buttonX: 30, // 按钮初始X坐标
				buttonY: 200, // 按钮初始Y坐标
				startX: 0, // 触摸开始X坐标
				startY: 0, // 触摸开始Y坐标
				isDragging: false, // 是否正在拖拽
				banners: [],
				indicatorDots: true,
				autoplay: true,
				interval: 2000,
				duration: 500,
				endY: 0,
				navItems: [{
						icon: "/static/images/index/index-service.png",
						text: "我要陪诊",
						path: "/pages/serviceSelection/serviceSelection",
					},
					{
						icon: "/static/images/index/index-help.png",
						text: "急救方法",
						path: "/pages/help/help",
					},
					{
						icon: "/static/images/index/index-prevant.png",
						text: "重疾防治",
						path: "/pages/prevent/prevent",
					},
					{
						icon: "/static/images/index/index-test.png",
						text: "陪诊师考题",
						path: "/pages/test/test",
					},
				],
				hospitals: [{
						id: 1,
						name: "北京协和医院",
						level: "三级甲等",
						type: "综合医院",
						phone: "010-69156114",
						address: "北京市东城区帅府园一号",
						image: "/static/images/hospital1.jpg",
					},
					{
						id: 2,
						name: "北京大学第一医院",
						level: "三级甲等",
						type: "综合医院",
						phone: "010-83572211",
						address: "北京市西城区西什库大街8号",
						image: "/static/images/hospital1.jpg",
					},
					{
						id: 3,
						name: "中国医学科学院肿瘤医院",
						level: "三级甲等",
						type: "综合医院",
						phone: "010-65156114",
						address: "北京市朝阳区潘家园南里17号",
						image: "/static/images/hospital1.jpg",
					},
					{
						id: 4,
						name: "北京友谊医院",
						level: "三级甲等",
						type: "综合医院",
						phone: "010-65156114",
						address: "北京市西城区永安路95号",
						image: "/static/images/hospital1.jpg",
					},
				],
			};
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad(options) {
			// 获取导航栏高度
			const systemInfo = uni.getSystemInfoSync();
			this.navHeight = systemInfo.statusBarHeight + 44;
			this.getBanners()
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
			//监视页面滚动情况
			handleScroll(e) {
				// 直接赋值scrollTop（不需要节流，因为custom-nav内部已经做了立即切换的处理）
				this.scrollTop = e.detail.scrollTop;
				
			},

			handleNavClick(path) {
				uni.navigateTo({
					url: path,
				});
			},

			navigateToMore() {
				uni.navigateTo({
					url: '/pages/more/more?from=index'
				})
			},
			navigateToHospital(id) {
				uni.navigateTo({
					url: `/pages/hospital/detail?id=${id}`,
				});
			},
			// 跳转到AI问答页面
			navigateToAI() {
				if (!this.isDragging) { // 只有在非拖拽状态才触发跳转
					uni.navigateTo({
						url: '/pages/AI/AI'
					});
				}
			},
			// 触摸开始
			touchStart(e) {
				this.startX = e.touches[0].clientX;
				this.startY = e.touches[0].clientY;
				this.isDragging = false;
			},
			// 触摸移动
			touchMove(e) {
				const moveX = e.touches[0].clientX - this.startX;
				const moveY = e.touches[0].clientY - this.startY;
				
				// 如果移动距离超过10px，认为是拖拽
				if (Math.abs(moveX) > 10 || Math.abs(moveY) > 10) {
					this.isDragging = true;
				}
				
				// 计算新的位置
				let newX = this.buttonX + moveX;
				let newY = this.buttonY + moveY;
				
				// 获取屏幕尺寸
				const systemInfo = uni.getSystemInfoSync();
				const screenWidth = systemInfo.windowWidth;
				const screenHeight = systemInfo.windowHeight;
				
				// 限制按钮在屏幕范围内
				newX = Math.max(0, Math.min(newX, screenWidth - 100));
				newY = Math.max(0, Math.min(newY, screenHeight - 100));
				
				this.buttonX = newX;
				this.buttonY = newY;
				this.startX = e.touches[0].clientX;
				this.startY = e.touches[0].clientY;
			},
			// 触摸结束
			touchEnd() {
				this.isDragging = false;
			},
			// 获取轮播图数据
			async getBanners() {
				try {
					uni.showLoading({
						title: '加载中'
					})

					const {
						result
					} = await uniCloud.callFunction({
						name: 'getBanners'
					})
					console.log(result)
					if (result.code === 0) {
						this.banners = result.data
						console.log(result.data)
					} else {
						uni.showToast({
							title: result.msg || '获取轮播图失败',
							icon: 'none'
						})
					}
				} catch (e) {
					uni.showToast({
						title: '获取轮播图失败',
						icon: 'none'
					})
				} finally {
					uni.hideLoading()
				}
			},
			// 处理轮播图点击
			handleBannerClick(banner) {
				if (banner.url) {
					uni.navigateTo({
						url: banner.url,
						fail() {
							uni.showToast({
								title: '页面跳转失败',
								icon: 'none'
							})
						}
					})
				}
			},
		},
	};
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

	.textTop {
		text-align: left;
		font-size: 40rpx;
		font-weight: bold;
		color: #ffffff;
		margin-top: 25rpx;
		width: 650rpx;
	}

	.uni-margin-wrap {
		width: 100%;
		padding: 0rpx;
		padding-top: 10rpx;
		margin-top: 40rpx;
	}

	.swiper {
		height: 250rpx;
		border-radius: 20rpx;
		overflow: hidden;
	}

	.swiper-item {
		display: block;
		height: 200rpx;
		line-height: 300rpx;
	}

	.swiper-item image {
		width: 100%;
		height: 100%;
		border-radius: 20rpx;
	}

	.icon-nav {
		background-color: #ffffff;
		height: 120rpx;
		border-radius: 20rpx;
		margin: 0rpx;
		margin-top: 45rpx;

		width: 100%;
		padding: 30rpx 0rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.icon-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 10rpx;
	}

	.nav-icon {
		width: 80rpx;
		height: 80rpx;
		margin-bottom: 10rpx;
	}

	.nav-text {
		font-size: 26rpx;
		color: #333333;
	}

	.hospital-section {
		padding: 0 0rpx;
		margin-top: 20rpx;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.more-link {
		font-size: 26rpx;
		color: #666;
	}

	.arrow {
		margin-left: 4rpx;
		color: #999;
	}

	.hospital-list {
		width: 100%;
		/* overflow: scroll; */
		/* height: 544rpx; */
	}

	.hospital-item {
		display: flex;
		background: #ffffff;
		padding: 20rpx;
		margin-bottom: 20rpx;
		border-radius: 20rpx;
		box-shadow: 0 3rpx 10rpx rgba(0, 0, 0, 0.08);
	}

	.hospital-image {
		width: 180rpx;
		height: 180rpx;
		border-radius: 8rpx;
		margin-right: 20rpx;
	}

	.hospital-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.hospital-header {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
		align-items: flex-start;
	}

	.hospital-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-right: 16rpx;
		width: 250rpx;
	}

	.hospital-level {
		font-size: 24rpx;
		color: #02d4c6;
		background: rgba(2, 212, 198, 0.1);
		padding: 4rpx 12rpx;
		border-radius: 4rpx;
	}

	.hospital-detail {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.detail-item {
		display: flex;
		font-size: 26rpx;
		margin-bottom: 8rpx;
	}

	.detail-item .label {
		color: #999;
		min-width: 80rpx;
	}

	.detail-item .value {
		color: #666;
		flex: 1;
	}

	.detail-item.address {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	.detail-item.address .value {
		word-break: break-all;
	}

	/* AI悬浮按钮样式 */
	.ai-float-btn {
		position: fixed;
		width: 100rpx;
		height: 100rpx;
		background: linear-gradient(135deg, #1cd6c7, #99efe9);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.2);
		z-index: 999;
		transition: all 0.3s ease;
	}

	.ai-float-btn text {
		color: #ffffff;
		font-size: 32rpx;
		font-weight: bold;
	}

	.ai-float-btn:active {
		transform: scale(0.95);
	}
</style>