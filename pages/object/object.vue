<template>
	<view class="page">
		<custom-nav title="新增服务对象" :isHomePage="false"></custom-nav>
		<scroll-view class="content-container" scroll-y>
			<view class="object_info">
				<!-- 服务对象照片 -->
				<view class="photo-container">
					<text class="label">服务对象照片</text>
					<view class="photo-input">
						<button class="upload-photo-button" @tap="uploadPhoto">
							<image :src="photoUrl||'../../static/images/mine/avatar.png'" class="default-upload-photo"
								mode="aspectFill" @click="previewImage(photoUrl)" />
						</button>
					</view>
				</view>
				<view class="input_group">
					<text class="label">服务对象姓名</text>
					<input class="input" placeholder="请填写就诊人姓名" v-model="name" />
				</view>
				<view class="input_group">
					<text class="label">服务对象性别</text>
					<view class="gender-select-container">
						<button class="gender-select" :class="{ active: selectedGender === '男' }"
							@tap="selectGender('男')">男</button>
						<button class="gender-select" :class="{ active: selectedGender === '女' }"
							@tap="selectGender('女')">女</button>
					</view>
				</view>
				<view class="input_group">
					<text class="label">服务对象年龄</text>
					<input class="input" placeholder="请填写周岁年龄" v-model="age" />
				</view>
				<view class="input_group">
					<text class="label">服务对象手机</text>
					<input class="input" placeholder="如没有可填监护人手机号" v-model="phone" />
				</view>
				<view class="input_group">
					<text class="label">与就诊人关系</text>
					<input class="input" placeholder="请填写与就诊人关系" v-model="relationship" />
				</view>
				<view class="input_group">
					<text class="label">过往病史信息</text>
					<input class="input" id="patient_information" placeholder="请填写病例信息" v-model="medicalInfo" />
					<button class="upload-button" @tap="uploadImage">上传图片</button>
				</view>
				<view class="input_group">
					<text class="label">服务对象住址</text>
					<input class="input" placeholder="请添加服务对象住址" v-model="address" @click="chooseLocation"
						:readonly="!address" multiline auto-height />
				</view>
				<view class="uploaded-images">
					<text class="label">已上传图片</text>
					<view class="image-container" v-for="(image, index) in uploadedImages" :key="index">
						<image :src="image" class="uploaded-image" mode="aspectFill" @tap="viewImage(image)" />
						<button class="delete-image-button" @tap="deleteImage(index)">×</button>
					</view>
				</view>
				<view class="button-container">
					<button class="object_confirm" @tap="submitData" :disabled="isSubmitting">
						<text>{{ isSubmitting ? '提交中...' : '确认保存' }}</text>
					</button>
				</view>
			</view>
			<!-- 自定义底部弹出框 -->
			<view v-if="showPicker" class="picker-overlay" @tap="hideGenderPicker">
				<view class="picker-content" @tap="stopPropagation">
					<view class="picker-option" @tap="selectGender" data-value="男">男</view>
					<view class="picker-option" @tap="selectGender" data-value="女">女</view>
					<button class="close-picker" @tap="hideGenderPicker">关闭</button>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		name: 'OrderComponent',
		data() {
			return {
				name: '', // 服务对象姓名
				isSubmitting: false,
				selectedGender: '',
				age: '', // 服务对象年龄
				phone: '', // 服务对象手机
				relationship: '', // 与就诊人关系
				showPicker: false,
				medicalInfo: '', // 新增病例信息
				uploadedImages: [], // 存储已上传的图片
				address: '', // 用于存储服务对象的详细地址
				js_code: '',
				userInfo: uni.getStorageSync('userInfo') || {
					user_id: '',
					session_key: ''
				},
				isLoggedIn: uni.getStorageSync('isLoggedIn') || false,
				photoUrl: '' // 用于存储可访问的服务对象照片的 URL
			};
		},
		methods: {
			showGenderPicker() {
				this.showPicker = true;
			},
			hideGenderPicker() {
				this.showPicker = false;
			},
			selectGender(gender) {
				this.selectedGender = gender;
			},
			stopPropagation(event) {
				event.stopPropagation();
			},
			submitData() {
				// 检查是否正在提交
				if (this.isSubmitting) {
					uni.showToast({
						title: '正在提交中，请稍候...',
						icon: 'none',
						duration: 2000
					});
					return;
				}

				// 开始提交，设置状态
				this.isSubmitting = true;
				uni.showLoading({
					title: '提交中...',
					mask: true
				});

				// 表单验证
				const validation = this.validateForm();
				if (!validation.valid) {
					this.isSubmitting = false;
					uni.hideLoading();
					uni.showToast({
						title: validation.message,
						icon: 'none',
						duration: 3000
					});
					return;
				}

				// 检查病史信息
				this.checkMedicalInfo().then(shouldSubmit => {
					if (shouldSubmit) {
						this.submitDataWithImages();
					} else {
						this.isSubmitting = false;
						uni.hideLoading();
					}
				}).catch(err => {
					this.isSubmitting = false;
					uni.hideLoading();
					console.error('检查病史信息出错:', err);
				});
			},
			validateForm() {
				// 必填字段检查
				const requiredFields = [{
						field: this.name,
						name: '姓名'
					},
					{
						field: this.selectedGender,
						name: '性别'
					},
					{
						field: this.age,
						name: '年龄'
					},
					{
						field: this.phone,
						name: '手机号'
					},
					{
						field: this.relationship,
						name: '关系'
					},
					{
						field: this.address,
						name: '住址'
					}
				];

				for (let item of requiredFields) {
					if (!item.field || item.field.toString().trim() === '') {
						return {
							valid: false,
							message: `请填写${item.name}`
						};
					}
				}

				// 年龄验证
				if (isNaN(Number(this.age)) || Number(this.age) <= 0 || Number(this.age) > 120) {
					return {
						valid: false,
						message: '请输入有效的年龄(1-120岁)'
					};
				}

				// 手机号验证
				const phoneReg = /^1[3-9]\d{9}$/;
				if (!phoneReg.test(this.phone)) {
					return {
						valid: false,
						message: '请输入正确的手机号码'
					};
				}

				return {
					valid: true
				};
			},
			checkMedicalInfo() {
				return new Promise((resolve) => {
					// 两种情况都未填写
					if (!this.medicalInfo && this.uploadedImages.length === 0) {
						uni.showModal({
							title: '提示',
							content: '您尚未填写任何病史信息，是否确认提交？',
							confirmText: '确认提交',
							cancelText: '返回填写',
							success: (res) => {
								resolve(res.confirm);
							}
						});
					}
					// 仅缺少文字描述
					else if (!this.medicalInfo) {
						uni.showModal({
							title: '提示',
							content: '您尚未填写病史文字描述，是否确认提交？',
							confirmText: '确认提交',
							cancelText: '返回填写',
							success: (res) => {
								resolve(res.confirm);
							}
						});
					}
					// 仅缺少图片
					else if (this.uploadedImages.length === 0) {
						uni.showModal({
							title: '提示',
							content: '您尚未上传任何病史图片，是否确认提交？',
							confirmText: '确认提交',
							cancelText: '返回填写',
							success: (res) => {
								resolve(res.confirm);
							}
						});
					}
					// 信息完整
					else {
						resolve(true);
					}
				});
			},
			resetForm() {
			    this.name = '';
			    this.selectedGender = '';
			    this.age = '';
			    this.phone = '';
			    this.relationship = '';
			    this.medicalInfo = '';
			    this.uploadedImages = [];
			    this.address = '';
			    this.photoUrl = '';
			  },
			submitDataWithImages() {
				const randomId = Math.random().toString(36).substr(2, 9);
				const dataToSubmit = {
					server_id: randomId,
					name: this.name.trim(),
					gender: this.selectedGender,
					age: parseInt(this.age),
					phone: this.phone.trim(),
					relationship: this.relationship.trim(),
					medicalInfo: this.medicalInfo ? this.medicalInfo.trim() : '',
					uploadedImages: this.uploadedImages,
					userid: this.userInfo.user_id,
					photo: this.photoUrl,
					address: this.address.trim(),
					submitTime: new Date().toISOString()
				};

				uniCloud.callFunction({
					name: 'server_object',
					data: dataToSubmit,
				}).then(res => {
					if (res.result.code === 0) {
						uni.showToast({
							title: '提交成功',
							icon: 'success',
							duration: 1500
						});

						// 提交成功后重置表单
						setTimeout(() => {
							this.resetForm();
							  uni.navigateBack({
							          delta: 1  // 返回上一页
							        });
						}, 1500);
					} else {
						throw new Error(res.result.message || '提交失败');
					}
				}).catch(err => {
					console.error('提交出错:', err);
					uni.showToast({
						title: `提交失败: ${err.message}`,
						icon: 'none',
						duration: 3000
					});
				}).finally(() => {
					this.isSubmitting = false;
					uni.hideLoading();
				});
			},
			uploadImage() {
				uni.chooseImage({
					count: 1, // 选择一张图片
					success: (res) => {
						const tempFilePaths = res.tempFilePaths;
						uniCloud.uploadFile({
							cloudPath: `medical_images/${Date.now()}.png`, // 云存储路径
							filePath: tempFilePaths[0], // 选择的图片路径
							success: (uploadRes) => {
								console.log('上传结果：', uploadRes);
								if (uploadRes.fileID) {
									this.uploadedImages.push(uploadRes.fileID); // 保存永久路径
									uni.showToast({
										title: '图片上传成功',
										icon: 'success'
									});
								} else {
									console.error('上传失败，未返回 fileID:', uploadRes);
									uni.showToast({
										title: '图片上传失败',
										icon: 'none'
									});
								}
							},
							fail: (err) => {
								console.error('上传错误：', err);
								uni.showToast({
									title: '图片上传失败',
									icon: 'none'
								});
							}
						});
					},
					fail: (err) => {
						console.error('选择图片失败：', err);
						uni.showToast({
							title: '选择图片失败',
							icon: 'none'
						});
					}
				});
			},
			viewImage(image) {
				uni.previewImage({
					current: image, // 当前显示图片的http链接
					urls: this.uploadedImages // 需要预览的图片http链接列表
				});
			},
			login() {
				if (this.isLoggedIn) {
					uni.showToast({
						title: '已登录',
						icon: 'none'
					});
					return;
				}

				uni.login({
					provider: 'weixin',
					success: res => {
						console.log("结果", res)
						this.js_code = res.code
						uni.request({
							url: 'https://api.weixin.qq.com/sns/jscode2session', // 请求微信服务器
							method: 'GET',
							data: {
								appid: 'wxf8afb6dce14d487a', //你的小程序的APPID
								secret: '06d3e5f2f7ed1bf8504fe90a1a1e04e5', //你的小程序秘钥secret,  
								js_code: this.js_code, //uni.login 登录成功后的code
								grant_type: 'authorization_code' //此处为固定值
							},
							success: (res) => {
								console.log('获取信息', res.data);
								if (res.data.openid) {
									this.userInfo.user_id = res.data.openid;
									this.userInfo.session_key = res.data.session_key;
									uni.setStorageSync('userInfo', this.userInfo);
									uni.setStorageSync('isLoggedIn', true);
									this.isLoggedIn = true;
									uni.showToast({
										title: '登录成功',
										icon: 'success'
									});
								} else {
									uni.showToast({
										title: '登录失败: ' + (res.data.errmsg || '未知错误'),
										icon: 'none'
									});
								}
							},
						});
					}
				});
			},
			uploadPhoto() {
				uni.chooseImage({
					count: 1,
					success: (res) => {
						const tempFilePath = res.tempFilePaths[0];
						this.uploadToServer(tempFilePath); // 调用上传方法
					},
					fail: (err) => {
						console.error('选择图片失败:', err);
					}
				});
			},
			uploadToServer(tempFilePath) {
				// 上传临时文件到云存储
				uniCloud.uploadFile({
					cloudPath: `photos/${Date.now()}.png`, // 云存储路径
					filePath: tempFilePath,
					success: (uploadRes) => {
						if (uploadRes.fileID) {
							this.photoUrl = uploadRes.fileID; // 保存永久路径
							uni.showToast({
								title: '照片上传成功',
								icon: 'success'
							});
						} else {
							uni.showToast({
								title: '照片上传失败',
								icon: 'none'
							});
						}
					},
					fail: (err) => {
						console.error('上传失败:', err);
						uni.showToast({
							title: '上传失败，请重试',
							icon: 'none'
						});
					}
				});
			},
			previewImage(imageUrl) {
				// 预览图片
				uni.previewImage({
					current: imageUrl, // 当前显示图片的http链接
					urls: [imageUrl] // 需要预览的图片http链接列表
				});
			},
			deleteImage(index) {
				// 确认是否删除
				uni.showModal({
					title: '确认操作',
					content: '确定要删除这张图片吗？',
					success: (res) => {
						if (res.confirm) {
							// 从数组中删除对应的图片
							this.uploadedImages.splice(index, 1);
							uni.showToast({
								title: '图片已删除',
								icon: 'success'
							});
						}
					}
				});
			},
			// 调用微信选择地址
			// 修改后的chooseLocation方法
			chooseLocation() {
				wx.chooseLocation({
					success: (res) => {
						console.log('选择地址成功：', res);
						// 直接使用选择的详细地址
						this.address = res.address;
					},
					fail: (err) => {
						console.error('选择地址失败：', err);
						uni.showToast({
							title: '选择地址失败',
							icon: 'none'
						});
					}
				});
			}
		},
		onLoad() {
			if (!this.isLoggedIn) {
				this.login();
			}
		}
	};
