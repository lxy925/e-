<template>
	<view class="page">
		<custom-nav title="陪诊服务选择" :isHomePage="false"></custom-nav>
		<view class="user-info-detail">
			<button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="getAvatar">
				<image :src="avatar||'../../../static/images/mine/avatar.png'" mode="widthFix" />
			</button>
			<view class="tip">{{show?'欢迎使用':'当前未登录，请登录！'}}</view>
		</view>

		<view class="user-info-detail">
			<view class="user-info-item">
				<image src="../../static/images/mine/user.png" alt=""></image>
				<view class="user-info-item-title">昵称</view>
				<input type="nickname" class="username" @blur="getName" :placeholder="nickName || '设置你的昵称'" />
			</view>
			<view class="user-info-item">
				<image src="../../static/images/mine/name.png" alt=""></image>

				<view class="user-info-item-title">真实姓名</view>
				<input type="text" class="username" placeholder="设置你的真实姓名" v-model="realName" />
			</view>
			<view class="user-info-item">
				<image src="../../static/images/mine/name.png" alt=""></image>

				<view class="user-info-item-title">身份证号码</view>
				<input type="text" class="username" placeholder="输入你的身份证号码" v-model="idCard" />
			</view>
			<view class="user-info-item">
				<image src="../../static/images/mine/phone.png" alt=""></image>
				<view class="user-info-item-title">手机号</view>
				<input type="text" class="username" placeholder="请输入你的手机号" v-model="phoneNumber" />
				<button class="get-code" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">获取</button>
			</view>

		</view>
		<view class="submit">
			<!-- <image src="../../static/images/mine/submit.png" alt=""></image> -->
			<button class="submit-btn" @click="submitUserInfo">登录</button>
		</view>
	</view>
</template>


<script>
	import WXBizDataCrypt from '../../../Utils/WXBizDataCrypt.js'
	//import jwt from '../../uniCloud/cloudfunctions/commom/jwt.js'
	export default {
		data() {
			return {
				token: uni.getStorageSync('token'),
				nickName: '',
				realName: '',
				idCard: '',
				phoneNumber: '',
				avatar: '',
				show: false,
				code: '', // 微信登录code
				fromPage: ''
			};
		}
		/**

		 * 生命周期函数--监听页面加载
		 */
		,
		onLoad(options) {
			// 获取来源页面参数
			this.fromPage = options.from || 'mine';
			this.userInfo = uni.getStorageSync('userInfoForm');

		},
		/**
		 * 生命周期函数--监听页面初次渲染完成
		 */
		onReady() {},
		/**
		 * 生命周期函数--监听页面显示
		 */
		onShow() {
			// this.go();
		},
		/**
		 * 生命周期函数--监听页面隐藏
		 */
		onHide() {},
		/**
		 * 生命周期函数--监听页面卸载
		 */
		onUnload() {},
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
			// 获取头像
			getAvatar(e) {
				console.log(e);
				const avatar = e.detail.avatarUrl;
				this.show = true;

				// 生成唯一的文件名
				const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;

				// 指定云存储路径
				const cloudPath = `avatar/${fileName}`; // 例如：avatarList/1741500000000_abc123.jpg
				// 上传图片到云存储
				uniCloud.uploadFile({

					filePath: avatar, // 本地临时文件路径
					cloudPath, // 云存储路径
					cloudPathAsRealPath: true,
					onUploadProgress: (progressEvent) => {
						// 上传进度回调
						const percentCompleted = Math.round(
							(progressEvent.loaded * 100) / progressEvent.total
						);
						console.log(`上传进度：${percentCompleted}%`);
					},
					success: (uploadRes) => {
						// 上传成功回调
						console.log("上传成功：", uploadRes);

						// 获取云存储的文件 ID
						const fileID = uploadRes.fileID;

						// 更新前端数据
						this.avatar = fileID; // 将 fileID 赋值给 this.formData[listName]
						uni.showToast({
							title: '上传成功',
							icon: 'success',
							duration: 2000,
						});
					},
					fail: (err) => {
						// 上传失败回调
						console.error("上传失败：", err);
						uni.showToast({
							title: '上传失败',
							icon: 'none',
							duration: 2000,
						});
					},
					complete: () => {
						// 上传完成回调
						console.log("上传完成");
					},
				});
			},
			getName(e) {
				this.nickName = e.detail.value;
			},
			//获取电话号码
			async getPhoneNumber(e) {
				if (e.detail.errMsg !== 'getPhoneNumber:ok') return;

				try {
					// 1. 先获取code（await确保完成）
					const code = await new Promise((resolve, reject) => {
						uni.login({
							provider: 'weixin',
							success: (res) => resolve(res.code),
							fail: reject
						});
					});
					console.log("获取的code:", code);

					// 2. 再用code调用云函数
					const {
						result
					} = await uniCloud.callFunction({
						name: 'user-login',
						data: {
							code: code, // 使用已获取的code
							encryptedData: e.detail.encryptedData,
							iv: e.detail.iv
						}
					});

					// 3. 处理结果
					if (result.code == 200) {
						// console.log(result)
						this.phoneNumber = result.data;
						// console.log( this.phoneNumber)
					} else {
						throw new Error('未获取到手机号');
					}
				} catch (err) {
					console.error('流程错误:', err);
					uni.showToast({
						title: '获取手机号失败',
						icon: 'none'
					});
				}
			},





			async submitUserInfo() {
				// 保存用户信息到本地存储

				const errors = this.validateFormData()
				if (errors.length > 0) {
					// 如果有错误，显示错误提示
					errors.forEach(error => {
						uni.showToast({
							title: error,
							icon: 'none',
							duration: 2000,
						});
					});
				}


				// 1. 先获取code（await确保完成）
				const code = await new Promise((resolve, reject) => {
					uni.login({
						provider: 'weixin',
						success: (res) => resolve(res.code),
						fail: reject
					});
				});
				const {
					result
				} = await uniCloud.callFunction({
					name: 'user-login',
					data: {
						code: code,
						nickName: this.nickName,
						realName: this.realName,
						idCard: this.idCard,
						phoneNumber: this.phoneNumber,
						avatar: this.avatar
					}
				});
				console.log(result)
				if (result.code === 0) {
					uni.showToast({
						title: '登录成功',
						icon: 'success',
						duration: 2000,
					});


					//为初始化用户数据做准备
					uni.setStorageSync('userInfo', result.data.userInfo);
					// 缓存token
					uni.setStorageSync('token', result.data.token);
					console.log(uni.getStorageSync('userInfo'))
					uni.setStorageSync('userInfoForm', result.data.userInfo);
					uni.reLaunch({
						url: '/pages/index/index'
					});
				} else {
					uni.showToast({
						title: result.message || '登录失败',
						icon: 'none',
						duration: 2000,
					});
				}

				// 返回上一页
				uni.navigateTo({
					url: '/pages/index/index'
				});
			},
			validateFormData() {
				const errors = [];

				if (!this.avatar) {
					errors.push('头像不能为空');
					return errors;
				}
				if (!this.nickName) {
					errors.push('昵称不能为空');
					return errors;
				}
				if (!this.realName) {
					errors.push('姓名不能为空');
					return errors;
				}


				if (!this.phoneNumber || !/^\d{11}$/.test(this.phoneNumber)) {
					errors.push('手机号码格式不正确');
					return errors;
				}

				//    if (!this.formData.qualificationNumber) {
				//      errors.push('资格证号不能为空');
				// return errors;
				//    }
				if (!this.idCard || !/^\d{18}$/.test(this.idCard)) {
					errors.push('身份证号码格式不正确');
					return errors;
				}
				// if (!this.formData.idCardFrontList) {
				//       errors.push('身份证正面不能为空');
				// return errors;
				//     }
				//     if (!this.formData.idCardBackList) {
				//       errors.push('身份证反面不能为空');
				//     }
				return errors;
			},
		}
	};
