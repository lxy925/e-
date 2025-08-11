<template>
	<view class="page">
		<custom-nav :title="pageTitle" :isHomePage="false" :scrollTop="scrollTop" ref="customNav" />
		<scroll-view scroll-y class="page-container" @scroll="handleScroll" 
			:style="{ 
				paddingTop: navHeight + 'px',
				height: 'calc(100vh - ' + navHeight + 'px)'
			}" 
			:scroll-top="scrollTop" 
			:show-scrollbar="false">
			
			<view class="content-container">
				<view v-if="chatPartners.length === 0" class="empty-tip">
					<text>暂无聊天对象</text>
				</view>

				<view v-else class="partner-list">
					<view v-for="(partner, index) in chatPartners" :key="index" class="partner-item"
						@click="startChat(partner)">
						<image class="avatar" :src="partner.avatar"></image>
						<view class="info">
							<text class="name">{{partner.name}}</text>
							<text class="type">{{partner.type}}</text>
						</view>
						<view class="right-arrow">
							<text class="iconfont">></text>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import customNav from '@/components/custom-nav/custom-nav.vue'

	export default {
		components: {
			customNav
		},
		data() {
			return {
				pageTitle: "服务信息列表",
				navHeight: 0, // 添加导航栏高度存储
				scrollTop: 0,
				chatPartners: [],
				currentUser: null
			}
		},

		onLoad() {
			// 获取导航栏高度
			const systemInfo = uni.getSystemInfoSync();
			this.navHeight = systemInfo.statusBarHeight + 44;
			this.initData();
		},

		methods: {
			//监视页面滚动情况
			handleScroll(e) {
				if (this.scrollTimer) clearTimeout(this.scrollTimer)
				this.scrollTimer = setTimeout(() => {
					this.scrollTop = e.detail.scrollTop
				}, 16) // 约60fps
			},
			async initData() {
				try {
					console.log('chatList');
					// 获取当前用户信息
					const currentUserInfo = uni.getStorageSync('userInfo');
					console.log('获取到的用户信息：', currentUserInfo);
					if (!currentUserInfo) {
						uni.showToast({
							title: '请先登录',
							icon: 'none'
						});
						setTimeout(() => {
							uni.navigateBack();
						}, 1500);
						return;
					}

					this.currentUser = currentUserInfo;
					await this.getChatPartners();
				} catch (e) {
					console.error('初始化数据失败:', e);
					uni.showToast({
						title: '获取数据失败',
						icon: 'none'
					});
				}
			},

			async getChatPartners() {
				try {
					const {
						result
					} = await uniCloud.callFunction({
						name: 'getChatList',
						data: {
							currentUser: this.currentUser
						}
					});

					if (result.code === 200) {
						this.chatPartners = result.data;
						console.log('聊天对象列表:', this.chatPartners);
					} else {
						uni.showToast({
							title: result.msg || '获取聊天对象失败',
							icon: 'none'
						});
					}
				} catch (e) {
					console.error('获取聊天对象失败:', e);
					uni.showToast({
						title: '获取聊天对象失败',
						icon: 'none'
					});
				}
			},

			startChat(partner) {
				// 存储聊天对象信息
				uni.setStorageSync('currentUserInfo', {
					user_id: this.currentUser.user_id,
					type: this.currentUser.type,
					nickName: this.currentUser.nickName,
					avatar: this.currentUser.avatar,
					partner_id: partner.user_id
				});

				// 跳转到聊天页面
				uni.navigateTo({
					url: '/pages/consult/consult',
					fail: (err) => {
						console.error('页面跳转失败:', err);
						uni.showToast({
							title: '页面跳转失败',
							icon: 'none'
						});
					}
				});
			},

			goBack() {
				uni.navigateBack({
					delta: 1,
					fail: () => {
						// 如果返回失败，则跳转到首页
						uni.switchTab({
							url: '/pages/mine/mine'
						});
					}
				});
			}
		}
	}
</script>

<style>
	.page {
		height: 100vh;
		/* background-color: #2ecc71; */
	
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
	
	.container {
		
	}
	

	.back-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 10rpx;
	}

	.back-icon {
		width: 48rpx;
		height: 48rpx;
	}

	.chat-list {
		flex: 1;
		padding: 20rpx;
		margin-top: 20rpx;
		/* 添加顶部外边距 */
	}

	.empty-tip {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: #999;
		font-size: 28rpx;
		text-align: center;
	}

	.partner-list {
		background-color: #fff;
		border-radius: 12rpx;
		overflow: hidden;
		margin-top: 20rpx;
		/* 添加顶部外边距 */
	}

	.partner-item {
		display: flex;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #eee;
	}

	.partner-item:last-child {
		border-bottom: none;
	}

	.avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		margin-right: 20rpx;
	}

	.info {
		flex: 1;
	}

	.name {
		font-size: 32rpx;
		color: #333;
		margin-bottom: 8rpx;
		display: block;
	}

	.type {
		font-size: 24rpx;
		color: #999;
	}

	.right-arrow {
		color: #999;
		font-size: 32rpx;
	}
</style>