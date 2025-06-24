<template>
	<view class="app">
		<!-- 微信支付相关页面内容 -->
		<view class="page-content">
			<view>请选择支付方式</view>
			<radio-group @change="radioChange" style="display: flex;margin: 10rpx 0;">
				<label style="flex: 1;">
					<radio value="wxpay" :checked="form1.provider == 'wxpay'" />
					<text>微信</text>
				</label>
			</radio-group>

			<view style="margin-bottom: 16rpx;">支付金额：(单位分 100 = 1元)</view>
			<input class="input" type="text" v-model="form1.total_fee" placeholder="支付金额" />

			<view style="margin-bottom: 16rpx;">订单号</view>
			<input class="input" type="text" v-model="form1.out_trade_no" placeholder="订单号" />

			<!-- 微信支付按钮 -->
			<button class="button" v-if="h5Env === 'h5-weixin'" type="primary"
				@click="getWeiXinJsCode('snsapi_base')">公众号获取openid</button>
			<button class="button" v-if="vkPay.status == 0" type="primary" @click="createPayment">发起微信支付</button>
			<button class="button" v-else-if="vkPay.status == 2" type="primary" @click="createPayment">再次发起支付</button>

			<!-- 微信支付相关操作按钮 -->
			<button class="button" @click="queryPayment">微信支付结果查询</button>
			<button class="button" @click="refund">微信申请退款</button>
			<button class="button" @click="queryRefund">微信退款结果查询</button>
		</view>

		<!-- 微信支付组件 -->
		<vk-uni-pay ref="vkPay" v-model:status="vkPay.status" v-model:codeUrl="vkPay.codeUrl"
			v-model:qrcodeImage="vkPay.qrcodeImage" :query-payment-action="vkPay.queryPaymentAction"
			:page-show="vkPay.pageShow" :auto-get-openid="vkPay.autoGetOpenid" :polling="vkPay.polling"
			:return-url="vkPay.returnUrl" :await-notify="vkPay.awaitNotify"
			:pay-order-info="vkPay.payOrderInfo"></vk-uni-pay>

		<!-- 微信支付相关弹窗 -->
		<view class="pay-qrcode-popup" v-if="vkPay.status < 2 && vkPay.codeUrl">
			<view class="pay-qrcode-popup-mask" @click="cancelPay"></view>
			<view class="pay-qrcode-popup-content">
				<image v-if="vkPay.qrcodeImage" :src="vkPay.qrcodeImage" class="pay-qrcode-popup-image"></image>
				<view class="pay-qrcode-popup-info">
					<view>
						<text class="pay-qrcode-popup-info-fee">{{ (form1.total_fee / 100).toFixed(2) }}</text>
						<text>元</text>
					</view>
					<view>请用微信扫码支付</view>
				</view>
				<button v-if="vkPay.status == 1" type="primary" @click="queryPayment">我已完成支付</button>
			</view>
		</view>

		<view class="pay-confirm-popup" v-if="vkPay.confirmShow">
			<view class="pay-confirm-popup-content">
				<view class="pay-confirm-popup-title">请确认微信支付是否已完成</view>
				<view><button type="primary" @click="queryPayment">已完成支付</button></view>
				<view class="pay-confirm-popup-refresh"><button type="default"
						@click="afreshPayment">支付遇到问题，重新支付</button></view>
				<view class="pay-confirm-popup-cancel" @click="vkPay.confirmShow = false">暂不支付</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				vkPay: {
					queryPaymentAction: {
						name: "vk-pay",
						action: "pay/queryPayment",
						actionKey: "action",
						dataKey: "data"
					},
					codeUrl: "",
					qrcodeImage: "",
					status: 0,
					pageShow: true,
					polling: true,
					returnUrl: "",
					confirmShow: false,
					awaitNotify: true,
					payOrderInfo: false,
					autoGetOpenid: true,
				},
				form1: {
					provider: "wxpay",
					total_fee: 1,
					out_trade_no: "",
					subject: "微信支付测试订单",
					body: "微信支付测试订单详情",
					type: "recharge",
					openid: ""
				}
			};
		},
		methods: {
			// 发起微信支付
			createPayment(obj = {}) {
				let that = this;
				let {
					form1
				} = that;

				form1.out_trade_no = obj.out_trade_no || "wx_test_" + Date.now();

				that.$refs.vkPay.createPayment({
					action: {
						name: "vk-pay",
						action: "pay/createPayment",
						actionKey: "action",
						dataKey: "data"
					},
					data: {
						provider: form1.provider,
						total_fee: form1.total_fee,
						out_trade_no: form1.out_trade_no,
						subject: form1.subject,
						body: form1.body,
						type: form1.type,
						openid: form1.openid
					},
					create: res => {
						console.log('微信支付订单创建成功', res);
						this.form1.out_trade_no = res.out_trade_no;
					},
					success: res => {
						uni.showToast({
							title: "微信支付成功",
							icon: "success",
							mask: true
						});
						console.log("微信支付成功", res);
					},
					fail: res => {
						console.error("微信支付失败", res);
						if (res.failType === "create") {
							uni.showModal({
								title: "提示",
								content: res.msg,
								showCancel: false
							});
						} else if (res.failType === "request") {
							uni.showToast({
								title: "请求微信支付失败",
								icon: "none",
								mask: true
							});
						} else if (res.failType === "result") {
							uni.showToast({
								title: "微信支付失败",
								icon: "none",
								mask: true
							});
						}
					},
					cancel: res => {
						uni.showToast({
							title: "用户取消微信支付",
							icon: "none",
							mask: true
						});
					}
				});
			},

			// 微信支付状态查询
			queryPayment() {
				this.$refs.vkPay.queryPayment({
					title: "查询中...",
					data: {
						out_trade_no: this.form1.out_trade_no
					},
					needAlert: true,
					success: data => {
						this.vkPay.status = 2;
						this.vkPay.confirmShow = false;
						uni.showToast({
							title: data.msg,
							icon: "none",
							mask: true
						});
					},
					fail: (res = {}) => {
						if (res.msg === "订单已退款") {
							this.vkPay.confirmShow = false;
						}
					}
				});
			},

			// 微信退款
			refund() {
				this.callFunction({
					title: "微信退款中...",
					name: "vk-pay",
					data: {
						action: "pay/refund",
						data: {
							out_trade_no: this.form1.out_trade_no,
						}
					},
					success: data => {
						uni.showToast({
							title: data.msg,
							icon: "none",
							mask: true
						});
					}
				});
			},

			// 微信退款查询
			queryRefund() {
				this.callFunction({
					title: "查询中...",
					name: "vk-pay",
					data: {
						action: "pay/queryRefund",
						data: {
							out_trade_no: this.form1.out_trade_no
						}
					},
					success: data => {
						uni.showModal({
							title: "提示",
							content: data.msg,
							showCancel: false
						});
					}
				});
			},

			// 取消微信支付
			cancelPay() {
				this.vkPay.status = 0;
				this.vkPay.codeUrl = "";
			},

			// 重新支付
			afreshPayment() {
				this.createPayment({
					out_trade_no: this.form1.out_trade_no
				});
			},

			// 云函数调用封装
			callFunction(obj = {}) {
				let {
					needAlert = true
				} = obj;
				if (obj.title) uni.showLoading({
					title: obj.title,
					mask: true
				});
				uniCloud.callFunction({
					...obj,
					success: (result = {}) => {
						if (obj.title) uni.hideLoading();
						let res = result.result;
						if (res.code === 0) {
							if (typeof obj.success == "function") obj.success(res);
						} else {
							if (needAlert && res.msg) uni.showModal({
								title: "提示",
								content: res.msg,
								showCancel: false
							});
							if (typeof obj.fail == "function") obj.fail(res);
						}
					},
					fail: (res = {}) => {
						if (obj.title) uni.hideLoading();
						if (needAlert && res.msg) uni.showModal({
							title: "提示",
							content: res.msg,
							showCancel: false
						});
						if (typeof obj.fail == "function") obj.fail(res);
					}
				});
			},

			// 选择支付方式
			radioChange(e) {
				this.form1.provider = e.detail.value;
			},

			// 获取微信公众号code
			getWeiXinJsCode(scope = "snsapi_base") {
				let appid = "wx2ebf03d174875bed"; // 填写公众号的appid
				let redirect_uri = window.location.href.split("?")[0];
				let url =
					`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&state=STATE#wechat_redirect`;
				window.location.href = url;
			},

			// 获取公众号openid
			getOpenid(data) {
				let {
					code
				} = data;
				this.callFunction({
					title: "请求中...",
					name: "vk-pay",
					data: {
						action: "pay/code2SessionWeixinH5",
						data
					},
					success: res => {
						if (res.openid) {
							this.form1.openid = res.openid;
							uni.showToast({
								title: "已获取到微信openid，可以开始支付",
								icon: "none",
								mask: true
							});
						}
					}
				});
			}
		},
		computed: {
			// h5运行环境检测
			h5Env() {
				// #ifdef H5
				let ua = window.navigator.userAgent.toLowerCase();
				if (ua.match(/MicroMessenger/i) == 'micromessenger') {
					return "h5-weixin";
				}
				return "h5";
				// #endif
			}
		}
	};