</script>

<style>
	.page {
		min-height: 100vh;
		/* background: linear-gradient(to bottom, #15cbbc, #fffcf9); */
		padding: 50rpx;
		padding-top: 100rpx;

		margin-top: -1px;
		/* 消除可能的间隙 */
	}

	.user-info-detail {
		width: 100%;
		height: 100%;
		margin-top: 80rpx;
	}

	.user-info-detail image {
		width: 150rpx;
		height: 150rpx;
		border-radius: 50%;
		overflow: hidden;
		margin-top: 50rpx;
	}

	.avatar-btn {
		padding: 0;
		width: auto !important;
		background: none;
		border: none;
		line-height: 1;
	}

	.avatar-btn::after {
		border: none;
	}

	.tip {
		font-size: 30rpx;
		/* color: #fff; */
		text-align: center;
		margin-top: 20rpx;
	}

	.user-info-item {
		display: flex;
		align-items: center;
		padding: 25rpx;
		font-size: 30rpx;
		font-weight: inherit;
		background-color: rgba(255, 255, 255, 1);
		border-radius: 10rpx;
		border: 1rpx solid #5352528a;
	}

	.user-info-item image {
		width: 45rpx;
		height: 45rpx;
		margin: 0 0 0 0;
	}


	.user-info-item-title {
		width: 150rpx;
		text-align: left;
		margin-left: 20rpx;
	}

	.username {
		flex: 1;
		text-align: right;
		margin-right: 20rpx;
	}

	.get-code {
		margin-left: 20rpx;
		background-color: #1fc7d6;
		color: #fff;
		border-radius: 10rpx;
		width: 140rpx;
		height: 60rpx;
		font-size: 28rpx;
		line-height: 60rpx;
	}

	.submit {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 80rpx;
	}

	.submit-btn {
		width: 400rpx;
		height: 80rpx;
		background-color: #1fc7d6;
		color: #fff;
		display: flex;
		justify-content: center;
		align-items: center;

	}
</style>