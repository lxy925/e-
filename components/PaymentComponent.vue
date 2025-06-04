<template>
	<view>
		<button class="order-now" style="border: none; position: relative;" @click="createOrder()">
			<text class="button-text">{{ buttonText }}</text>
		</button>
	</view>
</template>

<script>
	import {
		encrypt
	} from '@/Utils/crypto.js'; // 使用别名更安全
	export default {
		props: {
			amount: {
				type: Number,
				required: true
			},
			buttonText: {
				type: String,
				default: '立即下单'
			}
		},
		name: "PaymentComponent",
		data() {
			return {
				user_id: '',
				openid: '',
				order: {},
				order_no: '',
				out_trade_no: '',
				total_price: '',
				package: '',
				signType: 'RSA', // 强制指定类型
				paySign: '',
				transactionId: '',
				description: "购买订单", // 支付描述
				type: "goods", // 支付回调类型 如 recharge 代表余额充值 goods 代表商品订单（可自定义，任意英文单词都可以，只要你在 uni-pay-co/notify/目录下创建对应的 xxx.js文件进行编写对应的回调逻辑即可）
				custom: {
					a: "a",
					b: 1
				},
			};
		},
		created() {
			this.initWechatLogin();
		},
		methods: {
			initWechatLogin() {
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
								this.openid = res.data.openid
								this.session_key = res.data.session_key
							}
						});
					}
				});
			},

			async createOrder() {
				uni.showLoading({
					title: '创建订单中...'
				});
				try {
					const order_no = `order_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
					const out_trade_no = `${order_no}-1`;
					const createRes = await uniCloud.callFunction({
						name: 'createOrder',
						data: {
							order_no,
							user_id: this.openid,
							status: 'unpaid',
							total_price: this.amount,
							client_time: new Date(),
							out_trade_no,
						}
					});
					console.log('订单创建结果:', createRes); // 修正日志中的变量名
					// // 无论支付是否成功，均跳转到订单详情页
					// uni.navigateTo({
					// 	url: `/pages/orderDetail/orderDetail?order_no=${order_no}`
					// });
					// 继续支付流程（即使跳转后也会在后台执行）
					if (createRes.result.code === 200) {
						await this.payOrder(order_no, this.amount);
					}
				} catch (e) {
					uni.showToast({
						title: '创建失败: ' + e.message,
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},

			async payOrder(order_no, total_price) {
				try {
					// 1. 更新为待支付状态（仅在首次支付时需要）
					const statusRes = await uniCloud.callFunction({
						name: 'updateOrderStatus',
						data: {
							order_no,
							from_status: 'unpaid',
							to_status: 'pending'
						}
					});
					console.log("支付状态更改结果", statusRes);
					if (!statusRes.result.success) {
						throw new Error('订单状态变更失败');
					}
					//2.发起支付
					try {
						uni.showLoading({
							title: '支付准备中...'
						});
						this.getOrderDetails(order_no);
						// 1. 获取支付参数
						const res = await uniCloud.callFunction({
							name: 'getOrderInfo',
							data: {
								order_no,
								openId: this.openid,
								mchId: '1711967249',
								key: 'Epwy9402123456789012345678901940',
								orderId: order_no,
								timestamp: String(Date.now()),
								total_price: Number(total_price),
							}
						});

						// 2. 校验云函数响应
						if (res.result.code !== 0 || !res.result.data) {
							throw new Error('获取支付参数失败: ' + (res.result.msg || '未知错误'));
						}
						const paymentParams = res.result.data; // 注意嵌套层级
						console.log("payment:", paymentParams);
						this.package = paymentParams.package;
						this.paySign = paymentParams.paySign;
						// 3. 支付参数标准化
						const validatedParams = {
							timeStamp: String(paymentParams.timeStamp), // 强制转字符串
							nonceStr: paymentParams.nonceStr,
							package: paymentParams.package,
							signType: 'RSA', // 强制指定类型
							paySign: paymentParams.paySign
						};
						console.log('支付参数校验:', validatedParams);

						// 4. 发起微信支付
						const paymentRes = await new Promise((resolve, reject) => {
							uni.requestPayment({
								...validatedParams,
								success: resolve,
								fail: reject
							});
						});

						// 5. 支付成功处理
						const PaymentRes = await uniCloud.callFunction({
							name: 'queryOrder',
							data: {
								order_no,
							}
						});
						if (PaymentRes.code === 0) {
							console.log('订单状态:', PaymentRes.data.tradeState);
							console.log('微信订单号:', PaymentRes.data.transactionId);
							if (PaymentRes.data.tradeState === 'SUCCESS') {
								uni.showToast({
									title: '支付成功'
								});
							}
						} else {
							uni.showToast({
								title: PaymentRes.message,
								icon: 'none'
							});
						}

						console.log('支付成功回调:', paymentRes);
						this.transactionId = paymentRes.transactionId;
						const successTime = uni.$u.timeFormat(
							parseInt(validatedParams.timeStamp) * 1000,
							'yyyy-mm-dd hh:MM:ss'
						);

						// 6. 提交支付信息到后端
						await this.$api.postInsertWeChatPayInfo({
							order_no: order_no,
							payment_time: successTime,
							transaction_id: paymentRes.transaction_id // 微信订单号
						});

						// // 7. 更新订单状态
						// const updateRes = await uniCloud.callFunction({
						// 	name: 'updateOrderStatus',
						// 	data: {
						// 		order_no: order_no,
						// 		from_status: 'pending',
						// 		to_status: 'paid'
						// 	}
						// });
						// console.log('订单状态更新结果:', updateRes);

						uni.showToast({
							title: '支付成功'
						});
						this.getOrderDetails(order_no);

					} catch (err) {
						console.error('支付全流程错误:', err);
						uni.showToast({
							title: `支付失败: ${err.errMsg || err.message}`,
							icon: 'none'
						});
					} finally {
						uni.hideLoading();
					}
				} catch (err) {
					throw new Error('支付失败: ' + err.message);
				}
			},

			async getOrderDetails(order_no) {
				console.log(`开始获取订单详情，订单号: ${order_no}`);
				try {
					const res = await uniCloud.callFunction({
						name: 'getOrderDetails',
						data: {
							order_no: order_no,
						}
					});
					console.log(`获取订单详情结果:`, res);
					if (res.result) {
						this.order = res.result;
						this.openid = res.result.user_id;
						this.total_price = res.result.total_price;
						this.out_trade_no = res.result.out_trade_no;
					} else {
						console.error('未获取到有效的订单详情数据');
						// 可以添加提示用户的代码，比如 uni.showToast
						uni.showToast({
							title: '未获取到有效的订单详情数据',
							icon: 'none'
						});
					}
				} catch (e) {
					console.error(`获取订单详情失败:`, e);
					// 同样可以添加提示用户的代码
					uni.showToast({
						title: '获取订单详情失败，请稍后重试',
						icon: 'none'
					});
				}
			},
		}
	}
</script>

<style>
	.order-now {
		background: linear-gradient(90deg, #2196f3, #00aaff);
		border-radius: 50rpx;
		width: 200rpx;
		height: 80rpx;
		color: white;
		font-size: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.button-text {
		font-weight: bold;
	}
</style>