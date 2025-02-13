<template>
	<view class="page">
		<custom-nav title="陪诊服务选择" :isHomePage="false"></custom-nav>
		<view class="user-info-detail">
			<button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="getAvatar">
				<image :src="avatar||'../../static/images/mine/avatar.png'" mode="widthFix" />
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
				<input type="text" class="username" placeholder="输入你的身份证号码" v-model="idNumber" />
			</view>
			<view class="user-info-item">
				<image src="../../static/images/mine/phone.png" alt=""></image>
				<view class="user-info-item-title">手机号</view>
				<input type="text" class="username" placeholder="请输入你的手机号" v-model="phone" />
				<button class="get-code" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">获取</button>
			</view>

		</view>
		<view class="submit">
			<image src="../../static/images/mine/submit.png" alt=""></image>
			<button class="submit-btn" @click="submitUserInfo">提交</button>
		</view>
	</view>
</template>


<script>
	import WXBizDataCrypt from "../../Utils/aes-sample.eae1f364/aes-sample.eae1f364/Node/WXBizDataCrypt";
	export default {
		data() {
			return {

				avatar: '',
				show: false,
				nickName: '',
				phone: "",
				phone_iv: "",
				js_code: "",
				session_key: "",
				realName: '',
				ID: '',
				idNumber: "",
				fromPage: '',
			};
		}
		/**

		 * 生命周期函数--监听页面加载
		 */
		,
		onLoad(options) {
			// 获取来源页面参数
			this.fromPage = options.from || 'mine'

		},
		/**
		 * 生命周期函数--监听页面初次渲染完成
		 */
		onReady() {},
		/**
		 * 生命周期函数--监听页面显示
		 */
		onShow() {
			this.go();
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
				this.avatar = e.detail.avatarUrl;
				this.show = true;

			},
			getName(e) {
				this.nickName = e.detail.value;
			},
			// 	getIdNumber(e){
			// 		this.idNumber = e.detail.value;
			// 	},
			// getPhone(e){
			// 	this.phone = e.detail.value;
			// },

			go() {
				uni.login({
					provider: 'weixin',
					success: res => {
						console.log(res)
						this.js_code = res.code
						uni.request({
							url: 'https://api.weixin.qq.com/sns/jscode2session', // 请求微信服务器
							method: 'GET',
							data: {
								appid: 'wxf8afb6dce14d487a', //你的小程序的APPID
								secret: 'f00ab7cf65338de89b24cb5a52c640a4', //你的小程序秘钥secret,  
								js_code: this.js_code, //uni.login 登录成功后的code
								grant_type: 'authorization_code' //此处为固定值
							},
							success: (res) => {
								console.log('获取信息', res.data);
								this.ID = res.data.openid
								this.session_key = res.data.session_key

							}
						});
					}
				});
			},
			// 获取手机号
			getPhoneNumber(res) {
				console.log(res)
				if (res.detail.errMsg === "getPhoneNumber:ok") {
					const {
						encryptedData,
						iv
					} = res.detail;
					console.log(encryptedData, iv);

					// 创建解密对象
					const pc = new WXBizDataCrypt('wxf8afb6dce14d487a', this.session_key);

					try {
						// 解密数据
						const data = pc.decryptData(encryptedData, iv);
						console.log(data);

						// 检查手机号是否为空
						if (data.phoneNumber) {
							this.phone = data.phoneNumber;
							console.log('解密成功，手机号:', this.phone);
						} else {
							console.error('解密后未获取到手机号');
						}
					} catch (err) {
						console.error('解密失败:', err);
					}
				} else {
					console.error('用户拒绝授权获取手机号');
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
				const userInfo = {
					avatarUrl: this.avatar,
					nickName: this.nickName,
					realName: this.realName,
					ID: this.ID,
					phone: this.phone,
					idNumber: this.idNumber,
					type:"普通用户"
				}
				console.log(userInfo)
				// 根据来源页面存储不同的信息
				uni.setStorageSync('userInfo', userInfo);
				console.log(uni.getStorageSync('userInfo'))


				const {result} = await uniCloud.callFunction({
				        name: 'addUsers',
				        data: userInfo,
				      });
				console.log(result)
				      if (result.code === 200) {
				        uni.showToast({
				          title: '登录成功',
				          icon: 'success',
				          duration: 2000,
				        });
				      } else {
				        uni.showToast({
				          title: result.message || '登录失败',
				          icon: 'none',
				          duration: 2000,
				        });
				      }

				// 返回上一页
				uni.navigateBack({
					delta: 1
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


				if (!this.phone || !/^\d{11}$/.test(this.phone)) {
					errors.push('手机号码格式不正确');
					return errors;
				}

				//    if (!this.formData.qualificationNumber) {
				//      errors.push('资格证号不能为空');
				// return errors;
				//    }
				if (!this.idNumber || !/^\d{18}$/.test(this.idNumber)) {
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
		background: linear-gradient(to bottom, #54c69a, #fffcf9);
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
		color: #fff;
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
		background-color: #54c69a;
		color: #fff;
		border-radius: 10rpx;
		width: 150rpx;
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
		background-color: #54c69a;
		color: #fff;
		display: flex;
		justify-content: center;
		align-items: center;
		padding-left: 50rpx;
	}

	.submit image {
		width: 60rpx;
		height: 60rpx;
		position: absolute;
		/* 使用绝对定位 */
		left: calc(50% - 120rpx);
		/* 调整图标位置 */
		z-index: 1;
	}
</style>