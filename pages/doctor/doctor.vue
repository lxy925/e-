<template>
	<view class="page">
		<!-- pages/doctor/doctor.wxml -->
		<custom-nav :title="pageTitle" :isHomePage="true" :scrollTop="scrollTop" ref="customNav" />
		<!-- 内容区域 -->
		<scroll-view class="page-container" :style="{ paddingTop: navHeight + 'px' }">

			<view class="content" style="padding: 0rpx;">
				<view class="first">
					<swiper class="swiper" circular autoplay interval="3000" duration="500">
						<swiper-item v-for="(banner, index) in banners" :key="index">
							<image :src="banner.image" mode="aspectFill" class="swiper-image"></image>
							<text class="swiper-text">{{ banner.title }}</text>
						</swiper-item>
					</swiper>
				</view>
				<view class="second">
					<!-- 报名入口 -->
					<view class="action-card action-card-signup" @click="handleSignUp">
						<view class="action-content">
							<view class="action-icon">
								<uni-icons type="plus" size="28" color="#fff"></uni-icons>
							</view>
							<view class="action-text">
								<text class="action-title">立即报名</text>
								<text class="action-desc">成为专业陪诊师</text>
							</view>
						</view>
						<!-- <image class="action-bg" src="../../static/images/index/listen.png" mode="aspectFill"></image> -->
					</view>

					<!-- 学习入口 -->
					<view class="action-card action-card-study" @click="goToStudyPage">
						<view class="action-content">
							<view class="action-icon">
								<uni-icons type="star" size="28" color="#fff"></uni-icons>
							</view>
							<view class="action-text">
								<text class="action-title">专业培训</text>
								<text class="action-desc">提升陪诊技能</text>
							</view>
						</view>
						<!-- <image class="action-bg" src="../../static/images/index/money.png" mode="aspectFill"></image> -->
					</view>
				</view>


				<view class="third">
					<text class="third-title">优秀陪诊师</text>
					<text class="third-text" @click="goToDoctorListPage">更多 ></text>
				</view>

				<view class="doctor-list">
					<view class="doctor-card" v-for="(doctor, index) in doctors" :key="index"
						@click="goToDoctorDetailPage(doctor)">
						<view class="doctor-avatar">
							<image :src="doctor.avatarUrl" mode="aspectFill"></image>
						</view>
						<view class="doctor-info">
							<view class="doctor-first">
								<view class="doctor-name">{{ doctor.name }}</view>
								<view class="doctor-gender">{{ doctor.gender }}</view>
							</view>
							<view class="doctor-location">{{doctor.address.cityName}}&nbsp;{{doctor.address.areaName}}
							</view>
							<view class="doctor-department">
								<uni-icons type="star-filled" size="30"></uni-icons>

								{{ doctor.moreInfo.rating }} &nbsp; | &nbsp;
								<uni-icons type="wallet-filled" size="30"></uni-icons>

								{{ doctor.moreInfo.order }}
							</view>
							<!--  <view class="specialty-container">
            <text class="doctor-specialty1" v-if="doctor.moreInfo.language">{{ doctor.moreInfo.language }}</text>
            <text class="doctor-specialty2" v-if="doctor.moreInfo.provide_transport">
              可接送
            </text>
          </view> -->
							<view class="doctor-tags">

								<text
									:class="['doctor-certification', doctor.is_certified  ? 'certified' : 'uncertified']">
									{{ doctor.is_certified ? '已认证' : '未认证' }}
								</text>
								<!-- 	<text :class="['doctor-availability', doctor.is_bookable? 'available' : 'unavailable']">
									{{ doctor.is_bookable ? '可预约' : '不可预约' }}
								</text> -->
							</view>
						</view>
						<view class="doctor-need">
							<view class="doctor-need-item">
								<view class="doctor-need-item-text">最近咨询</view>
								<image src="../../static/images/index/star.png" alt=""></image>
							</view>
						</view>
					</view>
				</view>
				<!-- </scroll-view> -->


				<!-- <view class="process-flow">
            <view class="flow-item" v-for="(item, index) in processSteps" :key="index">
                <view class="flow-content">
                    <view class="flow-circle">{{index + 1}}</view>
                    <view class="flow-text">
                        <text class="flow-title">{{item.title}}</text>
                        <text class="flow-desc">{{item.desc}}</text>
                    </view>
                </view>
                <view class="flow-arrow" v-if="index !== processSteps.length - 1">→</view>
            </view>
        </view> -->
			</view>
		</scroll-view>
	</view>