</script>


<style scoped>
	/* pages/object.wxss */

	.content-container {
		flex: 1;
		margin-top: 180rpx;
		/* 与导航栏高度一致 */
		height: calc(100vh - 180rpx);
		overflow: hidden;
	}

	.page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
	}

	.custom-nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 9999;
	}

	.object_info {
		padding: 0;
		/* 确保没有内边距 */
		display: flex;
		flex-direction: column;
		background-color: #ffffff;
		border-radius: 15rpx;
		margin: 0 auto;
		margin-top: 30rpx;
		/* 仅保留顶部间距 */
		width: 93%;
		/* 允许宽度自适应 */
		height: calc(100vh - 160rpx);
	}

	.add_object {
		background-color: #ffffff;
		width: 90%;
		margin: 15rpx;
		padding-top: 15rpx;
	}

	.button-container {
		display: flex;
		/* 使用 Flexbox 布局 */
		justify-content: center;
		/* 水平居中 */
	}

	.object_confirm {
		flex: 0 0 600rpx;
		height: 100rpx;
		font-size: 35rpx;
		font-weight: 500;
		background-color: #00aaff;
		color: #ffffff;
		margin: 20rpx;
		line-height: 100rpx;
	}

	.add_text {
		font-size: 35rpx;
		font-weight: 500;
	}

	.input_group {
		padding: 30rpx;
		display: flex;
		flex-direction: column;
		/* 使用列布局 */
		align-items: flex-start;
		/* 对齐方式 */
		border-bottom: 1px solid #ccc;
	}

	.label {
		font-size: 35rpx;
		color: #000;
		margin-bottom: 10rpx;
		/* 标签与输入框的间距 */
	}

	.input {
		font-size: 35rpx;
		color: #666;
		width: 100%;
		/* 宽度占满父容器 */
		min-height: 100rpx;
		/* 最小高度 */
		max-height: 200rpx;
		/* 最大高度 */
		overflow: hidden;
		/* 隐藏超出部分 */
		border: none;
		/* 去掉边框 */
		resize: none;
		/* 禁止用户调整大小 */
		padding: 10rpx;
		/* 内边距 */
		box-sizing: border-box;
		/* 确保宽度和高度包含内边距 */
		background-color: #f9f9f9;
		/* 背景颜色 */
		border-radius: 10rpx;
		/* 圆角 */
	}

	.input::placeholder {
		text-align: right;
		/* placeholder 文本右对齐 */
		color: #B3B3B3;
		/* placeholder 颜色 */
	}

	.gender-select-container {
		width: 100%;
		display: flex;
		justify-content: space-between;
	}

	.gender-select {
		line-height: 1;
		flex: 1;
		height: 35rpx;
		margin: 0 10rpx;
		font-size: 35rpx;
		line-height: 70rpx;
		color: #000;
		background-color: #f9f9f9;
		border: 1px solid #ccc;
		border-radius: 10rpx;
		text-align: center;
	}

	.gender-select.active {
		background-color: #00aaff;
		color: #fff;
	}

	#patient_information {
		height: 250rpx;
	}

	.custom-radio {
		display: flex;
		align-items: center;
		margin: 0;
		/* 去掉外边距 */
		padding: 0;
		/* 去掉内边距 */
	}

	.radio-input {
		display: none;
		/* 隐藏默认的 radio 按钮 */
	}

	.radio-label {
		font-size: 35rpx;
		color: #000000;
		padding: 20rpx 30rpx;
		cursor: pointer;
		/* 鼠标悬停时显示为手型 */
		border: 1px solid rgba(22, 150, 22, 0.301);
		border-radius: 10rpx;
	}

	.add_object_container {
		display: flex;
		flex-direction: column;
		/* 垂直排列 */
		align-items: center;
		/* 水平居中 */
	}

	.divider {
		width: 100%;
		/* 下划线宽度 */
		height: 2rpx;
		/* 下划线高度 */
		background-color: #b3b3b36e;
		/* 下划线颜色 */
		margin-top: 10rpx;
		/* 按钮与下划线之间的间距 */
	}

	/* 在相应的 CSS 文件中添加 */
	.picker-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		/* 半透明背景 */
		display: flex;
		justify-content: center;
		align-items: flex-end;
		/* 从底部升起 */
	}

	.picker-content {
		background-color: white;
		padding: 20px;
		border-radius: 10px;
		width: 100%;
		text-align: center;
	}

	.picker-option {
		margin: 15rpx 0;
		padding: 20rpx 0;
		font-size: 18px;
		cursor: pointer;
		text-align: center;
		/* 文本居中 */
		border: none;
		/* 去掉边框 */
	}

	.close-picker {
		margin-top: 20px;
	}

	.gender-select {
		font-size: 35rpx;
		font-weight: 500;
		height: 80rpx;
	}

	.upload-button {
		margin-left: 10rpx;
		font-size: 30rpx;
		background-color: #00aaff;
		color: white;
		padding: 10rpx 20rpx;
		border-radius: 5rpx;
	}

	.uploaded-images {
		margin-top: 20rpx;
	}

	.image-container {
		position: relative;
		/* 相对定位 */
		display: inline-block;
		margin: 10rpx;
	}

	.uploaded-image {
		width: 100rpx;
		/* 设置图片宽度 */
		height: 100rpx;
		/* 设置图片高度 */
		border-radius: 5rpx;
		/* 圆角 */
	}

	.delete-image-button {
		position: absolute;
		/* 绝对定位 */
		top: -10rpx;
		/* 调整位置 */
		right: -20rpx;
		/* 调整位置 */
		width: 30rpx;
		/* 按钮宽度 */
		height: 30rpx;
		/* 按钮高度 */
		background-color: #c4d398;
		/* 红色背景 */
		color: white;
		/* 白色文字 */
		font-size: 25rpx;
		/* 字体大小 */
		border-radius: 50%;
		/* 圆形按钮 */
		border: none;
		/* 去掉边框 */
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.photo-container {
		display: flex;
		justify-content: center;
		/* 水平居中 */
		margin: 30rpx 0rpx 0 40rpx;
		/* 上下间距 */
		width: 100%;
		/* 图片宽度 */
		height: 200rpx;
		/* 图片高度 */
	}

	.photo-container .label {
		line-height: 150rpx;
	}

	.upload-photo-button {
		width: auto;
		height: auto;
		/* 图片高度 */
		padding: 0;
		/* 去掉内边距 */
		background-color: transparent;
		/* 透明背景 */
		border: none;
		/* 去掉边框 */
		margin: 0;
		margin-right: 50rpx;
	}

	.default-upload-photo {
		width: 150rpx;
		/* 图片宽度 */
		height: 150rpx;
		/* 图片高度 */
		border-radius: 50%;
		/* 圆形图片 */
		border: 2px solid #ccc;
		/* 添加边框 */
	}

	.photo-input {
		flex: 1;
		/* 输入框占据剩余空间 */
		padding: 10rpx;
		text-align: right;
		display: flex;
		justify-content: flex-end;
		/* 让按钮靠右对齐 */
		white-space: nowrap;
		/* 不允许换行 */
	}

	@import './static/iconfont/iconfont.wxss';
	/* 引入图标字体样式 */
</style>