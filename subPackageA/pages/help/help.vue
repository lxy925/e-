<template>
	<view class="page">
	<custom-nav :title="pageTitle" :isHomePage="false" :scrollTop="scrollTop" ref="customNav" />
		<scroll-view scroll-y class="page-container" @scroll="handleScroll" :style="{ 
	  paddingTop: navHeight + 'px',
	  height: 'calc(100vh - ' + navHeight + 'px)'
	}" :scroll-top="scrollTop" :show-scrollbar="false">
	
	<view class="settings-container">
		<view class="settings-item" @click="findAndOpenHealthCertFile">
			<text>查看考证报名须知</text>
		</view>
		<view class="settings-item" @click="viewDocumentation1">
			<text>查看提现须知</text>
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
				pageTitle: '帮助中心',
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
				
				uni.navigateTo({ url: '/pages/documentation1/index' });
				
			},
			async findAndOpenHealthCertFile() {
				try {
					uni.showLoading({
						title: '加载中...'
					});

					// 1. 拼接云存储路径（假设文件在 `file/` 目录下）
					const cloudPath =
						'https://mp-f5303e3c-7928-482e-b2e2-0cf6877289c6.cdn.bspapp.com/file/杉本健康考证资料.docx'; // 替换为你的文件名

					// 2. 获取临时下载链接
					const {
						fileList
					} = await uniCloud.getTempFileURL({
						fileList: [cloudPath]
					});

					if (!fileList[0]?.tempFileURL) {
						uni.showToast({
							title: '文件不存在',
							icon: 'none'
						});
						return;
					}

					// 3. 下载并打开文件
					uni.downloadFile({
						url: fileList[0].tempFileURL,
						success(res) {
							if (res.statusCode === 200) {
								uni.openDocument({
									filePath: res.tempFilePath,
									fileType: 'docx', // 根据文件类型调整
									showMenu: true, // 允许用户选择其他应用打开
								});
							}
						},
						fail(err) {
							uni.showToast({
								title: '下载失败',
								icon: 'none'
							});
							console.error(err);
						},
						complete: () => uni.hideLoading(),
					});
				} catch (err) {
					uni.hideLoading();
					uni.showToast({
						title: '操作失败',
						icon: 'none'
					});
					console.error(err);
				}
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