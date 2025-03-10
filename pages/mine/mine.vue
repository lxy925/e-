<template>
	<view class="page">
		<custom-nav title="e陪无忧" :isHomePage="true"></custom-nav>
		<view class="header" @click="handleHeaderClick">
			
			<img :src="userInfo.moreInfo.avatarUrl || '../../static/images/mine/avatar.png'" v-if="userInfo.type=='陪诊师'" alt="">
			<img :src="userInfo.avatar || '../../static/images/mine/avatar.png'" v-else alt="">
			<text class="username">{{userInfo.nickName || '登录'}}</text>
			<text class="user-info" v-if="userInfo.type=='陪诊师'">
				{{ userInfo.moreInfo.is_certified ? '已认证' : '未认证' }}</text>
			<view class="state-box" v-if="userInfo.type=='陪诊师'">


				<text class="state">接单状态:</text>
				<switch class="switch" :checked="userInfo.moreInfo.is_bookable" @change="onSwitchChange"
					color="#ff94da" />
			</view>
		</view>
		<view class="down" v-if="userInfo.type=='陪诊师'">
			<view class="box">
				<text class="header-num">1</text>
				<text class="header-title">总收益(元)</text>
			</view>
			<view class="box">
				<text class="header-num">1</text>
				<text class="header-title">总销量</text>
			</view>
			<view class="box">
				<text class="header-num">1</text>
				<text class="header-title">用户评分</text>
			</view>
		</view>
		<view class="info-box" v-else>

			<view class="money">
				<text class="money-num"> 1</text>
				<view class="money-box">
					<image src="../../static/images/index/money (2).png" alt=""></image>
					<text class="money-title"> 当前余额(元)</text>
				</view>
			</view>
			<view class="benefit">
				<text class="benefit-num"> 0</text>
				<view class="benefit-box">
					<image src="../../static/images/index/card.png" alt=""></image>
					<text class="benefit-title">优惠券</text>
				</view>
			</view>
		</view>

		<view class="order-box">
			<text class="order-title">{{ userInfo.type=='陪诊师' ? '订单数据' : '基本功能' }}</text>
			<view class="all-box" v-if="userInfo.type=='陪诊师'">
				<view class="data-box">
					<text class="num">1</text>
					<text class="title">订单收入(元)</text>
				</view>
				<view class="data-box">
					<text class="num">1</text>
					<text class="title">总订单数</text>
				</view>
			</view>
			<view class="order-item" v-else>

				<view class="box" style="margin-left: 0;">
					<image src="../../static/images/mine/pay.png" alt=""></image>
					<text class="box-title">待付款</text>
				</view>
				<view class="box">
					<image src="../../static/images/mine/ordering.png" alt=""></image>
					<text class="box-title">进行中</text>
				</view>
				<view class="box">
					<image src="../../static/images/mine/finish.png" alt=""></image>
					<text class="box-title">已完成</text>
				</view>
				<view class="box">
					<image src="../../static/images/mine/cancel.png" alt=""></image>
					<text class="box-title">已取消</text>
				</view>
			</view>
		</view>
		<view class="order-box">
			<text class="order-title"> {{ userInfo.type=='陪诊师' ? '订单管理' : '我的工具' }}</text>
			<view class="order-item" v-if="userInfo.type=='陪诊师'">

				<view class="boxed" @click="doctorRegister">
					<image src="../../static/images/mine/patient.png" alt=""></image>
					<text class="box-title">个人信息管理</text>
				</view>
				<view class="boxed">
					<image src="../../static/images/mine/advice.png" alt=""></image>
					<text class="box-title">查看用户评价</text>
				</view>
				<view class="boxed">
					<image src="../../static/images/mine/setting.png" alt=""></image>
					<text class="box-title">设置中心</text>
				</view>
				<!-- <view class="boxed">
			<image src="../../static/images/mine/location.png" alt=""></image>
			<text class="box-title">地址设置</text>
		</view> -->
			</view>
			<view class="order-item" v-else>
				<view class="box" id="box1" style="margin-left: 0;">
					<image src="../../static/images/mine/location.png" alt=""></image>
					<text class="box-title">地址管理</text>
				</view>
				<view class="box">
					<image src="../../static/images/mine/patient.png" alt=""></image>
					<text class="box-title">就诊人管理</text>
				</view>
				<!-- <view class="box">
          <image src="../../static/images/mine/doctor.png" alt=""></image>
          <text class="box-title">我的陪诊师</text>
        </view> -->
				<view class="box">
					<image src="../../static/images/mine/advice.png" alt=""></image>
					<text class="box-title">投诉建议</text>
				</view>
				<view class="box" style="margin-left: 0;" @click="doctorRegister">
					<image src="../../static/images/mine/help.png" alt=""></image>
					<text class="box-title">陪诊师入驻</text>
				</view>
				<view class="box">
					<image src="../../static/images/mine/setting.png" alt=""></image>
					<text class="box-title">设置中心</text>
				</view>
			</view>
		</view>
		<view class="logout-box">
			<image src="../../static/images/mine/logout.png" alt=""></image>
			<button class="logout" @click="logout" v-if="userInfo.user_id">退出登录</button>
		</view>
	</view>
