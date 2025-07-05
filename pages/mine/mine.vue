<template>
	<scroll-view scroll-y class="page-container" @scroll="handleScroll"
		:style="{ paddingTop: navHeight + 'px',height: 'calc(100vh - ' + navHeight + 'px)'}" :scroll-top="scrollTop">
		<custom-nav :title="pageTitle" :isHomePage="true" :scrollTop="scrollTop" />
		<view class="content">
			<view class="header" @click="handleHeaderClick">
				<img class="headerimg" :src="
          userInfo.moreInfo.avatarUrl || '../../static/images/mine/avatar.png'
        " v-if="userInfo.type == '陪诊师'" alt="" />
				<img class="headerimg" :src="userInfo.avatar || '../../static/images/mine/avatar.png'" v-else alt="" />

				<text class="username">{{ userInfo.nickName || "登录" }}</text>
				<text class="user-info" v-if="userInfo.type == '陪诊师'">
					{{ userInfo.moreInfo.is_certified ? "已认证" : "未认证" }}</text>
				<view class="state-box" v-if="userInfo.type == '陪诊师'">
					<text class="state">接单状态:</text>
					<switch class="switch" :checked="userInfo.moreInfo.is_bookable" @change="onSwitchChange"
						color="#ff94da" />
				</view>

				<img class="sao" src="../../static/images/mine/sao.png" v-if="userInfo.type == '陪诊师'" alt="扫描图标"
					@click="showQRCode" />


			</view>

			<!-- 		弹窗内容
		<view class="modal-dialog" v-if="isShowModal">
			<img :src="modalImage" class="modal-image" />
			<text class="modal-text">{{modalText}}</text>
			<view style="display: flex;flex-direction: row;">
				<button @click="hideModal">关闭</button>
				<button @click="saveQRCodeToAlbum">保存</button>
				
			</view>

		</view> -->
			<view class="account-box" v-if="userInfo.type == '陪诊师'">
				<view class="account" @click="toApply">
					<view class="account-header">
						<text class="account-title">我的账户</text>
					</view>
					<view class="account-info">
						<view class="account-item">
							<text
								class="account-value">{{(userInfo.accountInfo.withdrawable_amount / 100).toFixed(2)}}</text>
							<text class="account-label">可提取金额</text>
						</view>
						<view class="account-item">
							<text
								class="account-value">{{(userInfo.accountInfo.pending_amount / 100).toFixed(2)}}</text>
							<text class="account-label">待结算金额</text>
						</view>
						<view class="account-item">
							<text class="account-value">{{(userInfo.accountInfo.balance / 100).toFixed(2)}}</text>
							<text class="account-label">累计已结算金额</text>
						</view>
					</view>
				</view>
				<!-- 新增时间选项 -->
				<view class="time-options">
					<view class="time-option" :class="{'selected': selectedTime === 'today'}"
						@click="selectTime('today')">今日</view>
					<view class="time-option" :class="{'selected': selectedTime === 'week'}"
						@click="selectTime('week')">本周</view>
					<view class="time-option" :class="{'selected': selectedTime === 'month'}"
						@click="selectTime('month')">本月</view>
					<view class="time-option" :class="{'selected': selectedTime === 'year'}"
						@click="selectTime('year')">今年</view>
				</view>

				<!-- 数据展示 -->
				<view class="data-display">
					<view class="data-item">
						<text class="data-item-item">{{ orderCount }}</text>
						<text>订单量</text>

					</view>
					<view class="data-item">
						<text class="data-item-item">{{ salesAmount }}</text>
						<text>销售额</text>

					</view>
					<view class="data-item">
						<text class="data-item-item">{{ pendingAmount }}</text>
						<text>已提现金额</text>

					</view>
					<view class="data-item">
						<text class="data-item-item">{{ settledAmount }}</text>
						<text>已结算金额</text>

					</view>
				</view>
			</view>

			<view class="info-box" v-else>
				<view class="money">
					<text class="money-num"> 1</text>
					<view class="money-box">
						<image src="../../static/images/index/money (2).png" alt=""></image>
						<text class="money-title"> 当前余额(元)</text>
					</view>
				</view>
				<view class="benefit">
					<text class="benefit-num"> 0</text>
					<view class="benefit-box">
						<image src="../../static/images/index/card.png" alt=""></image>
						<text class="benefit-title">优惠券</text>
					</view>
				</view>
			</view>

			<view class="order-box">
				<text class="order-title">订单管理</text>
				<view class="order-item" v-if="userInfo.type == '陪诊师'">
					<view class="box" style="margin-left: 0">
						<image src="../../static/images/mine/willdo.png" alt=""></image>
						<text class="box-title">待完成</text>
					</view>
					<view class="box">
						<image src="../../static/images/mine/ordering.png" alt=""></image>
						<text class="box-title">进行中</text>
					</view>
					<view class="box">
						<image src="../../static/images/mine/finish.png" alt=""></image>
						<text class="box-title">已完成</text>
					</view>
					<view class="box">
						<image src="../../static/images/mine/cancel.png" alt=""></image>
						<text class="box-title">已取消</text>
					</view>
				</view>
				<view class="order-item" v-else>
					<view class="box" style="margin-left: 0">
						<image src="../../static/images/mine/pay.png" alt=""></image>
						<text class="box-title">待付款</text>
					</view>
					<view class="box">
						<image src="../../static/images/mine/ordering.png" alt=""></image>
						<text class="box-title">进行中</text>
					</view>
					<view class="box">
						<image src="../../static/images/mine/finish.png" alt=""></image>
						<text class="box-title">已完成</text>
					</view>
					<view class="box">
						<image src="../../static/images/mine/cancel.png" alt=""></image>
						<text class="box-title">已取消</text>
					</view>
				</view>
			</view>
			<view class="order-box">
				<text class="order-title">
					我的工具</text>
				<view class="order-item" v-if="userInfo.type == '陪诊师'">
					<view class="boxed" @click="doctorRegister">
						<image src="../../static/images/mine/patient.png" alt=""></image>
						<text class="box-title">个人信息管理</text>
					</view>
					<view class="boxed" @click="goToSetTime">
						<image src="../../static/images/mine/advice.png" alt=""></image>
						<text class="box-title">查看用户评价</text>
					</view>
					<view class="box" @click="goToChat">
						<image src="../../static/images/mine/chat1.png" alt=""></image>
						<text class="box-title">聊天</text>
					</view>
					<view class="boxed" @click="goSetting">
						<image src="../../static/images/mine/setting.png" alt=""></image>
						<text class="box-title">设置中心</text>
					</view>
					<!-- <view class="boxed">
			<image src="../../static/images/mine/location.png" alt=""></image>
			<text class="box-title">地址设置</text>
		</view> -->
				</view>
				<view class="order-item" v-else>
					<view class="box" id="box1" style="margin-left: 0">
						<image src="../../static/images/mine/location.png" alt=""></image>
						<text class="box-title">地址管理</text>
					</view>
					<view class="box" @click="goPationManager">
						<image src="../../static/images/mine/patient.png" alt=""></image>
						<text class="box-title">就诊人管理</text>
					</view>
					<view class="box" @click="goToChat">
						<image src="../../static/images/mine/chat1.png" alt=""></image>
						<text class="box-title">聊天</text>
					</view>
					<!-- <view class="box">
          <image src="../../static/images/mine/doctor.png" alt=""></image>
          <text class="box-title">我的陪诊师</text>
        </view> -->
					<view class="box">
						<image src="../../static/images/mine/advice.png" alt=""></image>
						<text class="box-title">投诉建议</text>
					</view>
					<view class="box" style="margin-left: 0" @click="doctorRegister">
						<image src="../../static/images/mine/help.png" alt=""></image>
						<text class="box-title">陪诊师入驻</text>
					</view>
					<view class="box" @click="goSetting">
						<image src="../../static/images/mine/setting.png" alt=""></image>
						<text class="box-title">设置中心</text>
					</view>
				</view>
			</view>
			<view class="logout-box">
				<image src="../../static/images/mine/logout.png" alt=""></image>
				<button class="logout" @click="logout" v-if="userInfo.user_id">
					退出登录
				</button>
			</view>
		</view>
	</scroll-view>
