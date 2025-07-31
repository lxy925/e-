<template>
	<view class="page">
		<custom-nav :title="pageTitle" :isHomePage="false" :scrollTop="scrollTop" ref="customNav" />
		<!-- 内容区域 -->
		<scroll-view scroll-y class="page-container" @scroll="handleScroll" :style="{ 
		      paddingTop: navHeight + 'px',
		      height: 'calc(100vh - ' + navHeight + 'px)'
		    }" :scroll-top="scrollTop" :show-scrollbar="false">
			<view class="search-box">
				<image class="search-icon" src="../../static/images/icons/search.png"></image>
				<input type="text" v-model="searchKeyword" placeholder="搜索陪诊师的名字" placeholder-class="placeholder-style"
					@input="handleSearch" />
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
			<view class="loading-footer" v-if="showLoading">
				<view class="loading" v-if="!noMore">
					<!-- 这里使用你的加载组件，没有可以用文字代替 -->
					<text class="loading-text">加载中...</text>
				</view>
				<view class="no-more" v-if="noMore">
					<text>没有更多数据了</text>
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
				fromOrder: false,
				startTime: null,
				endTime: null,
				page: 1, // 新增：当前页码，默认1
				pageSize: 10, // 新增：每页条数，默认10
				showLoading: false, // 新增：是否显示加载状态
				noMore: false, // 新增：是否没有更多数据
				isLoading: false // 新增：防止重复请求的锁
			};
		},
		onLoad(options) {
			const systemInfo = uni.getSystemInfoSync();
			this.navHeight = systemInfo.statusBarHeight + 44;

			// 接收所有参数（检查是否从order页面跳转过来)
			if (options.from === 'order') {
				this.fromOrder = true;

				// 接收时间参数
				if (options.timeObj) {
					this.timeObj = parseInt(options.timeObj);
				}

				if (options.startTime && options.endTime) {
					this.startTime = decodeURIComponent(options.startTime); // 解码
					this.endTime = decodeURIComponent(options.endTime); // 解码
					console.log("传过来的时间参数", this.startTime, this.endTime);
				} else {
					// 打印缺少的参数便于调试
					console.log("缺少时间参数", {
						hasStartTime: !!options.startTime,
						hasEndTime: !!options.endTime
					});
				}
				console.log('从order页面跳转过来，点击医生卡片将返回order页面');
			}

			this.fetchDoctors();
		},
		methods: {
			//监视页面滚动情况
			handleScroll(e) {
				if (this.scrollTimer) clearTimeout(this.scrollTimer)
				this.scrollTimer = setTimeout(() => {
					this.scrollTop = e.detail.scrollTop;
					// 新增：滚动到底部时加载更多（距离底部200rpx时触发）
					const {
						scrollHeight,
						scrollTop,
						clientHeight
					} = e.detail;
					if (scrollTop + clientHeight >= scrollHeight - 200 && !this.isLoading && !this.noMore) {
						this.loadMore();
					}
				}, 16) // 约60fps
			},
			loadMore() {
				// 防止重复加载或没有更多数据时调用
				if (this.isLoading || this.noMore) return;
				this.page++; // 页码+1
				this.fetchDoctors(); // 重新请求下一页数据
			},
			async fetchDoctors() {
				this.isLoading = true;
				this.showLoading = true;
				this.noMore = false;

				// 新增：打印当前请求的页码和参数
				console.log(`===== 开始请求第 ${this.page} 页数据 =====`);
				console.log('请求参数:', {
					isFromOrder: this.fromOrder,
					startTime: this.startTime,
					endTime: this.endTime,
					timeObj: this.timeObj,
					searchKeyword: this.searchKeyword,
					page: this.page,
					pageSize: this.pageSize
				});

				try {
					const res = await uniCloud.callFunction({
						name: 'getEscorts',
						data: {
							isFromOrder: this.fromOrder,
							startTime: this.startTime,
							endTime: this.endTime,
							timeObj: this.timeObj,
							searchKeyword: this.searchKeyword,
							page: this.page,
							pageSize: this.pageSize
						}
					});

					// 新增：打印云函数返回结果
					console.log(`第 ${this.page} 页请求结果:`, res.result);

					if (res.result.success) {
						// 打印当前页数据量
						console.log(`第 ${this.page} 页返回数据量:`, res.result.data.length);

						if (this.page === 1) {
							this.doctors = res.result.data;
							console.log('首次加载完成，总数据量:', this.doctors.length);
						} else {
							this.doctors = [...this.doctors, ...res.result.data];
							console.log('加载更多完成，累计数据量:', this.doctors.length);
						}

						if (res.result.data.length < this.pageSize) {
							this.noMore = true;
							console.log('已加载全部数据，没有更多了');
						}
					} else {
						console.error('获取数据失败:', res.result.error);
					}
				} catch (err) {
					console.error('请求云函数出错:', err);
				} finally {
					this.isLoading = false;
					this.showLoading = true;
					console.log(`===== 第 ${this.page} 页请求结束 =====\n`);
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
				this.page = 1;
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

	/* 新增：加载提示样式 */
	.loading-footer {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 30rpx 0;
		font-size: 26rpx;
		color: #999;
	}

	.loading {
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	.loading-text {
		color: #666;
	}

	.no-more {
		color: #999;
	}
</style>