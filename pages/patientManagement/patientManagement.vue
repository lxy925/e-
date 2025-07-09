<template>
	<view class="page-container">
		<custom-nav title="服务对象列表" :isHomePage="false"></custom-nav>
		<scroll-view class="content-container" scroll-y :style="{height: scrollHeight + 'px'}">
			<view class="content-wrapper">
				<view v-if="patients.length > 0" class="patients-list">
					<view v-for="(patient, index) in patients" :key="index" class="patient-item"
						@click="selectPatient(patient)">
						<view class="patient-info">
							<image v-if="patient.photo" :src="patient.photo" mode="aspectFill" class="patient-photo" />
							<text class="patient-name">{{ patient.name }}</text>
						</view>
						<text class="patient-details-text">年龄: <text class="highlight">{{ patient.age }}</text></text>
						<text class="patient-details-text">性别: <text
								class="highlight">{{ patient.gender }}</text></text>
						<text class="patient-relationship">关系: <text
								class="highlight">{{ patient.relationship }}</text></text>
						<text class="patient-phone">电话: <text class="highlight">{{ patient.phone }}</text></text>
						<text class="patient-medical-info">医疗信息: <text
								class="highlight">{{ patient.medicalInfo }}</text></text>
						<view v-if="patient.uploadedImages.length > 0" class="uploaded-images">
							<text>上传的图片:</text>
							<view class="image-list">
								<view v-for="(image, imgIndex) in patient.uploadedImages" :key="imgIndex"
									class="image-item">
									<image :src="image" mode="aspectFill" class="image"
										@click="previewImage(patient.uploadedImages, imgIndex)" />
								</view>
							</view>
						</view>
						<view class="divider"></view>
					</view>
				</view>
				<view v-else class="no-data">
					<text>没有找到就诊人信息</text>
				</view>
			</view>
		</scroll-view>

		<!-- 底部按钮移到scroll-view外部 -->
		<view class="add-patient-btn-container">
			<button class="add-patient-btn" @click="goToAddPatient">
				<text class="btn-text">添加就诊人</text>
			</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				patients: [], // 用于存储陪诊人数据
				scrollHeight: 0
			};
		},
		onShow() {
			this.getOpenId(); // 刷新数据的方法
		},
		onLoad() {
			this.calculateScrollHeight();
			this.getOpenId(); // 页面加载时获取openid
		},
		methods: {
			calculateScrollHeight() {
				const query = uni.createSelectorQuery().in(this);
				query.select('.header').boundingClientRect(header => {
					const systemInfo = uni.getSystemInfoSync();
					const navHeight = 180; // 导航栏高度(rpx)
					const btnHeight = 120; // 按钮区域高度(rpx)

					// 转换为px计算
					const windowPx = systemInfo.windowHeight;
					const rpxRatio = systemInfo.windowWidth / 750;

					this.scrollHeight = windowPx - (navHeight * rpxRatio) - (btnHeight * rpxRatio);
				}).exec();
			},
			goToAddPatient() {
				uni.navigateTo({
					url: '/pages/object/object'
				});
			},
			getOpenId() {
				const user_id = uni.getStorageSync("userInfo").user_id;
				this.fetchPatients(user_id); // 直接传递openid给fetchPatients
			},
			fetchPatients(openid) {
				// 调用云函数查询陪诊人数据
				uniCloud.callFunction({
					name: 'getPatients', // 云函数名称
					data: {
						userid: openid
					}, // 传递的参数
					success: (res) => {
						console.log('云函数返回结果：', res);
						if (res.result.code === 0) {
							this.patients = res.result.data || []; // 更新patients数据
						} else {
							console.error('查询陪诊人数据失败:', res.result.msg);
							uni.showToast({
								title: res.result.msg || '数据查询失败',
								icon: 'none'
							});
						}
					},
					fail: (err) => {
						console.error('云函数调用失败：', err);
						uni.showToast({
							title: '数据查询失败',
							icon: 'none'
						});
					}
				});
			},
			selectPatient(patient) {
				// 将整个 patient 对象存储到本地
				uni.setStorageSync('selectedPatient', patient);
				// 跳转到 order 页面
				uni.navigateBack({
					
				});
			},
			previewImage(images, currentIndex) {
				uni.previewImage({
					current: images[currentIndex], // 当前显示图片的http链接
					urls: images // 需要预览的图片http链接列表
				});
			}
		}
	};
