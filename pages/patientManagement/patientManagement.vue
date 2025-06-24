<template>
	<view class="page">
		<custom-nav title="服务对象列表" :isHomePage="false"></custom-nav>
		<view class="header">
			<text class="title">就诊人管理</text>
		</view>
		<view class="content">
			<view v-if="patients.length > 0" class="patients-list">
				<view v-for="(patient, index) in patients" :key="index" class="patient-item"
					@click="selectPatient(patient)">
					<view class="patient-info">
						<image v-if="patient.photo" :src="patient.photo" mode="aspectFill" class="patient-photo" />
						<text class="patient-name">{{ patient.name }}</text>
					</view>
					<text class="patient-details-text">年龄: <text class="highlight">{{ patient.age }}</text></text>
					<text class="patient-details-text">性别: <text class="highlight">{{ patient.gender }}</text></text>
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
		<!-- 添加就诊人按钮 -->
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
				patients: [] // 用于存储陪诊人数据
			};
		},
		onLoad() {
			this.getOpenId(); // 页面加载时获取openid
		},
		methods: {
			goToAddPatient() {
				uni.navigateTo({
					url: '/pages/object/object'
				});
			},
			getOpenId() {
				uni.login({
					provider: 'weixin',
					success: res => {
						const js_code = res.code; // 存储登录代码
						uni.request({
							url: 'https://api.weixin.qq.com/sns/jscode2session', // 请求微信服务器
							method: 'GET',
							data: {
								appid: 'wxf8afb6dce14d487a', // 你的小程序的APPID
								secret: '06d3e5f2f7ed1bf8504fe90a1a1e04e5', // 你的小程序秘钥
								js_code: js_code, // 从 uni.login 获取的代码
								grant_type: 'authorization_code' // 固定值
							},
							success: (res) => {
								console.log('获取openid:', res.data);
								if (res.data.openid) {
									this.fetchPatients(res.data
										.openid); // 直接传递openid给fetchPatients
								} else {
									uni.showToast({
										title: '未获取到openid',
										icon: 'none'
									});
								}
							},
							fail: (err) => {
								console.error('请求失败：', err);
								uni.showToast({
									title: '请求失败，请重试',
									icon: 'none'
								});
							}
						});
					},
					fail: (err) => {
						console.error('登录失败：', err);
						uni.showToast({
							title: '登录失败，请重试',
							icon: 'none'
						});
					}
				});
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
				uni.navigateTo({
					url: '/pages/order/order'
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
	/* 底部添加就诊人按钮样式 */
	.add-patient-btn-container {
		position: fixed;
		bottom: 30rpx;
		left: 0;
		right: 0;
		padding: 0 50rpx;
		box-sizing: border-box;
		z-index: 100;
		/* 确保按钮在页面最上层 */
	}

	.add-patient-btn {
		background-color: #007aff;
		color: white;
		border-radius: 45rpx;
		height: 90rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
		/* 阴影效果 */
		border: none;
		/* 移除默认边框 */
	}

	.btn-text {
		font-size: 32rpx;
		font-weight: 500;
	}

	.page {
		margin-top: 150rpx;
		padding: 50rpx;
		background-color: #f5f5f5;
	}

	.header {
		background-color: #007aff;
		padding: 30rpx;
		border-radius: 8rpx;
		margin-bottom: 20rpx;
	}

	.title {
		color: white;
		font-size: 30rpx;
		font-weight: bold;
	}

	.content {
		background-color: white;
		border-radius: 8rpx;
		padding: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.patients-list {
		margin-top: 20rpx;
	}

	.patient-item {
		padding: 15rpx;
		margin-bottom: 15rpx;
		/* 添加下边距以创建间隔 */
		border: 1rpx solid #e0e0e0;
		/* 可选：添加边框以增强视觉效果 */
		border-radius: 8rpx;
		/* 可选：圆角 */
	}

	.patient-info {
		display: flex;
		align-items: center;
	}

	.patient-photo {
		width: 110rpx;
		height: 110rpx;
		border-radius: 80rpx;
		/* 圆形照片 */
		margin-right: 15rpx;
		/* 照片与文字之间的间距 */
	}

	.patient-name {
		font-size: 30rpx;
		font-weight: bold;
	}

	.patient-details {
		margin-top: 10rpx;
	}

	.patient-details-text,
	.patient-relationship,
	.patient-phone,
	.patient-medical-info {
		display: block;
		/* 确保每个标签占据一行 */
		color: #666;
		font-size: 25rpx;
		margin-top: 5rpx;
		/* 每行之间的间距 */
	}

	.highlight {
		font-weight: bold;
		/* 强调信息 */
		color: #007aff;
		/* 使用蓝色强调 */
	}

	.uploaded-images {
		margin-top: 10rpx;
	}

	.image-list {
		display: flex;
		flex-wrap: wrap;
	}

	.image-item {
		margin-right: 10rpx;
		margin-bottom: 10rpx;
	}

	.image {
		width: 80rpx;
		height: 80rpx;
		border-radius: 4rpx;
	}

	.divider {
		height: 1rpx;
		background-color: #e0e0e0;
		/* 分隔线颜色 */
		margin: 10rpx 0;
		/* 分隔线上下间距 */
	}

	.no-data {
		text-align: center;
		color: #999;
		font-size: 30rpx;
		margin-top: 20rpx;
	}
</style>