</script>

<style lang="scss" scoped>
	.page-content {
		padding: 15px;
		max-width: 800px;
		margin: 0 auto;

		.input {
			width: 100%;
			height: 46px;
			border: solid 1px #dddddd;
			border-radius: 5px;
			margin-bottom: 15px;
			padding: 0px 15px;
			box-sizing: border-box;
		}

		.button {
			margin-bottom: 15px;
		}
	}

	.pay-confirm-popup {
		position: fixed;
		z-index: 2;
		width: 100vw;
		top: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.6);

		.pay-confirm-popup-content {
			width: 550rpx;
			margin: 50% auto 0 auto;
			background-color: #ffffff;
			border-radius: 10rpx;
			padding: 40rpx;

			.pay-confirm-popup-title {
				text-align: center;
				padding: 20rpx 0;
				margin-bottom: 30rpx;
			}

			.pay-confirm-popup-refresh {
				margin-top: 20rpx;
			}

			.pay-confirm-popup-cancel {
				margin-top: 20rpx;
				text-align: center;
			}
		}
	}

	.pay-qrcode-popup {
		position: fixed;
		z-index: 9999;
		width: 100vw;
		top: 0;
		bottom: 0;
		top: 0;
		right: 0;

		.pay-qrcode-popup-mask {
			position: absolute;
			top: 0;
			left: 0;
			width: 100vw;
			height: 100vh;
			background-color: rgba(0, 0, 0, 0.6);
		}

		.pay-qrcode-popup-content {
			position: relative;
			width: 500rpx;
			margin: 40% auto 0 auto;
			background-color: #ffffff;
			border-radius: 10rpx;
			padding: 40rpx;
			box-sizing: content-box;
			text-align: center;

			.pay-qrcode-popup-info {
				text-align: center;
				padding: 20rpx;

				.pay-qrcode-popup-info-fee {
					color: red;
					font-size: 60rpx;
					font-weight: bold;
				}
			}

			.pay-qrcode-popup-image {
				width: 450rpx;
				height: 450rpx;
			}
		}
	}
</style>