</template>




// pages/mine/mine.js
<script>
	export default {
		data() {
			return {
				isLoggedIn: false, // 是否登录过
				
				userInfo: {
					session_key: '',
					avatar: '',
					nickName: '',
					is_certified: '',
					user_id: '',
					phone: '',
					idNumber: '',
					type: '',
					moreInfo: {},
				},
			};
		},
		onLoad() {
			this.initUserInfo();
		},
		onShow() {
			this.initUserInfo();
		},
		methods: {
			// 初始化用户信息
			initUserInfo() {
				const userInfo = uni.getStorageSync('userInfo');
				this.userInfo.type=uni.getStorageSync('type');
				console.log("返回后的值：",userInfo)
				
				if (userInfo) {
					this.userInfo = userInfo;
					this.isLoggedIn = true;
					this.checkSession(); // 检查 session_key 是否过期
					this.getUser()
				}
			},

			// 获取用户信息
			async getUser() {
				console.log("调取前检查",this.userInfo)
				
				try {
					uni.showLoading({
						title: '加载中'
					});
					const {
						result
					} = await uniCloud.callFunction({
						name: 'getUser',
						data: this.userInfo,
					});

					if (result.code != 0) {
						console.log("调取后",result)
						this.userInfo = result.data[0];
						console.log("调取后检查",this.userInfo)
						uni.setStorageSync('userInfo', this.userInfo);
					} else {
						uni.showToast({
							title: result.msg || '获取用户数据失败',
							icon: 'none'
						});
					}
				} catch (e) {
					uni.showToast({
						title: '获取用户数据失败',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},

			// 登录方法
			 login() {
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
										this.userInfo.user_id = res.data.openid
										this.userInfo.session_key = res.data.session_key
										 // 获取用户信息
										 console.log("获取后检查",this.userInfo)
										  this.getUser()
										
										this.isLoggedIn = true;
										uni.setStorageSync('isLoggedIn', true);
									},
									
								});
}
							})
							
							},

							// 退出登录
							logout() {
								uni.removeStorageSync('userInfo');
								uni.removeStorageSync('isLoggedIn');
								this.userInfo = {
									session_key: '',
									avatar: '',
									nickName: '',
									is_certified: '',
									user_id: '',
									phone: '',
									idNumber: '',
									type: '',
									moreInfo: {},
								};
								console.log("头像？",this.userInfo.moreInfo.avatarUrl)
								this.isLoggedIn = true;
								uni.showToast({
									title: '退出登录成功',
									icon: 'success',
									duration: 2000
								});
							},

							// 检查 session_key 是否过期
							checkSession() {
								wx.checkSession({
									success: () => {
										console.log('session_key 有效');
									},
									fail: () => {
										console.log('session_key 已过期');
										wx.showModal({
											title: '提示',
											content: '登录状态已过期，请重新登录',
											success: (res) => {
												if (res.confirm) {
													this.login(); // 重新登录
												}
											},
										});
									},
								});
							},

							// 处理头部点击事件
							handleHeaderClick() {
								if (this.userInfo.user_id) {
									console.log('已登录');
									return;
								} else if (this.isLoggedIn) {
									console.log('重新登录');
									this.login();
								} else {
									console.log('首次登录');
									uni.navigateTo({
										url:'/pages/userInfoDetail/userInfoDetail'
									})
								}
							},
	
doctorRegister(){
	if (this.userInfo.user_id) {
		console.log('已登录');
		uni.navigateTo({
			url:'/pages/escortRegistration/escortRegistration'
		})
	} else if (this.isLoggedIn) {
		console.log('重新登录');
		this.login();
		uni.navigateTo({
			url:'/pages/escortRegistration/escortRegistration'
		})
	} else {
		console.log('首次登录');
		
		// uni.navigateTo({
		// 	url:'/pages/userInfoDetail/userInfoDetail'
		// })
		uni.navigateTo({
			url:'/pages/escortRegistration/escortRegistration'
		})
	}
},
							// 切换陪诊状态
							async onSwitchChange() {
								console.log("改变之前的值",this.userInfo.moreInfo.is_bookable)
								try {
									const {
										result
									} = await uniCloud.callFunction({
										name: 'updateEscort',
										data: {
											user_id: this.userInfo.user_id,
											is_bookable: !this.userInfo.moreInfo.is_bookable,
										},
									});

									if (result.code === 200) {
										uni.showToast({
											title: '修改成功',
											icon: 'success'
										});
										
										this.getUser()
										console.log("改变之后的值",this.userInfo.moreInfo.is_bookable)
									} else {
										uni.showToast({
											title: result.message || '修改失败',
											icon: 'none'
										});
									}
								} catch (e) {
									uni.showToast({
										title: '修改失败',
										icon: 'none'
									});
								}
							},
						},
					};
</script>