</template>

<script>
	const jwt = require("../../Utils/jwt")
	// pages/doctor/doctor.js
	export default {
		data() {
			return {
				location: "广州",
				// processSteps: [
				//     { title: '报名注册', desc: '网上报名并提交材料' },
				//     { title: '资格审核', desc: '等待审核通过' },
				//     { title: '培训学习', desc: '参加专业培训课程' },
				//     { title: '考试认证', desc: '参加资格考试' }
				// ],
				banners: [],
				doctors: [],
				pageTitle: "陪诊师学习",
				scrollTop: 0,
				navHeight: 0, // 存储导航栏高度
			};
		},
		// 在页面的生命周期中监听滚动
		onPageScroll(e) {
			// console.log('页面滚动:', e.scrollTop);
			this.scrollTop = e.scrollTop;
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad(options) {
			// 获取导航栏高度（需与 custom-nav 组件一致）
			const systemInfo = uni.getSystemInfoSync();
			this.navHeight = systemInfo.statusBarHeight + 44;
			this.getBanners();
			this.fetchDoctors();
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
		onUnload() {
			// uni.setNavigationBarColor({
			//   frontColor: "#ffffff",
			//   backgroundColor: "#54c69a",
			// });

		},
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
			// handleScroll(e) {
			// 	if (this.scrollTimer) clearTimeout(this.scrollTimer)
			// 	this.scrollTimer = setTimeout(() => {
			// 		this.scrollTop = e.detail.scrollTop
			// 	}, 16) // 约60fps
			// },

			async fetchDoctors() {
				try {
					let timeObj;
					if (this.fromOrder && this.timeObj !== undefined) {
						timeObj = this.timeObj;
					}
					console.log("timeObj", timeObj)
					const res = await uniCloud.callFunction({
						name: 'getEscorts',
						data: {
							timeObj,
							isFromOrder: this.fromOrder,
						} // 新增参数，标识是否来自order页面}
					});

					if (res.result.success) {
						this.doctors = res.result.data;
					} else {
						console.error('获取陪诊师数据失败:', res.result.error);
					}
				} catch (err) {
					console.error('调用云函数失败:', err);
				}
			},
			goToDoctorDetailPage(doctor) {

				const doctorData = encodeURIComponent(JSON.stringify(doctor));
				uni.navigateTo({
					url: `/subPackageC/pages/doctordetail/doctordetail?doctor=${doctorData}`
				});
			},
			goToDoctorListPage() {

				uni.navigateTo({
					url: `/subPackageC/pages/doctorlist/doctorlist`
				});
			},
			async getBanners() {
				try {
					uni.showLoading({
						title: "加载中",
					});

					const {
						result
					} = await uniCloud.callFunction({
						name: "getBanners",
					});

					if (result.code === 0) {
						this.banners = result.data;
					} else {
						throw new Error(result.msg);
					}
				} catch (e) {
					uni.showToast({
						title: "获取轮播图失败",
						icon: "none",
					});
				} finally {
					uni.hideLoading();
				}
			},
			async checkToken() {
				try {
					// 从缓存中获取token
					const token = uni.getStorageSync('token');
					console.log("token", token)
					jwt.verifyToken(token)
					console.log('Token有效');
					return true;
				} catch (error) {
					console.error('检查token出错:', error);
					this.loginAndCacheToken();
					return false;
				}
			},
			loginAndCacheToken() {
				uni.showModal({
					title: '提示',
					content: '使用完整服务前请先登录',
					showCancel: false,
					success: (res) => {
						if (res.confirm) {
							// 跳转到登录页面
							uni.reLaunch({
								url: '/subPackageA/pages/userInfoDetail/userInfoDetail'
							});
						}
					}
				});
			},
			async handleSignUp() {
				try {
					// 1. 先通过 checkToken 验证登录状态（复用现有登录检查逻辑）
					const isTokenValid = await this.checkToken();
					// 如果 token 无效，checkToken 已触发登录流程，直接返回
					if (!isTokenValid) return;
					// 2. token 有效时，获取用户信息（此时缓存中一定有 token，理论上也有 userInfo）
					const userInfo = uni.getStorageSync('userInfo');

					// 1. 查最近一次报名记录
					const signRes = await uniCloud.database()
						.collection('signup')
						.where({
							userId: userInfo.user_id
						})
						.orderBy('createdAt', 'desc')
						.limit(1)
						.get();

					const signRecord = signRes.result?.data?.[0];
					if (!signRecord) {
						// 没有任何报名记录 -> 去报名
						uni.navigateTo({
							url: `/subPackageC/pages/signup/signup?user_id=${userInfo.user_id}`
						});
						return;
					}

					// 2. 有报名记录，再查对应订单
					const orderRes = await uniCloud.database()
						.collection('orders')
						.where({
							order_no: signRecord.order_no
						})
						.limit(1)
						.get();

					const orderRecord = orderRes.result?.data?.[0];

					// 3. 判断是否能重新报名
					const canReSign = !orderRecord || ['refunded', 'cancelled'].includes(orderRecord.status);

					if (canReSign) {
						uni.navigateTo({
							url: `/subPackageC/pages/signup/signup?user_id=${userInfo.user_id}`
						});
						return;
					}

					// 4. 已报名且未退款/取消
					if (signRecord.auditStatus === 'approved' && orderRecord.status === 'paid') {
						uni.showModal({
							title: '提示',
							content: '您的报名已审核通过',
							showCancel: false
						});
					} else {
						uni.showModal({
							title: '提示',
							content: '已成功报名，请等待审核',
							showCancel: false
						});
					}
				} catch (e) {
					uni.showToast({
						title: '操作失败：' + (e.message || e),
						icon: 'none'
					});
				}
			},
			goToStudyPage() {
				let url =
					'https://xueqisecurity.chinaedu.net/mars/outer/wxrequest.do?serviceCode=alioth&clientType=2&customerCode=gdykdx&tenantCode=xq10679';
				if (!url.startsWith('http://') && !url.startsWith('https://')) {
					url = 'http://' + url;
				}
				uni.navigateTo({
					url: `/subPackageC/pages/web-view/web-view?url=${encodeURIComponent(url)}`
				});
			}

		},
	};
</script>
<style>
	/* pages/doctor/doctor.wxss */

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

	.first {
		margin-top: 10px;
		width: 100%;
		height: 250rpx;
		position: relative;
		/* background-color: #0a6dd9; */
		border-radius: 10px;
	}

	.swiper {
		width: 100%;
		height: 100%;

	}

	.swiper-image {
		width: 100%;
		height: 100%;
		border-radius: 20rpx;
	}

	.swiper-text {
		position: absolute;
		bottom: 30rpx;
		left: 30rpx;
		color: #ffffff;
		font-size: 32rpx;
		font-weight: bold;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
	}

	.second {
		display: flex;
		justify-content: space-between;
		margin: 30rpx 0;
		gap: 20rpx;
	}

	.action-card {
		flex: 1;
		height: 200rpx;
		border-radius: 16rpx;
		overflow: hidden;
		position: relative;
		display: flex;
		align-items: center;
		padding: 0 30rpx;
		box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.08);
	}

	.action-card-signup {
		background: linear-gradient(135deg, #fff0b9 0%, #ffe082 100%);
	}

	.action-card-study {
		background: linear-gradient(135deg, #bae7ff 0%, #87cefa 100%);
	}

	.action-content {
		z-index: 2;
		display: flex;
		align-items: center;
	}

	.action-icon {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.2);
		display: flex;
		justify-content: center;
		align-items: center;
		margin-right: 20rpx;
	}

	.action-text {
		display: flex;
		flex-direction: column;
	}

	.action-title {
		font-size: 36rpx;
		font-weight: bold;
		/* color: #666; */
		/*  color: #fff; */
		margin-bottom: 8rpx;
	}

	.action-desc {
		font-size: 24rpx;
		/* 	color: #666; */
		/* color: rgba(255,255,255,0.8); */
	}

	.action-bg {
		position: absolute;
		right: 0;
		bottom: 0;
		width: 180rpx;
		height: 180rpx;
		opacity: 0.8;
		z-index: 1;
	}

	.third {
		margin-top: 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}

	.third-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.third-text {
		font-size: 26rpx;
		color: #666;
	}

	.next {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 20rpx;
		background-color: #ffffff;
		border-radius: 20rpx;
		padding: 15rpx;
		width: 100%;
		box-sizing: border-box;
	}

	.next-image {
		width: 250rpx;
		height: 180rpx;
	}

	.next-text {
		display: flex;
		flex-direction: column;
		margin-left: 40rpx;
	}

	.next-text1 {
		font-size: 30rpx;
		font-weight: bold;
	}

	.next-text2 {
		font-size: 25rpx;
		color: #999;
	}

	.next-text3 {
		font-size: 25rpx;
		color: #999;
	}

	.next-text4 {
		font-size: 40rpx;
		color: #e50707;
	}

	.doctor-list {
		padding: 20 0rpx;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		margin-top: 20rpx;
	}

	.doctor-card {
		border-radius: 20rpx;
		padding: 20rpx;
		display: flex;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
		position: relative;
		margin-bottom: 15rpx;
		background-color: #ffffff;
	}

	.doctor-avatar {
		width: 100px;
		height: 100px;
		margin-right: 15rpx;
	}

	.doctor-avatar image {
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}

	.doctor-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.doctor-name {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 5rpx;
	}

	.doctor-location {
		font-size: 22rpx;
		color: #666;
		margin-bottom: 5rpx;
		background-color: #f0f0f0;
		border-radius: 10rpx;
		padding: 5rpx 10rpx;
		width: fit-content;
	}

	.value-icon {
		width: 20rpx;
		height: 20rpx;
		margin-right: 5rpx;
	}

	.order-icon {
		width: 20rpx;
		height: 20rpx;
		margin-left: 10rpx;
	}

	.doctor-department {
		font-size: 24rpx;
		color: #e74c3c;
		margin-bottom: 5rpx;
	}

	.specialty-container {
		display: flex;
		gap: 10rpx;
	}

	.doctor-specialty1 {
		font-size: 22rpx;
		color: #3498db;
		line-height: 1.4;
		border: 1px solid #3498db;
		border-radius: 15rpx;
		padding: 4rpx 10rpx;
	}

	.doctor-specialty2 {
		font-size: 22rpx;
		line-height: 1.4;
		border-radius: 15rpx;
		padding: 4rpx 10rpx;
		color: #2ecc71;
		border: 1px solid #2ecc71;
	}



	.doctor-tags {
		display: flex;
		gap: 10rpx;
		margin-top: 10rpx;
	}

	.doctor-first {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.doctor-availability,
	.doctor-certification {
		font-size: 22rpx;
		line-height: 1.4;
		border-radius: 15rpx;
		padding: 4rpx 10rpx;
	}

	.doctor-gender {
		font-size: 20rpx;
		padding: 4rpx 8rpx;
		color: #3498db;
		margin-left: 20rpx;
		/* background-color: #2ecc71; */
	}

	.doctor-availability.available {
		color: #2ecc71;
		border: 1px solid #2ecc71;
	}

	.doctor-availability.unavailable {
		/* background-color:#95a5a6; */
		color: #95a5a6;
		border: 1px solid #95a5a6;
	}

	.doctor-certification.certified {
		color: #3498db;
		border: 1px solid #3498db;

	}

	.doctor-certification.uncertified {
		color: #95a5a6;
		border: 1px solid #95a5a6;
	}

	.doctor-need {
		position: absolute;
		right: 10rpx;
		top: 10rpx;
	}

	.doctor-need-item {
		align-items: center;
		font-size: 24rpx;
		color: #666;
	}

	.doctor-need-item-text {
		margin-top: 5rpx;
		margin-right: 5rpx;
		color: #2980b9;
		background-color: #e6f7ff;
		border-radius: 10rpx;
		padding: 5rpx 10rpx;
	}

	.doctor-need-item image {
		width: 40rpx;
		height: 40rpx;
		margin-left: 50rpx;
		margin-top: 40rpx;
		background-color: #dcf4ff;
		padding: 20rpx;
		border-radius: 50%;
	}
</style>