</script>

<style>
	.page-container {
		height: 100vh;
		width: 100vw;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	/* 隐藏滚动条但保留滚动功能 */
	.content-container ::-webkit-scrollbar {
		display: none;
		/* Chrome/Safari */
		width: 0 !important;
		/* Firefox */
		height: 0 !important;
		/* Firefox */
		-webkit-appearance: none;
		/* iOS */
	}

	.content-container {
		-ms-overflow-style: none;
		/* IE/Edge */
		scrollbar-width: none;
		/* Firefox */
		/* 其他原有样式保持不变 */
		margin-top: 160rpx;
		flex: 1;
		width: 100%;
		padding: 20rpx 30rpx;
		box-sizing: border-box;
	}

	.content-wrapper {
		min-height: 100%;
		padding-bottom: 140rpx;
		/* 为底部按钮留出空间 */
	}

	/* 头部样式优化 */
	.header {
		background: linear-gradient(135deg, #007aff, #00aaff);
		padding: 25rpx 30rpx;
		color: white;
		border-radius: 0 0 20rpx 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.2);
		margin-bottom: 20rpx;
	}

	.title {
		font-size: 36rpx;
		font-weight: 600;
		text-align: center;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
	}

	/* 患者卡片样式优化 */
	.patient-item {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
		transition: all 0.3s ease;
	}

	.patient-item:active {
		transform: scale(0.98);
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}

	.patient-info {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.patient-photo {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		margin-right: 25rpx;
		border: 2rpx solid #e0e0e0;
		object-fit: cover;
	}

	.patient-name {
		font-size: 34rpx;
		font-weight: 600;
		color: #333;
	}

	/* 详细信息样式 */
	.patient-details-text,
	.patient-relationship,
	.patient-phone,
	.patient-medical-info {
		display: block;
		color: #666;
		font-size: 28rpx;
		margin-top: 12rpx;
		line-height: 1.6;
	}

	.highlight {
		font-weight: 500;
		color: #007aff;
	}

	/* 图片区域样式 */
	.uploaded-images {
		margin-top: 25rpx;
		padding-top: 20rpx;
		border-top: 1rpx dashed #e0e0e0;
	}

	.uploaded-images text {
		display: block;
		color: #888;
		font-size: 26rpx;
		margin-bottom: 15rpx;
	}

	.image-list {
		display: flex;
		flex-wrap: wrap;
		gap: 15rpx;
	}

	.image {
		width: 120rpx;
		height: 120rpx;
		border-radius: 8rpx;
		border: 1rpx solid #f0f0f0;
	}

	/* 无数据样式 */
	.no-data {
		text-align: center;
		padding: 100rpx 0;
		color: #999;
		font-size: 30rpx;
	}

	.no-data image {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 30rpx;
		opacity: 0.6;
	}

	/* 底部按钮样式优化 */
	.add-patient-btn-container {
		position: fixed;
		bottom: 40rpx;
		left: 0;
		right: 0;
		padding: 0 50rpx;
		z-index: 100;
	}

	.add-patient-btn {
		background: linear-gradient(135deg, #007aff, #00aaff);
		color: white;
		border-radius: 50rpx;
		height: 100rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 6rpx 20rpx rgba(0, 122, 255, 0.3);
		border: none;
		font-weight: 500;
		transition: all 0.3s ease;
	}

	.add-patient-btn:active {
		transform: scale(0.96);
		opacity: 0.9;
	}

	.btn-text {
		font-size: 34rpx;
		font-weight: 500;
	}

	/* 分隔线优化 */
	.divider {
		height: 1rpx;
		background: linear-gradient(to right, transparent, #e0e0e0, transparent);
		margin: 25rpx 0;
	}
</style>