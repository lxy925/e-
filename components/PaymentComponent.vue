<!-- <template>
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
</style> -->


<!-- <template>
	<view>
		<button class="order-now" style="border: none; position: relative;" @click="createOrder()">
			<text class="button-text">{{ buttonText }}</text>
		</button>
		<vk-uni-pay ref="vkPay" v-model:status="vkPay.status" v-model:codeUrl="vkPay.codeUrl"
			v-model:qrcodeImage="vkPay.qrcodeImage" :query-payment-action="vkPay.queryPaymentAction"
			:page-show="vkPay.pageShow" :auto-get-openid="vkPay.autoGetOpenid" :polling="vkPay.polling"
			:return-url="vkPay.returnUrl" :await-notify="vkPay.awaitNotify" :pay-order-info="vkPay.payOrderInfo">
		</vk-uni-pay>
	</view>
</template>

<script>
	export default {

		props: {
			buttonText: {
				type: String,
				default: '立即下单'
			},
			orderInfo: {
				type: Object,
				required: true
			},
			servicePrice: {
				type: Number,
				required: true
			},
			serviceId: {
				type: String,
				required: true
			},
			serviceName: {
				type: String,
				required: true
			},
			serviceDesc: {
				type: String,
				required: true
			}
		},
		data() {
			return {
				loading: false,
				orderNo: '',
				outTradeNo: '', // 新增商户订单号字段
				orderId: '',
				vkPay: {
					status: 0,
					queryPaymentAction: {
						name: "vk-pay",
						action: "pay/queryPayment",
						actionKey: "action",
						dataKey: "data"
					},
					codeUrl: "",
					qrcodeImage: "",
					pageShow: false, // 隐藏支付组件页面
					polling: true,
					returnUrl: "",
					confirmShow: false,
					awaitNotify: true,
					payOrderInfo: false,
					autoGetOpenid: false
				},
				paymentResult: {
					show: false,
					status: 'pending',
					message: ''
				}
			};
		},
		methods: {
			// 支付组件(PaymentComponent)中添加的方法
			createOrderWithValidation(resolve) {
				console.log('接收到验证通过信号，开始创建订单');
				this.createOrder()
					.then(success => {
						console.log('订单创建结果:', success);
						resolve(success);
					})
					.catch(err => {
						console.error('订单创建异常:', err);
						resolve(false);
					});
			},
			// 创建订单并发起支付
			async createOrder() {
				if (this.loading) return;
				this.loading = true;

				try {
					// 1. 主动获取 js_code（用于备用模式）
					const {
						code
					} = await this.getLoginCode();
					if (!code) throw new Error('获取登录凭证失败');

					// 2. 构建完整订单数据
					const orderData = {
						service_id: this.serviceId,
						service_info: this.orderInfo,
						total_price: this.servicePrice, // 关键修复：使用props中的servicePrice
						status: 'unpaid',
						create_time: new Date(),
						js_code: code // ← 新增：传递 js_code 给云函数
					};
					// 打印参数用于调试
					console.log('即将发送到云函数的orderData:', orderData);
					// 3. 调用云函数创建订单
					const createRes = await uniCloud.callFunction({
						name: 'createOrder',
						data: orderData,
						authMode: 'requireAuth', // ← 必须开启用户授权（优先使用 wxContext）
					});

					if (createRes.result.code !== 200) {
						throw new Error(createRes.result.message || '订单创建失败');
					}
					if (createRes.result.code == 200) {
						console.log("在数据库里创建订单:" + createRes.result);
					}

					// 4. 获取订单号和商户订单号
					this.orderNo = createRes.result.data.order_no;
					this.outTradeNo = createRes.result.data.out_trade_no || this.orderNo;
					this.openId = createRes.result.data.openid;
					this.orderId = createRes.result.data.order_id;

					// // 5. 发起支付
					// await this.startPaymentProcess(this.orderNo, this.outTradeNo, this.openId);
					// 5. 直接跳转到订单详情页（不发起支付）
					this.navigateToOrderDetail(this.orderId, 'paying');

				} catch (e) {
					console.error('创建订单错误:', e);
					uni.showToast({
						title: e.message || '创建订单失败',
						icon: 'none'
					});
				} finally {
					this.loading = false;
				}
			},

			// 获取登录凭证 js_code
			getLoginCode() {
				return new Promise((resolve, reject) => {
					uni.login({
						provider: 'weixin',
						success: (res) => {
							resolve({
								code: res.code
							});
						},
						fail: (err) => {
							reject(new Error('登录失败: ' + err.message));
						}
					});
				});
			},

			// // 发起支付流程
			// async startPaymentProcess(orderNo, outTradeNo, openId) {
			// 	try {
			// 		uni.showLoading({
			// 			title: '准备支付...'
			// 		});

			// 		// 确保vkPay组件已加载
			// 		if (!this.$refs.vkPay) {
			// 			throw new Error('支付组件未加载');
			// 		}
			// 		// 支付状态初始值
			// 		let paymentStatus = 'unpaid';
			// 		// 调用vk-pay组件发起支付，确保传递out_trade_no
			// 		this.$refs.vkPay.createPayment({
			// 			action: {
			// 				name: "vk-pay",
			// 				action: "pay/createPayment",
			// 				actionKey: "action",
			// 				dataKey: "data"
			// 			},
			// 			data: {
			// 				provider: "wxpay",
			// 				total_fee: 1,
			// 				order_no: orderNo,
			// 				out_trade_no: outTradeNo, // 确保传递商户订单号
			// 				subject: this.serviceName,
			// 				body: this.serviceDesc,
			// 				type: "service",
			// 				service_info: this.orderInfo,
			// 				openid: openId,
			// 			},
			// 			success: () => this.handlePaymentResult('paid', '支付成功'),
			// 			fail: (res) => this.handlePaymentResult('unpaid', res.msg || '支付失败'),
			// 			cancel: () => this.handlePaymentResult('unpaid', '已取消支付')
			// 		});
			// 	} catch (e) {
			// 		console.error('支付流程错误:', e);
			// 		uni.showToast({
			// 			title: e.message || '支付准备失败',
			// 			icon: 'none'
			// 		});
			// 	} finally {
			// 		uni.hideLoading();
			// 	}
			// },


			// 更新订单状态
			async updateOrderStatus(orderNo, fromStatus, toStatus) {
				try {
					const res = await uniCloud.callFunction({
						name: 'updateOrderStatus',
						data: {
							order_no: orderNo,
							from_status: fromStatus,
							to_status: toStatus
						}
					});

					if (res.result.code === 200 && res.result.success) {
						console.log('订单状态更新成功', res.result.data);
						return true;
					} else {
						console.error('订单状态更新失败', res.result.message);
						uni.showToast({
							title: res.result.message || '订单状态更新失败',
							icon: 'none'
						});
						return false;
					}
				} catch (e) {
					console.error('更新订单状态异常:', e);
					uni.showToast({
						title: '更新订单状态失败，请稍后重试',
						icon: 'none'
					});
					return false;
				}
			},
			// 导航到订单详情页
			navigateToOrderDetail(orderId, status) {
				this.updateOrderStatus(this.orderNo, 'unpaid', status);
				// 使用 setTimeout 确保UI更新完成后再导航
				setTimeout(() => {
					uni.navigateTo({
						url: `/pages/order_detail/order_detail?orderId=${orderId}&status=${status}`,
						success: () => {
							console.log('成功跳转到订单详情页');
						},
						fail: (err) => {
							console.error('跳转失败:', err);
							uni.showToast({
								title: '跳转订单详情页失败',
								icon: 'none'
							});
						}
					});
				}, 500);
			},

			// handlePaymentResult(status, message) {
			// 	// 显示提示信息
			// 	uni.showToast({
			// 		title: message,
			// 		icon: status === 'paid' ? 'success' : 'none',
			// 		duration: 1500
			// 	});

			// 	// 更新订单状态
			// 	this.updateOrderStatus(this.orderNo, 'unpaid', status);

			// 	// 导航到订单详情页
			// 	this.navigateToOrderDetail(this.orderId, status);
			// },
		}
	};
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
</style> -->


