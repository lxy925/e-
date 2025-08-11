<template>
	<view class="page">
	<custom-nav :title="pageTitle" :isHomePage="false" :scrollTop="scrollTop" ref="customNav" />
		<scroll-view scroll-y class="page-container" @scroll="handleScroll" :style="{ 
	  paddingTop: navHeight + 'px',
	  height: 'calc(100vh - ' + navHeight + 'px)'
	}" :scroll-top="scrollTop" :show-scrollbar="false">
	
	<view class="settings-container">
		<view class="settings-item" @click="viewDocumentation">
			<text>查看小程序相关文档</text>
		</view>
	</view>
	</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				navHeight: 0, // 添加导航栏高度存储
				pageTitle: '设置中心',
				scrollTop: 0,
			}
		},
		onLoad() {
			// 获取导航栏高度
			const systemInfo = uni.getSystemInfoSync();
			this.navHeight = systemInfo.statusBarHeight + 44;
		},
		methods: {
			//监视页面滚动情况
			handleScroll(e) {
				if (this.scrollTimer) clearTimeout(this.scrollTimer)
				this.scrollTimer = setTimeout(() => {
					this.scrollTop = e.detail.scrollTop
				}, 16) // 约60fps
			},
			viewDocumentation() {
				uni.showToast({
					title: '即将打开文档',
					icon: 'none'
				});
				// 实际项目中这里可以跳转到文档页面或打开网页
				// uni.navigateTo({ url: '/pages/documentation/index' });
				// 或
				// uni.openUrl({ url: 'https://your-documentation-url' });
			},
		}
	}
</script>

<style>
	.page {
		height: 100vh;
	
	}
	
	.page-container {
		min-height: 100vh;
		position: relative;
	
		padding-left: 25rpx;
		padding-right: 25rpx;
		margin: 0;
		width: 100%;
		box-sizing: border-box;
		/* 关键：让 width 包含 padding */
		-webkit-overflow-scrolling: touch;
		/* 平滑滚动 */
		scrollbar-width: none;
		/* Firefox */
	}
	
	.page-container ::-webkit-scrollbar {
		display: none;
		/* Chrome/Safari */
		width: 0 !important;
		/* 微信小程序可能需要 */
		height: 0 !important;
	}
	
	.settings-container {
		width: 100%;
		max-width: 100%;
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		padding-top: 50rpx;
	}
	
	.settings-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		background-color: #ffffff;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		font-size: 32rpx;
		color: #333;
	}
	
	.logout {
		color: #e64340;
	}
	
	.settings-item text {
		margin-right: 10rpx;
	}
</style>