<style>
	/* pages/mine/mine.wxss */
	.page {
		min-height: 100vh;
		background: linear-gradient(to bottom,
				#0bd6c8,
				#99efe9,
				#ddf5f4,
				rgb(226, 226, 226));
		padding-top: 50rpx;
		margin-top: -1px;
		/* 消除可能的间隙 */
		padding-top: 150rpx;
	}

	.header {
		display: flex;
		align-items: center;
	}

	.header img {
		width: 180rpx;
		height: 180rpx;
		border-radius: 50%;
		margin-left: 50rpx;
		margin-top: 50rpx;
	}

	.user {
		display: flex;
		flex-direction: column;
		justify-content: baseline;
	}

	.username {
		font-size: 25px;
		font-weight: bold;
		margin-left: 50rpx;
		margin-top: 10rpx;

	}

	.user-info {
		font-size: 13px;
		font-weight: bold;
		margin-left: 30rpx;
		margin-top: 10rpx;
		background-color: #a5d63f;
		padding: 10rpx;
		height: auto;
		border-radius: 20rpx;
	}

	.state-box {
		margin-top: 150rpx;
		margin-left: -180rpx;
		font-size: 15px;
		font-weight: bold;

	}

	.state {
		margin-right: 15rpx;
	}


	.down {
		display: flex;
		margin-top: 40rpx;
		justify-content: space-evenly;
		background-color: #fff;
		border-radius: 15rpx;
		padding: 20rpx;
		margin-left: 50rpx;
		margin-right: 50rpx;
		color: #333;
	}

	.box {
		border-radius: 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 200rpx;
	}

	.header-num {
		font-size: 25px;
		font-weight: bold;
		margin-top: 20rpx;
		margin-bottom: 10rpx;
		font-weight: bold;
	}

	.header-title {
		font-size: 13px;
		font-weight: bold;
		/* color: #fff; */
		margin-top: 0;
	}

	.info-box {
		display: flex;
		margin-top: 40rpx;
		justify-content: space-evenly;
		background-color: #fff;
		border-radius: 15rpx;
		padding: 20rpx;
		margin-left: 50rpx;
		margin-right: 50rpx;
		color: #333;
		/* width: 100%; */
	}

	.money {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
	}

	.money-box {
		display: flex;
		align-items: center;
		margin-right: 20rpx;
		margin-top: 70rpx;
	}

	.benefit {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
	}

	.benefit-box {
		display: flex;
		align-items: center;
		margin-right: 40rpx;
		margin-top: 70rpx;
	}

	.money-num {
		font-size: 25px;
		font-weight: bold;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
	}

	.benefit-num {
		font-size: 25px;
		font-weight: bold;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
	}

	.money-title {
		font-size: 13px;
		font-weight: bold;
		margin-left: 10rpx;
	}

	.benefit-title {
		font-size: 13px;
		font-weight: bold;
		margin-left: 10rpx;
	}

	.money image {
		width: 48rpx;
		height: 48rpx;
	}

	.benefit image {
		width: 50rpx;
		height: 50rpx;
	}

	.all-box {
		display: flex;
		margin: 30rpx;
		border-radius: 20rpx;
		background-color: #ddf5f4;
		padding: 30rpx;
		justify-content: center;
		height: 120rpx;

	}

	.data-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		/* margin-left: 50rpx;
		margin-right: 50rpx;
		margin-top: 20rpx; */
		margin-top: 20rpx;
		width: 250rpx;
		gap: 10rpx;
	}

	.first {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.num {
		font-size: 35rpx;
		color: #333;
		margin-left: 20rpx;
		margin-right: 20rpx;
		font-weight: bold;
	}

	.title {
		font-size: 28rpx;
		color: #333;
		margin-left: 20rpx;
		margin-right: 20rpx;
	}

	.order-box {
		margin-top: 40rpx;
		background-color: #fff;
		border-radius: 15rpx;
		padding: 20rpx;
		margin-left: 50rpx;
		margin-right: 50rpx;
	}

	.order-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-left: 20rpx;
	}

	.order-item {
		margin-top: 20rpx;
		display: flex;

		flex-wrap: wrap;
		/* justify-content: space-a; */
	}

	.boxed {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 30%;
		margin-bottom: 20rpx;
		margin-left: 15rpx;
	}

	.boxed image {
		width: 70rpx;
		height: 70rpx;
		margin-bottom: 10rpx;
	}

	.box-title {
		font-size: 13px;
		font-weight: bold;
		margin-top: 10rpx;
	}

	.box {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 25%;
		margin-bottom: 20rpx;

	}

	.box image {
		width: 75rpx;
		height: 75rpx;
		margin-bottom: 10rpx;
	}

	.box-title {
		font-size: 13px;
		font-weight: bold;
		margin-top: 10rpx;
	}

	.logout-box {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 40rpx;
	}

	.logout-box image {
		width: 50rpx;
		height: 50rpx;
		position: absolute;
		/* 使用绝对定位 */
		left: calc(50% - 120rpx);
		/* 调整图标位置 */
		z-index: 1;

	}

	.logout-box button {
		width: 400rpx;
		height: 80rpx;
		background-color: #54c69a;
		color: #fff;
		display: flex;
		justify-content: center;
		align-items: center;
		padding-left: 50rpx;
	}
</style>