<template>
	<view class="page">
		<custom-nav :title="pageTitle" :isHomePage="false" :scrollTop="scrollTop" ref="customNav" />
		<!-- 内容区域 -->
		<scroll-view scroll-y class="page-container" @scroll="handleScroll" :style="{ 
		      paddingTop: navHeight + 'px',
		      height: 'calc(100vh - ' + navHeight + 'px)'
		    }" :scroll-top="scrollTop" :show-scrollbar="false">
			<view class="search-box">
				<image class="search-icon" src="../../static/images/icons/search.png" ></image>
				<input type="text" v-model="searchKeyword" placeholder="搜索陪诊师的名字" placeholder-class="placeholder-style" @input="handleSearch" />
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
							<img class="value-icon" src="../../static/images/index/value.png" alt="" />
							{{ doctor.moreInfo.rating }} &nbsp; | &nbsp;
							<img class="order-icon" src="../../static/images/doctor/order.png" alt="" />
							{{ doctor.moreInfo.order }}
						</view>
						<view class="doctor-tags">
							<text :class="['doctor-certification', doctor.is_certified ? 'certified' : 'uncertified']">
								{{ doctor.is_certified ? '已认证' : '未认证' }}
							</text>
							<text :class="['doctor-availability', doctor.is_bookable ? 'available' : 'unavailable']">
								{{ doctor.is_bookable ? '可预约' : '不可预约' }}
							</text>
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
		</scroll-view>
	</view>
</template>

<script>
	// pages/health/health.js
	export default {
		data() {
			return {
				pageTitle: "陪诊师列表",
				scrollTop: 0,
				navHeight: 0, // 存储导航栏高度
				timeObj: '', //简化传入的时间参数
				searchKeyword: '', // 新增搜索关键词
				doctors: [],
				Location: {},
				fromOrder: false
			};
		},
		onLoad(options) {
			const systemInfo = uni.getSystemInfoSync();
			this.navHeight = systemInfo.statusBarHeight + 44;

			// 检查是否从order页面跳转过来
			if (options.from === 'order' && options.selectedTime) {
				this.fromOrder = true;
				console.log("传过来的时间参数", options.selectedTime)
				const selectedTime = options.selectedTime;
				this.timeObj = this.convertTimeToValue(selectedTime);
				console.log(this.timeObj);
				console.log("传过来的时间参数", selectedTime)
				console.log('从order页面跳转过来，点击医生卡片将返回order页面');
			}
			this.fetchDoctors();
		},
		methods: {
			//监视页面滚动情况
			handleScroll(e) {
				if (this.scrollTimer) clearTimeout(this.scrollTimer)
				this.scrollTimer = setTimeout(() => {
					this.scrollTop = e.detail.scrollTop
				}, 16) // 约60fps
			},
			convertTimeToValue(timeStr) {
				if (!timeStr) return null;

				// 解析字符串
				const parts = timeStr.split(' ');
				if (parts.length < 3) return null;

				const weekDay = parts[1]; // 获取周几
				const time = parts[2]; // 获取时间

				// 周几映射
				const weekMap = {
					'周一': 0,
					'周二': 1,
					'周三': 2,
					'周四': 3,
					'周五': 4,
					'周六': 5,
					'周日': 6
				};

				// 判断上午/下午
				const hour = parseInt(time.split(':')[0]);
				const isAfternoon = hour >= 12;

				// 计算值
				const weekValue = weekMap[weekDay] || 0;
				return isAfternoon ? weekValue + 7 : weekValue;
			},
			async fetchDoctors() {
				try {
					let timeObj;
					if (this.fromOrder && this.timeObj !== undefined) {
						timeObj = this.timeObj;
					}
					console.log("timeObj", timeObj)
					console.log("searchKeyword", this.searchKeyword)
					const res = await uniCloud.callFunction({
							name: 'getEscorts',
							data: {
								timeObj,
								isFromOrder: this.fromOrder,
								searchKeyword: this.searchKeyword
								}// 新增参数，标识是否来自order页面}
							});

						if (res.result.success) {
							this.doctors = res.result.data;
						} else {
							console.error('获取陪诊师数据失败:', res.result.error);
						}
					}
					catch (err) {
						console.error('调用云函数失败:', err);
					}
				},
				goToDoctorDetailPage(doctor) {
					if (this.fromOrder) {
						// 从order页面跳转过来，将医生信息存入缓存
						uni.setStorageSync('selectedDoctor', doctor);
						console.log('已将医生信息存入缓存:', doctor.name);

						// 返回order页面
						uni.navigateBack({});
					} else {
						uni.navigateTo({
							url: `/pages/doctordetail/doctordetail?doctor=${encodeURIComponent(JSON.stringify(doctor))}`
						});
					}
				},
				handleSearch() {
				  // 触发云函数重新获取数据
				  this.fetchDoctors();
				}
			}
		};
</script>

<style>
	.page {
		height: 100hv;
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

	.search-box {
		flex: 1;
		position: relative;
		height: 40px;
		background: rgb(255, 255, 255);
		border-radius: 16px;
		display: flex;
		align-items: center;
		padding: 0 px;
		margin: 10px 0px;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.search-box input {
		flex: 1;
		height: 100%;
		font-size: 14px;
		padding-right: 20px;
		margin-left: 20px;
	}

	.search-icon {
		width: 20px;
		height: 20px;
		margin-left: 20px;
	}

	.placeholder-style {
		color: #999;
		font-size: 14px;
		margin-left: 10px;
	}

	.doctor-list {
		padding-top: 20rpx;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.doctor-card {
		border-radius: 12rpx;
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

	.doctor-first {
		display: flex;
		flex-direction: row;
		align-items: center;
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

	.doctor-tags {
		display: flex;
		gap: 10rpx;
		margin-top: 10rpx;
	}

	/* 合并后的标签样式 */
	.doctor-availability,
	.doctor-certification,
	.doctor-gender {
		font-size: 22rpx;
		line-height: 1.4;
		border-radius: 15rpx;
		padding: 4rpx 10rpx;
	}

	.doctor-gender {
		color: #3498db;
		margin-left: 20rpx;
	}

	/* 状态样式 */
	.doctor-availability.available {
		color: #2ecc71;
		border: 1px solid #2ecc71;
	}

	.doctor-availability.unavailable {
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