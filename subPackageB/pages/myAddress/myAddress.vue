<template>
	<view class="root-container">
		<custom-nav :title="title" :isHomePage="false" :scrollTop="scrollTop" ref="customNav" />
		<scroll-view scroll-y class="page-container" @scroll="handleScroll" :style="{ 
		  paddingTop: navHeight + 'px',
		  height: 'calc(100vh - ' + navHeight + 'px)'
		}" :scroll-top="scrollTop" :show-scrollbar="false">
			<view class="container">
				<!-- 地址列表 -->
				<view class="address-list" v-if="addresses.length > 0">
					<view class="address-item" v-for="(address, index) in addresses" :key="index"
						:class="{ 'default-address': address.isDefault }">

						<view class="icon-container">
							<!-- 编辑按钮 -->
							<uni-icons class="icon-btn edit-btn" type="gear" size="28" color="#666"
								@click.stop="editAddress(index)" />
							<!-- 删除按钮 -->
							<uni-icons class="icon-btn delete-btn" type="trash" size="24" color="#FF4C4C"
								@click.stop="confirmDeleteAddress(index, address._id)" />
						</view>

						<!-- 地址内容 -->
						<view class="address-content" @click="selectAddress(address)">
							<view class="address-district">{{ address.district || '未选择地区' }}</view>
							<view class="address-detail">{{ address.detail || '未填写详细地址' }}</view>
							<view class="addressNameAndNumber">{{ address.name || '未填写姓名' }}
								{{ address.phone || '未填写电话' }}
							</view>
						</view>
					</view>
				</view>
				<!-- 无地址提示 -->
				<view class="no-address" v-else>
					<view class="image-item" v-if="displayImage">
						<image :src="displayImage.image" mode="aspectFit" />
					</view>
					暂时还没有任何地址
				</view>
				<!-- 添加地址按钮 -->
				<button class="add-address-btn" @click="showAddAddressModal">新增地址</button>
			</view>

			<!-- 弹出层 -->

			<view class="modal" v-if="showModal" :class="{ show: showModal }" @click="hideAddAddressModal">
				<view class="modal-content" @click.stop>
					<scroll-view class="scroll-content" scroll-y>
						<!-- 地图 -->
						<map id="map" :longitude="longitude" :latitude="latitude" :markers="markers" scale="16"></map>

						<!-- 搜索框 -->
						<view class="search-box">
							<button @click="chooseLocation">
								<img src="../../../static/images/address/search.png" class="search-icon"
									style="width: 50rpx;height: 50rpx; justify-content: center;" />搜索地址，更快填写
							</button>
						</view>

						<view class="modal-body">
							<view class="input-group">
								<picker mode="region" @change="handleRegionChange">
									<view class="street">{{ location.province }} {{ location.city }}
										{{ location.district }}
									</view>
								</picker>
							</view>

							<view class="input-group">
								<text class="label">详细地址：</text>
								<input class="input-field" type="text" v-model="newAddress.detail" placeholder="请输入详细地址"
									@input="validateDetail" @blur="validateDetail" />
								<text v-if="errors.detail" class="error-text">{{ errors.detail }}</text>
							</view>

							<view class="input-group">
								<text class="label">姓名：</text>
								<!-- 修改所有input绑定方式，添加.value -->
								<input class="input-field" type="text" :value="newAddress.name"
									@input="newAddress.name = $event.detail.value" @blur="validateName"
									placeholder="请输入姓名" />
								<text v-if="errors.name" class="error-text">{{ errors.name }}</text>
							</view>

							<view class="input-group">
								<text class="label">手机号：</text>
								<input class="input-field" type="text" v-model="newAddress.phone" placeholder="请输入手机号"
									@input="validatePhone" @blur="validatePhone" />
								<text v-if="errors.phone" class="error-text">{{ errors.phone }}</text>
							</view>

							<view class="input-group">
								<view class="default-address">
									<text>设为默认地址</text>
									<switch v-model="isDefaultAddress" color="#4066b3" />
								</view>
							</view>
						</view>
					</scroll-view>

					<view class="modal-footer">
						<button @click="saveAddress">{{ currentEditIndex !== null ? '保存修改' : '保存地址' }}</button>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: "我的地址",
				scrollTop: 0,
				navHeight: 0, // 存储导航栏高度
				currentEditIndex: null,
				isManualLocation: false,
				allImages: [],
				displayImage: null,
				location: {
					province: '',
					city: '',
					district: ''
				},
				longitude: 113.324520,
				latitude: 23.099994,
				markers: [{
					id: 1,
					latitude: 23.099994,
					longitude: 113.324520,
					name: '我的位置',
					width: 30,
					height: 30,
					styleId: 'marker_style_1'
				}],
				addresses: [],
				showModal: false,
				newAddress: {
					name: '',
					phone: '',
					detail: ''
				},
				isDefaultAddress: false,
				errors: {
					name: '',
					phone: '',
					detail: ''
				},
				isLocationLoaded: false
			};
		},
		computed: {
			isFormValid() {
				return this.newAddress.name.trim() &&
					/^1[3-9]\d{9}$/.test(this.newAddress.phone) &&
					this.newAddress.detail.trim() &&
					this.location.province &&
					this.location.city &&
					this.location.district &&
					!this.errors.name &&
					!this.errors.phone &&
					!this.errors.detail;
			},
			validAddresses() {
				return this.addresses.map(addr => ({
					...addr,
					isValid: addr._id && addr.name && addr.detail && addr.district
				}));
			}
		},
		onLoad() {
			console.log('[页面] onLoad钩子执行');
			this.fetchUserAddresses();
			const systemInfo = uni.getSystemInfoSync();
			this.navHeight = systemInfo.statusBarHeight + 44;
		},
		onShow() {
			console.log('[页面] onShow钩子执行');
			this.getLocationInfo();
		},
		methods: {
			//监视页面滚动情况
			handleScroll(e) {
				if (this.scrollTimer) clearTimeout(this.scrollTimer)
				this.scrollTimer = setTimeout(() => {
					this.scrollTop = e.detail.scrollTop
				}, 16) // 约60fps
			},
			// 获取用户地址列表
			async fetchUserAddresses() {
				try {
					uni.showLoading({
						title: '加载地址中...'
					});
					const {
						code
					} = await this.getLoginCode();
					if (!code) throw new Error('获取登录凭证失败');

					const res = await uniCloud.callFunction({
						name: 'getUserAddresses',
						data: {
							js_code: code
						}
					});

					if (res.result.code === 200) {
						this.addresses = res.result.data || [];
						// 验证数据完整性
						this.addresses = this.addresses.filter(addr =>
							addr._id && addr.name && addr.phone && addr.detail && addr.district
						);
						this.$forceUpdate();
						console.log('有效地址数量:', this.addresses.length);
					} else {
						throw new Error(res.result.message || '获取地址失败');
					}
				} catch (error) {
					console.error('获取地址列表异常:', error);
					uni.showToast({
						title: error.message || '获取地址失败，请稍后重试',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},

			// 获取登录凭证
			getLoginCode() {
				return new Promise((resolve, reject) => {
					uni.login({
						provider: 'weixin',
						success: (res) => resolve({
							code: res.code
						}),
						fail: (err) => reject(new Error('登录失败: ' + err.message))
					});
				});
			},

			// 确认删除地址（显示提示框）
			confirmDeleteAddress(index, addressId) {
				uni.showModal({
					title: '确认删除',
					content: '确定要删除这个地址吗？',
					confirmText: '删除',
					cancelText: '取消',
					success: async (res) => {
						if (res.confirm) {
							// 用户确认删除，执行删除逻辑
							await this.deleteAddress(index, addressId);
						}
					}
				});
			},

			// 执行删除地址的逻辑
			async deleteAddress(index, addressId) {
				try {
					uni.showLoading({
						title: '删除中...'
					});

					// 获取登录凭证
					const {
						code
					} = await this.getLoginCode();
					if (!code) throw new Error('获取登录凭证失败');

					// 调用云函数删除地址
					const res = await uniCloud.callFunction({
						name: 'deleteUserAddress', // 假设云函数名为 deleteUserAddress
						data: {
							addressId: addressId, // 要删除的地址ID
							js_code: code
						}
					});

					if (res.result.code === 200) {
						// 删除成功，更新本地列表
						this.addresses.splice(index, 1); // 从数组中移除该地址
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						});
					} else {
						throw new Error(res.result.message || '删除地址失败');
					}
				} catch (error) {
					console.error('删除地址失败:', error);
					uni.showToast({
						title: error.message || '删除失败，请稍后重试',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},

			// 编辑地址
			editAddress(index) {
				this.showModal = true;
				this.currentEditIndex = index;
				const address = this.addresses[index];

				this.newAddress = {
					name: address.name || '',
					phone: address.phone || '',
					detail: address.detail.replace(`${address.district} `, '') || ''
				};

				const [province, city, district] = address.district.split(' ');
				this.location = {
					province: province || '',
					city: city || '',
					district: district || ''
				};
				this.isDefaultAddress = address.isDefault || false;
			},

			// 显示添加地址模态框
			showAddAddressModal() {
				this.showModal = true;
				this.currentEditIndex = null;
				this.newAddress = {
					name: '',
					phone: '',
					detail: ''
				};
				this.location = {
					province: '',
					city: '',
					district: ''
				};
				this.isDefaultAddress = false;
				this.errors = {
					name: '',
					phone: '',
					detail: ''
				};
				this.getLocationInfo();
			},

			hideAddAddressModal() {
				this.showModal = false;
			},

			// 表单验证方法
			validateName() {
				this.newAddress.name = this.newAddress.name.trim();
				if (!this.newAddress.name) {
					this.errors.name = '姓名不能为空';
					return false;
				}
				this.errors.name = '';
				return true;
			},

			validatePhone() {
				const phoneReg = /^1[3-9]\d{9}$/;
				if (!phoneReg.test(this.newAddress.phone)) {
					this.errors.phone = '请输入正确的手机号';
					return false;
				}
				this.errors.phone = '';
				return true;
			},

			validateDetail() {
				this.newAddress.detail = this.newAddress.detail.trim();
				if (!this.newAddress.detail) {
					this.errors.detail = '详细地址不能为空';
					return false;
				}
				this.errors.detail = '';
				return true;
			},

			// 保存地址
			async saveAddress() {
				console.log('保存前数据检查:', JSON.stringify({
					name: this.newAddress.name,
					phone: this.newAddress.phone,
					detail: this.newAddress.detail
				}));
				// 强制验证所有字段
				const isNameValid = this.validateName();
				const isPhoneValid = this.validatePhone();
				const isDetailValid = this.validateDetail();

				if (!isNameValid || !isPhoneValid || !isDetailValid) {
					uni.showToast({
						title: '请完善所有必填信息',
						icon: 'none'
					});
					return;
				}

				if (!this.location.province || !this.location.city || !this.location.district) {
					uni.showToast({
						title: '请选择完整的地区信息',
						icon: 'none'
					});
					return;
				}

				try {
					// 1. 构建完整地区字符串
					const fullDistrict = `${this.location.province} ${this.location.city} ${this.location.district}`;

					// 2. 从详细地址中彻底移除所有地区信息
					const cleanDetail = this.newAddress.detail.trim()
						.replace(new RegExp(`^${this.location.province}\\s*`, 'i'), '') // 移除开头的省
						.replace(new RegExp(`^${this.location.city}\\s*`, 'i'), '') // 移除开头的市
						.replace(new RegExp(`^${this.location.district}\\s*`, 'i'), '') // 移除开头的区
						.replace(new RegExp(`\\s*${this.location.province}$`, 'i'), '') // 移除结尾的省
						.replace(new RegExp(`\\s*${this.location.city}$`, 'i'), '') // 移除结尾的市
						.replace(new RegExp(`\\s*${this.location.district}$`, 'i'), '') // 移除结尾的区
						.replace(/\s+/g, ' ') // 合并多余空格
						.trim();
					const addressData = {
						name: this.newAddress.name,
						phone: this.newAddress.phone,
						detail: cleanDetail || '未填写详细地址', // 确保不为空
						district: fullDistrict,
						latitude: this.latitude,
						longitude: this.longitude,
						isDefault: this.isDefaultAddress,
						updateTime: new Date()
					};
					console.log('处理后地址数据:', addressData);
					let res;
					if (this.currentEditIndex !== null) {
						addressData._id = this.addresses[this.currentEditIndex]._id;
						const {
							code
						} = await this.getLoginCode();
						if (!code) throw new Error('获取登录凭证失败');

						res = await uniCloud.callFunction({
							name: 'updateUserAddress',
							data: {
								address: addressData,
								js_code: code,
							}
						});
					} else {
						addressData.createTime = new Date();
						const {
							code
						} = await this.getLoginCode();
						if (!code) throw new Error('获取登录凭证失败');

						res = await uniCloud.callFunction({
							name: 'addUserAddress',
							data: {
								address: addressData,
								js_code: code,
							}
						});
					}

					if (res.result.code === 200) {
						uni.showToast({
							title: '地址保存成功',
							icon: 'success'
						});
						await this.fetchUserAddresses();
						this.showModal = false;
					} else {
						throw new Error(res.result.message || '地址保存失败');
					}
				} catch (error) {
					console.error('保存地址错误:', error);
					uni.showToast({
						title: error.message || '保存地址失败，请稍后重试',
						icon: 'none'
					});
				}
			},

			// 地区选择变化
			handleRegionChange(e) {
				const [province, city, district] = e.detail.value;
				this.location.province = province;
				this.location.city = city;
				this.location.district = district;
			},

			// 获取位置信息
			getLocationInfo() {
				if (this.isLocationLoaded || this.isManualLocation) return;

				uni.getSetting({
					success: (res) => {
						if (!res.authSetting['scope.userLocation']) {
							uni.authorize({
								scope: 'scope.userLocation',
								success: () => this.getLocation(),
								fail: () => this.showLocationSettingModal()
							});
						} else {
							this.getLocation();
						}
					}
				});
			},

			// 显示位置设置提示
			showLocationSettingModal() {
				uni.showModal({
					title: '提示',
					content: '需要获取您的位置信息，请开启定位权限',
					success: (res) => {
						if (res.confirm) {
							uni.openSetting();
						}
					}
				});
			},

			// 获取当前位置
			getLocation() {
				uni.getLocation({
					type: 'gcj02',
					isHighAccuracy: true,
					success: (res) => {
						this.isLocationLoaded = true;
						this.longitude = res.longitude;
						this.latitude = res.latitude;
						this.getCity(res.latitude, res.longitude);
					},
					fail: (err) => {
						console.error('获取位置失败：', err);
						uni.showToast({
							title: '获取位置失败，请检查设备定位功能',
							icon: 'none'
						});
					}
				});
			},

			// 从坐标获取城市信息
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
							const address = res.data.regeocode.addressComponent;
							this.location = {
								province: address.province,
								city: address.city || address.province,
								district: address.district
							};
							this.markers = [{
								id: 1,
								latitude,
								longitude,
								name: '我的位置',
								width: 30,
								height: 30
							}];
						}
					},
					fail: (err) => {
						console.error('获取城市信息失败：', err);
					}
				});
			},

			// 选择位置
			chooseLocation() {
				uni.chooseLocation({
					success: (res) => {
						this.longitude = res.longitude;
						this.latitude = res.latitude;
						this.isManualLocation = true;

						this.getCityFromCoordinates(res.latitude, res.longitude)
							.then(region => {
								this.location = region;
								this.newAddress.detail = res.address
									.replace(new RegExp(region.province, 'ig'), '')
									.replace(new RegExp(region.city, 'ig'), '')
									.replace(new RegExp(region.district, 'ig'), '')
									.replace(/\s+/g, ' ')
									.trim();
							})
							.catch(() => {
								this.parseAddressString(res.address);
							});

						this.markers = [{
							id: 1,
							latitude: res.latitude,
							longitude: res.longitude,
							name: res.name,
							width: 30,
							height: 30
						}];
					},
					fail: (err) => {
						console.error('选择位置失败：', err);
						uni.showToast({
							title: '选择位置失败',
							icon: 'none'
						});
					}
				});
			},

			// 从坐标获取城市信息
			getCityFromCoordinates(lat, lng) {
				return new Promise((resolve, reject) => {
					uni.request({
						url: 'https://restapi.amap.com/v3/geocode/regeo',
						data: {
							location: `${lng},${lat}`,
							key: '5781b7732ae9793dce03c709a9d0b0af',
							extensions: 'base'
						},
						success: (res) => {
							if (res.data.status === '1') {
								const address = res.data.regeocode.addressComponent;
								resolve({
									province: address.province,
									city: address.city || address.province,
									district: address.district
								});
							} else {
								reject(new Error(res.data.info));
							}
						},
						fail: (err) => reject(err)
					});
				});
			},

			// 解析地址字符串
			parseAddressString(address) {
				const regex = /^(.*?省|.*?市)?(.*?市|.*?州|.*?区|.*?县)?(.*?区|.*?市|.*?县|.*?镇)?/;
				const matches = address.match(regex);

				this.location.province = matches[1] || '';
				this.location.city = matches[2] || this.location.province;
				this.location.district = matches[3] || '';

				// 彻底移除所有地区信息
				this.newAddress.detail = address
					.replace(new RegExp(this.location.province, 'ig'), '')
					.replace(new RegExp(this.location.city, 'ig'), '')
					.replace(new RegExp(this.location.district, 'ig'), '')
					.replace(/\s+/g, ' ')
					.trim();
			},

			// 选择地址
			selectAddress(address) {
				console.log("传递给selectAddress的address:", address);

				if (!address) {
					console.error("地址对象为空！当前addresses列表:", this.addresses);
					uni.showToast({
						title: '地址选择失败，请重试',
						icon: 'none'
					});
					return;
				}
				// 确保地址对象包含必要字段
				if (!address.name || !address.detail) {
					console.error("地址对象缺少必要字段:", address);
					uni.showToast({
						title: '地址信息不完整，请重试',
						icon: 'none'
					});
					return;
				}
				uni.setStorageSync('selectedAddress', address);
				console.log("成功存储地址:", address.detail);
				uni.navigateBack();
			}
		}
	};
