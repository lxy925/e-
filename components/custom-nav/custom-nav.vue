<template>
	<view class="custom-nav" :style="{ height: navHeight + 'px' }">
		<view class="nav-content" :style="{ marginTop: statusBarHeight + 'px' }">
			<view class="nav-left">
				<template v-if="isHomePage">
					<view class="location" @click="chooseLocation">
						<view class="location-icon">
							<image src="/static/images/icons/position.png"></image>
						</view>
						<text class="location-text">{{ locationName }}</text>
					</view>
				</template>
				<template v-else>
					<view class="back-button" @click="goBack">
						<img src="../../static/images/icons/left-arrow.png" alt="左箭头"
							style="width: 50rpx;height: 50rpx;">
						<!-- <text name="" id="">fanhui</text> -->
					</view>
				</template>
			</view>
			<view class="nav-title">{{ title }}</view>
			<view class="nav-right"></view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'custom-nav',
		data() {
			return {
				statusBarHeight: 0,
				navHeight: 0,
				location: {},
				locationName:'广州',
				locationInfo: null // 存储用户选择的位置信息
			}
		},
		props: {
			title: {
				type: String,
				default: '陪诊师'
			},
			isHomePage: {
				type: Boolean,
				default: false
			}
		},
		created() {
			// 获取系统信息
			const systemInfo = uni.getSystemInfoSync()
			this.statusBarHeight = systemInfo.statusBarHeight
			this.navHeight = this.statusBarHeight + 44 // 44是导航栏的高度
			uni.getSetting({
				success: (res) => {
					if (!res.authSetting['scope.userLocation']) {
						// 如果没有权限，先获取权限
						uni.authorize({
							scope: 'scope.userLocation',
							success: () => {
								this.getLocationInfo();
							},
							fail: (err) => {
								console.error('授权失败：', err);
								// 用户拒绝授权
								uni.showToast({
									title: '需要位置权限才能获取您的位置信息',
									icon: 'none'
								});
							}
						});
					} else {
						// 已有权限，直接获取位置
						this.getLocationInfo();
					}
				}
			});
			// 获取位置信息
			// this.getLocationInfo()
			// this.getLocation()

		},
		methods: {
			chooseLocation() {
				if (!this.location) {
					uni.showToast({
						title: '正在获取定位...',
						icon: 'loading'
					});
					return;
				}
				uni.chooseLocation({
					
					success: (res) => {
						
						this.getCity(res.latitude, res.longitude)
						console.log("选择位置成功：", res);
					},
					fail: (err) => {
						console.error("选择位置失败：", err);
					}
				});
			},

			getLocationInfo() {
				const cachedLocation = uni.getStorageSync('cityName');
				if (cachedLocation) {
					this.locationName = cachedLocation;
					console.log('使用缓存的位置信息:', cachedLocation);
				} else {
					uni.getSetting({
						success: (res) => {
							console.log('获取新的位置信息');
							if (!res.authSetting['scope.userLocation']) {
								uni.authorize({
									scope: 'scope.userLocation',
									success: () => {
										this.getLocation()
									}
								})
							} else {
								this.getLocation()
							}
						}
					})
				}

			},
			getLocation() {
				uni.getLocation({
					type: 'gcj02',
					success: (res) => {
						this.location.latitude=res.latitude
						this.location.longitude= res.longitude
						console.log("获取到的位置数据",this.location)
						this.getCity(res.latitude, res.longitude)
					}
				})
			},
			getCity(latitude, longitude) {
				uni.request({
					url: 'https://restapi.amap.com/v3/geocode/regeo',
					data: {
						location: `${longitude},${latitude}`,
						key: '5781b7732ae9793dce03c709a9d0b0af',
						extensions: 'base'
					},
					success: (res) => {
						if (res.data.status === '1') {
							this.locationName=res.data.regeocode.addressComponent.city
							console.log("识别到的城市名字",res.data.regeocode.addressComponent)
							uni.setStorageSync('cityName', res.data.regeocode.addressComponent.city);
							uni.setStorageSync('provinceName', res.data.regeocode.addressComponent.province);
							uni.setStorageSync('areaName', res.data.regeocode.addressComponent.district);
						}
					}
				})
			},
			goBack() {
				uni.navigateBack()
			}
		}
	}
</script>

<style>
	.custom-nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		background-color: #0bd6c8;
		z-index: 999;
	}

	.nav-content {
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 15px;
	}

	.nav-left {
		display: flex;
		align-items: center;
	}

	.location {
		display: flex;
		align-items: center;
	}

	.location-icon image {
		width: 20px;
		height: 20px;
	}

	.location-text {
		color: #fff;
		font-size: 14px;
		margin-left: 5px;
	}

	.back-button {
		color: #fff;
		font-size: 16px;

		margin-right: 75rpx;
	}

	.nav-title {
		color: #fff;
		font-size: 16px;
		font-weight: bold;
		text-align: center;

	}

	.nav-right {
		width: 60px;
	}
</style>