</template>

<script>
	export default {
		data() {
			return {
				navHeight: 0, // 添加导航栏高度存储
				pageTitle: '个人中心',
				scrollTop: 0,
				lastScrollTop: 0,
				pageScrollTop: 0, // 在父组件中管理滚动位置
				userInfo: {
					session_key: '',
					avatar: '',
					nickName: '',
					is_certified: '',
					user_id: '',
					phone: '',
					idNumber: '',
					type: '',
					moreInfo: {},
				},
				settledAmount: 0.00,
				pendingAmount: 0.00,
				salesAmount: 0.00,
				orderCount: 0,
				selectedTime: 'today', // 默认选择今日

			};
		},
		onLoad() {
			// 获取导航栏高度
			const systemInfo = uni.getSystemInfoSync();
			this.navHeight = systemInfo.statusBarHeight + 44;
			this.initUserInfo();
			if (this.userInfo != '' && this.userInfo.type == "陪诊师") {
				this.selectTime('today');
			}

		},
		onShow() {
			this.initUserInfo();
			if (this.userInfo != '' && this.userInfo.type == "陪诊师") {
				this.selectTime('today');
			}
		},
		methods: {
			handleScroll(e) {
				this.scrollTop = e.detail.scrollTop
			},
			goToSetTime() {
				uni.navigateTo({
					url: `/pages/time/time`
				});
			},
			selectTime(time) {
				this.selectedTime = time; // 更新选择的时间选项
				if (time === "today") {
					this.pendingAmount = this.userInfo.withdrawStats.dayAmount;
				} else if (time === "month") {
					this.pendingAmount = this.userInfo.withdrawStats.monthAmount;
				} else if (time === "week") {
					this.pendingAmount = this.userInfo.withdrawStats.weekAmount;
				} else if (time === "year") {
					this.pendingAmount = this.userInfo.withdrawStats.yearAmount;
				}

			},
			//跳转到二维码页面
			showQRCode() {
				const data = this.userInfo.user_id;
				const query = Object.keys(data)
					.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
					.join('&');
				uni.navigateTo({
					url: `/pages/RQcode/RQcode?${query}`,
				});
			},
			initUserInfo() {
				const userInfo = uni.getStorageSync("userInfo");
				console.log("初始化后的值：", userInfo);
				if (userInfo) {
					this.userInfo = userInfo;
					this.getUser();
				}

			},
			async getUser() {
				console.log("调取前检查", this.userInfo);

				const userInfo = this.userInfo;
				try {
					uni.showLoading({
						title: "加载中",
					});
					const {
						result
					} = await uniCloud.callFunction({
						name: "getUser",
						data: {
							userInfo,

						}
					});

					if (result.code == 200) {
						console.log(result.data);
						this.userInfo = result.data;

						console.log("调取后检查", this.userInfo);
						uni.setStorageSync("userInfo", this.userInfo);
						console.log(this.userInfo.type)
					} else if (result.code == 401) {
						uni.showToast({
							title: '登录状态已过期，请重新登录',
							icon: "none",
						});
						this.logout();
						uni.navigateTo({
							url: `/pages/userInfoDetail/userInfoDetail`,
						});
						// uni.redirectTo({ url: '/pages/userInfoDetail/userInfoDetail' })
					} else {
						uni.showToast({
							title: result.msg || "获取用户数据失败",
							icon: "none",
						});
					}
				} catch (e) {
					uni.showToast({
						title: "获取用户数据失败",
						icon: "none",
					});
				} finally {
					uni.hideLoading();
				}
			},
			logout() {
				uni.removeStorageSync("userInfo");
				uni.removeStorageSync("token");
				uni.removeStorageSync("refreshToken");
				this.userInfo = {
					user_id: '',
					nickName: '',
					realName: '',
					idCard: '',
					phoneNumber: '',
					avatar: '',
					type: '',
					moreInfo: {}
				};

				uni.showToast({
					title: "退出登录成功",
					icon: "success",
					duration: 2000,
				});
			},
			// 处理头部点击事件
			handleHeaderClick() {
				if (this.userInfo.user_id) {
					console.log("已登录");
					return;
				} else {
					console.log("登录");
					uni.navigateTo({
						url: "/pages/userInfoDetail/userInfoDetail",
					});
				}
			},
			doctorRegister() {
				uni.navigateTo({
					url: "/pages/escortRegistration/escortRegistration",
				});

			},
			async onSwitchChange() {
				console.log("改变之前的值", this.userInfo.moreInfo.is_bookable);
				try {
					const {
						result
					} = await uniCloud.callFunction({
						name: "updateEscort",
						data: {
							user_id: this.userInfo.user_id,
							is_bookable: !this.userInfo.moreInfo.is_bookable,
						},
					});

					if (result.code === 200) {
						uni.showToast({
							title: "修改成功",
							icon: "success",
						});

						this.getUser();
						console.log("改变之后的值", this.userInfo.moreInfo.is_bookable);
					} else {
						uni.showToast({
							title: result.message || "修改失败",
							icon: "none",
						});
					}
				} catch (e) {
					uni.showToast({
						title: '获取用户数据失败',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},

			toApply() {
				const accountInfo = encodeURIComponent(JSON.stringify(this.userInfo.accountInfo));
				uni.navigateTo({
					url: `/pages/getMoney/getMoney?accountInfo=${accountInfo}`
				});

			},
			//跳转到就诊人管理页面
			goPationManager() {
				uni.navigateTo({
					url: "/pages/patientManagement/patientManagement"
				});
			},
			toAccount() {
				uni.navigateTo({
					url: '/pages/account/account'
				})
			},
			goToChat() {
				
				if (!this.userInfo._id) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					});
					return;
				}

				// const currentUserInfo = {
				// 	_id: this.userInfo._id,
				// 	user_id: this.userInfo.user_id,
				// 	type: this.userInfo.type,
				// 	nickName: this.userInfo.nickName,
				// 	realName: this.userInfo.realName,
				// 	avatar: this.userInfo.avatar,
				// 	phone: this.userInfo.phone
				// };

				// console.log('准备存储的用户信息：', currentUserInfo);
				// uni.setStorageSync('currentUserInfo', currentUserInfo);
				uni.navigateTo({
					url: '/pages/chatList/chatList',
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
				uni.navigateBack();
			}
		},
	};
</script>

<style>
	/* pages/mine/mine.wxss */
	.page-container {
		min-height: 100vh;
		position: relative;
		padding: 0 rpx;
		padding-left: 25rpx;
		padding-right: 25rpx;
		margin: 0;
		width: 100%;
		box-sizing: border-box;
		/* 关键：让 width 包含 padding */
	}

	.content {
		width: 100%;
		max-width: 100%;
		/* 限制最大宽度（可选） */
		margin: 0;
		/* 水平居中 */
		padding: 0;
		box-sizing: border-box;
		padding-top: 50rpx;
	}

	.header {
		display: flex;
		align-items: center;
	}

	.header img {
		width: 180rpx;
		height: 180rpx;
		border-radius: 50%;
		margin-left: 50rpx;
		margin-top: 50rpx;
	}

	.headerimg {
		width: 180rpx;
		height: 180rpx;
		border-radius: 50%;
	}

	.username {
		font-size: 25px;
		font-weight: bold;
		margin-left: 50rpx;
		margin-top: 10rpx;
		margin-top: -50rpx;
	}

	.user-info {
		font-size: 13px;
		font-weight: bold;
		margin-left: 30rpx;
		margin-top: 10rpx;
		background-color: #a5d63f;
		margin-top: -50rpx;
		background-color: #1c9bd6;
		padding: 10rpx;
		height: auto;
		border-radius: 20rpx;
	}

	.sao {
		margin-left: 150rpx;
		margin-top: -50rpx;
		border-radius: 0;
		height: 50rpx;
		width: 50rpx;
	}

	.state-box {
		margin-top: 100rpx;
		margin-left: -180rpx;
		font-size: 15px;
		font-weight: bold;
	}

	.state {
		margin-right: 15rpx;
	}

	.down {
		display: flex;
		margin-top: 40rpx;
		justify-content: space-evenly;
		background-color: #fff;
		border-radius: 15rpx;
		padding: 20rpx;
		margin-left: 50rpx;
		margin-right: 50rpx;
		color: #333;
	}

	.box {
		border-radius: 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 200rpx;
	}

	.header-num {
		font-size: 25px;
		font-weight: bold;
		margin-top: 20rpx;
		margin-bottom: 10rpx;
		font-weight: bold;
	}

	.header-title {
		font-size: 13px;
		font-weight: bold;
		margin-top: 0;
	}

	.info-box {
		display: flex;
		margin-top: 40rpx;
		justify-content: space-evenly;
		background-color: #fff;
		border-radius: 15rpx;
		padding: 20rpx;
		color: #333;
	}

	.money {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
	}

	.money-box {
		display: flex;
		align-items: center;
		margin-right: 20rpx;
		margin-top: 70rpx;
	}

	.benefit {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
	}

	.benefit-box {
		display: flex;
		align-items: center;
		margin-right: 40rpx;
		margin-top: 70rpx;
	}

	.money-num {
		font-size: 25px;
		font-weight: bold;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
	}

	.benefit-num {
		font-size: 25px;
		font-weight: bold;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
	}

	.money-title {
		font-size: 13px;
		font-weight: bold;
		margin-left: 10rpx;
	}

	.benefit-title {
		font-size: 13px;
		font-weight: bold;
		margin-left: 10rpx;
	}

	.money image {
		width: 48rpx;
		height: 48rpx;
	}

	.benefit image {
		width: 50rpx;
		height: 50rpx;
	}

	.all-box {
		display: flex;
		margin: 30rpx;
		border-radius: 20rpx;
		background-color: #ddf5f4;
		padding: 30rpx;
		justify-content: center;
		height: 120rpx;
	}

	.data-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 20rpx;
		width: 250rpx;
		gap: 10rpx;
	}

	.first {
		display: flex;
		flex-direction: row;
		align-items: center;
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

	.order-box {
		margin-top: 40rpx;
		background-color: #fff;
		border-radius: 15rpx;
		padding: 20rpx;
		padding: 20 0rpx;
		width: 100%;
	}

	.order-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-left: 20rpx;
	}

	.order-item {
		margin-top: 20rpx;
		display: flex;
		flex-wrap: wrap;
	}

	.boxed {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 30%;
		margin-bottom: 20rpx;
		margin-left: 15rpx;
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

	.box {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 25%;
		margin-bottom: 20rpx;
	}

	.box image {
		width: 75rpx;
		height: 75rpx;
		margin-bottom: 10rpx;
	}

	.box-title {
		font-size: 13px;
		font-weight: bold;
		margin-top: 10rpx;
	}

	.logout-box {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 40rpx;
	}

	.logout-box image {
		width: 50rpx;
		height: 50rpx;
		position: absolute;
		left: calc(50% - 120rpx);
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

	.box image {
		width: 75rpx;
		height: 75rpx;
		margin-bottom: 10rpx;
	}

	.box-title {
		font-size: 13px;
		font-weight: bold;
		margin-top: 10rpx;
	}

	.logout-box {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 40rpx;
	}

	.logout-box image {
		width: 50rpx;
		height: 50rpx;
		position: absolute;
		left: calc(50% - 120rpx);
		z-index: 1;
	}

	.logout-box button {
		width: 400rpx;
		height: 80rpx;
		background-color: #1fc7d6;
		color: #fff;
		display: flex;
		justify-content: center;
		align-items: center;
		padding-left: 50rpx;
	}

	.account-box {
		background-color: #fff;
		border-radius: 15rpx;
		padding: 0rpx;
		margin: 20rpx 0rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.account {
		background-color: #8ce5ef;
		border-radius: 15rpx;
		padding: 20rpx;
	}

	.account-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.account-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.account-info {
		display: flex;
		gap: 50rpx;
		margin-top: 20rpx;
	}

	.account-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 250rpx;
		/* background-color: aqua; */
	}

	.account-label {
		font-size: 13px;
		color: #ffffff;
	}

	.account-value {
		font-size: 25px;
		font-weight: bold;
		color: #ffffff;
		margin-top: 10rpx;
		margin-bottom: 20rpx;
	}

	.time-options {
		display: flex;
		justify-content: space-around;
		margin: 20px 0;
	}

	.time-option {
		padding: 8rpx 25rpx;
		border: 1px solid #1fc7d6;
		border-radius: 30rpx;
		color: #1fc7d6;
		cursor: pointer;
	}

	.time-option:hover {
		background-color: #1fc7d6;
		color: white;
	}

	.time-option.selected {
		background-color: #1fc7d6;
		color: white;
	}

	.data-display {
		margin-top: 20px;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	.data-item {
		margin: 15px 0;
		margin-top: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		font-size: 25rpx;
		width: 200rpx;
	}

	.data-item-item {
		margin-bottom: 20rpx;
		font-weight: bold;
		font-size: 30rpx;
	}

	.back-btn {
		position: absolute;
		top: 20rpx;
		left: 20rpx;
		width: 80rpx;
		height: 80rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.back-icon {
		width: 40rpx;
		height: 40rpx;
	}
</style>