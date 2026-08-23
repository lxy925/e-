<script>
	const jwt = require("./utils/jwt")
	// app.js
	export default {
		data() {
			return {};
		},
		onLaunch: function() {
			if (!wx.cloud) {
				console.error('请使用 2.2.3 或以上的基础库以使用云能力');
			} else {
				wx.cloud.init({
					// env 参数说明：
					//   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
					//   此处请填入环境 ID, 环境 ID 可打开云控制台查看
					//   如不填则使用默认环境（第一个创建的环境）
					env: '',
					traceUser: true
				});
			}

			this.globalData = {};
			// this.checkToken();

		},
		onShow() {

		},
		methods: {
			// async checkToken() {
			// 	try {
			// 		// 从缓存中获取token

			// 		const token = uni.getStorageSync('token');
			// 		console.log("token", token)
			// 		jwt.verifyToken(token)

			// 		console.log('Token有效');
			// 	} catch (error) {
			// 		console.error('检查token出错:', error);
			// 		await this.loginAndCacheToken();
			// 	}
			// },
			// async loginAndCacheToken() {
			// 	uni.showModal({
			// 		title: '提示',
			// 		content: '使用完整服务前请先登录',
			// 		showCancel: false,
			// 		success: (res) => {
			// 			if (res.confirm) {
			// 				// 跳转到登录页面
			// 				uni.reLaunch({
			// 					url: '/subPackageA/pages/userInfoDetail/userInfoDetail'
			// 				});
			// 			}
			// 		}
			// 	});
			// }
		}
	}
</script>
<style>
	/**app.wxss**/
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		box-sizing: border-box;
	}

	button {
		background: initial;
	}

	button:focus {
		outline: 0;
	}

	button::after {
		border: none;
	}

	page {
		background: linear-gradient(to bottom, #1fc7d6, #8ce5ef, rgb(245, 245, 245) 25%);

		background-attachment: fixed;
		/* 固定背景 */
		/* background-repeat: no-repeat; */
		/* 禁止重复 */
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		min-height: 100vh;
		;
	}

	/* @import "/wxcomponents/vant/common/index.wxss"; */
</style>