<template>
	<view>
		<button class="order-now" style="border: none; position: relative;" @click="handleCreateOrder()">
			<text class="button-text">{{ buttonText }}</text>
		</button>
		<vk-uni-pay ref="vkPay" v-model:status="vkPay.status" v-model:codeUrl="vkPay.codeUrl"
			v-model:qrcodeImage="vkPay.qrcodeImage" :query-payment-action="vkPay.queryPaymentAction"
			:page-show="vkPay.pageShow" :auto-get-openid="vkPay.autoGetOpenid" :polling="vkPay.polling"
			:return-url="vkPay.returnUrl" :await-notify="vkPay.awaitNotify" :pay-order-info="vkPay.payOrderInfo">
		</vk-uni-pay>
	</view>
</template>

<script>
	export default {
		props: {
			buttonText: {
				type: String,
				default: '立即下单'
			},
			orderInfo: {
				type: Object,
				required: true
			},
			servicePrice: {
				type: Number,
				required: true
			},
			serviceId: {
				type: String,
				required: true
			},
			serviceName: {
				type: String,
				required: true
			},
			serviceDesc: { // 虽然数据中是service_details，但保持组件接口一致
				type: String,
				required: true
			}
		},
		mounted() {
			console.log('PaymentComponent 初始化完成');
			console.log('serviceId:', this.serviceId);
			console.log('serviceName:', this.serviceName);
			console.log('serviceDesc:', this.serviceDesc);
			console.log('orderInfo:', this.orderInfo);
		},
		data() {
			return {
				loading: false,
				orderNo: '',
				outTradeNo: '',
				orderId: '',
				vkPay: {
					status: 0,
					queryPaymentAction: {
						name: "vk-pay",
						action: "pay/queryPayment",
						actionKey: "action",
						dataKey: "data"
					},
					codeUrl: "",
					qrcodeImage: "",
					pageShow: false,
					polling: true,
					returnUrl: "",
					confirmShow: false,
					awaitNotify: true,
					payOrderInfo: false,
					autoGetOpenid: false
				},
				paymentResult: {
					show: false,
					status: 'pending',
					message: ''
				},
				// 本地验证状态
				formValid: false,
				fieldErrors: {
					patient: false,
					hospital: false,
					datetime: false,
					address: false
				},
				missingOptionalFields: []
			};
		},
		methods: {
			// 处理创建订单（整合验证逻辑）
			async handleCreateOrder() {
				// 1. 执行本地表单验证
				const isValid = await this.validateForm();
				if (!isValid) return;

				// 2. 所有验证通过，创建订单
				await this.createOrder();
			},

			// 表单验证方法
			async validateForm() {
				// 1. 重置验证状态
				this.resetValidationState();

				// 2. 验证必填字段
				const requiredFields = ['patient', 'hospital', 'datetime'];
				const hasRequiredError = requiredFields.some(field => {
					const fieldValue = this.getOrderInfoField(field);
					this.fieldErrors[field] = !fieldValue;
					return !fieldValue;
				});

				if (hasRequiredError) {
					this.showRequiredErrors();
					return false;
				}

				// 3. 验证选填字段
				const optionalFields = [{
						field: 'doctor',
						name: '陪诊师'
					},
					{
						field: 'department',
						name: '科室'
					},
					{
						field: 'requirements',
						name: '就诊人特点及陪诊需求'
					},
					{
						field: 'materials',
						name: '上传材料'
					},
					{
						field: 'customRequirements',
						name: '其他特殊需求描述'
					}
				];

				this.missingOptionalFields = optionalFields.filter(item => {
					const fieldValue = this.getOrderInfoField(item.field);
					const isMissing = !fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0);
					if (isMissing) this.fieldErrors[item.field] = true;
					return isMissing;
				});

				if (this.missingOptionalFields.length > 0) {
					const continueSubmit = await this.confirmOptionalFields();
					if (!continueSubmit) return false;
				}

				// 4. 所有验证通过
				this.formValid = true;
				return true;
			},

			// 重置验证状态
			resetValidationState() {
				this.formValid = false;
				this.fieldErrors = {
					patient: false,
					hospital: false,
					datetime: false,
					address: false,
					department: false,
					doctor: false,
					requirements: false,
					materials: false,
					customRequirements: false
				};
				this.missingOptionalFields = [];
			},

			// 获取订单信息中的字段值
			getOrderInfoField(field) {
				switch (field) {
					case 'patient':
						return this.orderInfo.patient_name;
					case 'patient_phone':
						return this.orderInfo.patient_phone;
					case 'hospital':
						return this.orderInfo.hospital;
					case 'datetime':
						return this.orderInfo.service_time;
					case 'address':
						return this.orderInfo.address;
					case 'doctor':
						return this.orderInfo.doctor_name; // 陪诊师字段
					case 'doctor_id':
						return this.orderInfo.doctor_id;
					case 'department':
						return this.orderInfo.department;
					case 'requirements':
						return this.orderInfo.requirements;
					case 'materials':
						return this.orderInfo.materials;
					case 'customRequirements':
						return this.orderInfo.custom_requirements;
					default:
						return null;
				}
			},

			// 显示必填字段错误
			showRequiredErrors() {
				let errorMsg = '请填写以下必填信息：';
				const errorFields = Object.keys(this.fieldErrors)
					.filter(key => this.fieldErrors[key] && ['patient', 'hospital', 'datetime', 'address'].includes(key))
					.map(key => {
						switch (key) {
							case 'patient':
								return '就诊人';
							case 'hospital':
								return '服务医院';
							case 'datetime':
								return '服务时间';
							case 'address':
								return '接送地点';
							default:
								return key;
						}
					});
				uni.showToast({
					title: errorMsg + errorFields.join('、'),
					icon: 'none'
				});
			},

			// 确认选填字段缺失（含陪诊师特殊提示）
			confirmOptionalFields() {
				return new Promise(resolve => {
					const missingNames = this.missingOptionalFields.map(item => {
						if (item.field === 'doctor') {
							return `${item.name}（如不选择将为您自动分配）`;
						}
						return item.name;
					});

					uni.showModal({
						title: '提示',
						content: `您尚未填写以下选填信息：${missingNames.join('、')}，是否继续提交？`,
						success: (res) => {
							resolve(res.confirm);
						}
					});
				});
			},
			// 创建订单并发起支付
			async createOrder() {
				if (this.loading) return;
				this.loading = true;

				try {
					// 1. 主动获取 js_code
					const {
						code
					} = await this.getLoginCode();
					if (!code) throw new Error('获取登录凭证失败');

					// 2. 构建完整订单数据
					const orderData = {
						patient_phone: this.orderInfo.patient_phone,
						patient_name: this.orderInfo.patient_name,
						service_id: this.serviceId, // 使用组件prop
						service_name: this.serviceName, // 使用组件prop
						service_desc: this.serviceDesc, // 使用组件prop
						service_info: {
							...this.orderInfo,
							service_id: this.serviceId, // 使用组件prop
							service_name: this.serviceName, // 使用组件prop
						},
						doctor_id: this.orderInfo.doctor_id,
						total_price: this.servicePrice,
						status: 'unpaid',
						create_time: new Date(),
						js_code: code,
						address: this.orderInfo.address,
					};
					console.log('发送到云函数的orderData:', orderData);

					// 3. 调用云函数创建订单
					const createRes = await uniCloud.callFunction({
						name: 'createOrder',
						data: orderData,
						authMode: 'requireAuth'
					});

					console.log("在数据库里创建订单:", createRes.result);
					if (createRes.result.code !== 200) {
						throw new Error(createRes.result.message || '订单创建失败');
					}
					console.log("在数据库里创建订单:", createRes.result);

					// 4. 获取订单号和商户订单号
					this.orderNo = createRes.result.data.order_no;
					this.outTradeNo = createRes.result.data.out_trade_no || this.orderNo;
					this.openId = createRes.result.data.openid;
					this.orderId = createRes.result.data.order_id;

					// 5. 跳转到订单详情页
					this.navigateToOrderDetail(this.orderId, 'paying');

				} catch (e) {
					console.error('创建订单错误:', e);
					uni.showToast({
						title: e.message || '创建订单失败',
						icon: 'none'
					});
				} finally {
					this.loading = false;
				}
			},

			// 获取登录凭证 js_code
			getLoginCode() {
				return new Promise((resolve, reject) => {
					uni.login({
						provider: 'weixin',
						success: (res) => {
							resolve({
								code: res.code
							});
						},
						fail: (err) => {
							reject(new Error('登录失败: ' + err.message));
						}
					});
				});
			},

			// 导航到订单详情页
			navigateToOrderDetail(orderId, status) {
				this.updateOrderStatus(this.orderNo, 'unpaid', status);
				setTimeout(() => {
					uni.navigateTo({
						url: `/pages/order_detail/order_detail?orderId=${orderId}&status=${status}`,
						success: () => {
							console.log('成功跳转到订单详情页');
						},
						fail: (err) => {
							console.error('跳转失败:', err);
							uni.showToast({
								title: '跳转订单详情页失败',
								icon: 'none'
							});
						}
					});
				}, 500);
			},

			// 更新订单状态
			async updateOrderStatus(orderNo, fromStatus, toStatus) {
				try {
					const res = await uniCloud.callFunction({
						name: 'updateOrderStatus',
						data: {
							order_no: orderNo,
							from_status: fromStatus,
							to_status: toStatus
						}
					});

					if (res.result.code === 200 && res.result.success) {
						console.log('订单状态更新成功', res.result.data);
						return true;
					} else {
						console.error('订单状态更新失败', res.result.message);
						uni.showToast({
							title: res.result.message || '订单状态更新失败',
							icon: 'none'
						});
						return false;
					}
				} catch (e) {
					console.error('更新订单状态异常:', e);
					uni.showToast({
						title: '更新订单状态失败，请稍后重试',
						icon: 'none'
					});
					return false;
				}
			}
		}
	};
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