</script>
<style scoped>
	.root-container {
		height: 100vh;
	}

	.page-container {
		min-height: 100vh;
		position: relative;


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
		width: 100%;
		padding: 0 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		/* margin-top: 200rpx; */
		box-sizing: border-box;
	}

	.address-list {
		width: 100%;
		margin-bottom: 40rpx;
	}

	.address-content {
		width: calc(100% - 100rpx);
		/* 留出编辑按钮空间 */
		min-height: 120rpx;
		/* 根据内容调整高度 */
	}

	.address-item {
		position: relative;
		background-color: white;
		border-radius: 8px;
		width: 100%;
		padding: 34rpx 40rpx;
		box-sizing: border-box;
		margin: 20rpx 0;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
		border-left: 4rpx solid #4066b3;
		transition: transform 0.2s;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.address-item.default-address {
		border-left-color: #ff6a00;
	}

	.address-item.default-address::after {
		content: '默认地址';
		position: absolute;
		top: 20rpx;
		right: 100rpx;
		background-color: #ff6a00;
		color: white;
		padding: 4rpx 12rpx;
		border-radius: 4rpx;
		font-size: 24rpx;
	}


	/* 图标容器：固定在右侧，水平排列 */
	.icon-container {
		position: absolute;
		right: 30rpx;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		gap: 25rpx;
		z-index: 10;
	}

	/* 统一图标按钮样式 */
	.icon-btn {
		width: 50rpx;
		height: 50rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}


	.address-district,
	.address-detail,
	.addressNameAndNumber {
		width: 100%;
	}

	.address-district {
		color: #808692;
		font-size: 26rpx;
		margin-bottom: 10rpx;
	}

	.address-detail {
		font-size: 34rpx;
		margin-bottom: 10rpx;
		color: #333;
		word-wrap: break-word;
		word-break: normal;
		max-width: calc(100% - 100rpx);
	}

	.addressNameAndNumber {
		font-size: 28rpx;
		color: #666;
	}


	.no-address {
		margin-top: 300rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 400rpx;
		color: #000;
		font-size: 28rpx;
	}

	.add-address-btn {
		position: fixed;
		bottom: 100rpx;
		width: 80%;
		background-color: #c0ddfc;
		color: #4066b3;
		padding: 10rpx 20rpx;
		border-radius: 40rpx;
		box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
		font-size: 32rpx;
		border: none;
		outline: none;
	}

	.modal {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.6);
		display: flex;
		justify-content: center;
		align-items: flex-end;
		transition: opacity 0.3s ease;
		opacity: 0;
		visibility: hidden;
		z-index: 1000;
	}

	.modal.show {
		opacity: 1;
		visibility: visible;
	}

	.modal-content {
		width: 100%;
		height: 80%;
		display: flex;
		flex-direction: column;
		background-color: #fff;
		border-radius: 18rpx 18rpx 0 0;
		overflow: hidden;
	}

	.scroll-content {
		flex: 1;
		overflow-y: auto;
		padding-bottom: 100rpx;
	}

	.modal-body {
		padding: 20rpx 30rpx;
	}

	.modal-footer {
		position: sticky;
		bottom: 0;
		background: white;
		padding: 20rpx 30rpx;
		box-shadow: 0 -4rpx 10rpx rgba(0, 0, 0, 0.05);
		z-index: 10;
	}

	.modal-footer button {
		width: 100%;
		background: #4066b3;
		color: white;
		border-radius: 40rpx;
		height: 100rpx;
		line-height: 100rpx;
		font-size: 32rpx;
		border: none;
		outline: none;
	}

	#map {
		width: 100%;
		height: 300px;
	}

	.search-box {
		margin: 15rpx;
		width: calc(100% - 30rpx);
		border-radius: 18rpx;
		background-color: #f2f6f9;
	}

	.search-box button {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		width: 100%;
		padding: 20rpx;
		border: none;
		background-color: transparent;
		color: #808792;
		font-size: 28rpx;
	}

	.search-icon {
		margin-right: 20rpx;
	}

	.input-group {
		margin-bottom: 25rpx;
	}

	.label {
		display: block;
		margin-bottom: 5rpx;
		font-size: 28rpx;
		color: #808792;
	}

	.input-field {
		padding: 5px;
		font-size: 30rpx;
		border: none;
		border-bottom: 1rpx solid #eee;
		width: 100%;
	}

	.error-text {
		color: #ff4d4f;
		font-size: 24rpx;
		margin-top: 5rpx;
		display: block;
	}

	.default-address {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 0;
	}

	.default-address text {
		font-size: 28rpx;
		color: #333;
	}

	.street {
		padding: 15rpx 0;
		border-bottom: 1rpx solid #eee;
		font-size: 30rpx;
	}
</style>