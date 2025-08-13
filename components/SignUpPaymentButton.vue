<template>
	<view class="payment-container">
		<!-- 支付按钮 -->
		<button class="payment-btn" :style="buttonStyle" :loading="loading" :disabled="disabled || loading"
			@click="handlePayment">
			<text class="btn-text">{{ buttonText }}</text>
			<view v-if="loading" class="loading-spinner"></view>
		</button>

		<!-- 支付组件 -->
		<vk-uni-pay ref="vkPay" :query-payment-action="vkPay.queryPaymentAction" :status.sync="vkPay.status"
			:code-url.sync="vkPay.codeUrl" :page-show="vkPay.pageShow" :polling="vkPay.polling"></vk-uni-pay>
	</view>
</template>

<script>
	export default {
		name: 'PaymentButton',
		props: {
			userId: {
				type: String,
				required: true
			},
			formData: {
				type: Object,
				required: true,
				default: () => ({})
			},
			selectedJobInfo: {
				type: Object,
				required: true,
				default: () => ({})
			},
			disabled: {
				type: Boolean,
				default: false
			},
			buttonText: {
				type: String,
				default: '立即支付'
			}
		},
		data() {
			return {
				loading: false,
				orderData: null,
				vkPay: {
					queryPaymentAction: {
						name: "vk-pay",
						action: "pay/queryPayment",
						actionKey: "action",
						dataKey: "data"
					},
					codeUrl: "",
					status: 0,
					pageShow: false,
					polling: true
				}
			}
		},
		computed: {
			buttonStyle() {
				return {
					background: this.disabled ? '#e0e0e0' : 'linear-gradient(90deg, #18d1c2, #00c6ff)',
					color: '#fff'
				}
			}
		},
		methods: {
			// 支付成功处理函数
			async handlePaymentSuccess(paymentRes) {
				try {
					// 1. 显示支付成功提示
					this.showToast("支付成功", "success");

					// 2. 通知父组件支付成功
					this.$emit('payment-success', paymentRes);

					// 3. 更新订单状态为"已支付"
					if (!this.orderData?.order_no) {
						console.warn('订单号不存在，无法更新状态');
						return;
					}

					const updateRes = await uniCloud.callFunction({
						name: 'updateOrderStatus',
						data: {
							order_no: this.orderData.order_no,
							from_status: 'paying',
							to_status: 'paid',
							update_data: {
								service_status: 'pending',
								payment_time: new Date().toISOString(),
								updated_time: new Date().toISOString()
							}
						}
					});

					if (updateRes.result.code !== 200) {
						console.error('更新订单状态失败:', updateRes.result.message);
						this.showToast('支付成功，订单状态更新中', 'none');
					}
				} catch (error) {
					console.error('支付成功后处理异常:', error);
					this.showToast('支付成功，请稍后查看订单', 'none');
				}
			},
			// 支付失败处理函数
			async handlePaymentFailure(error) {
				// 1. 处理错误信息
				let errMsg = '支付失败';
				if (error.failType === "create") errMsg = error.msg || '创建支付失败';
				else if (error.failType === "request") errMsg = '请求支付失败';

				// 2. 显示失败提示
				this.showToast(errMsg);

				// 3. 通知父组件支付失败
				this.$emit('payment-fail', error);

				// 4. 更新订单状态为"支付失败"
				if (this.orderData?.order_no) {
					try {
						await uniCloud.callFunction({
							name: 'updateOrderStatus',
							data: {
								order_no: this.orderData.order_no,
								from_status: 'paying',
								to_status: 'fail',
								update_data: {
									updated_time: new Date().toISOString()
								}
							}
						});
					} catch (err) {
						console.error('更新支付失败状态异常:', err);
					}
				}
			},

			// 新增：支付取消处理函数
			handlePaymentCancel() {
				// 1. 显示取消提示
				this.showToast("已取消支付");

				// 2. 通知父组件支付取消
				this.$emit('payment-cancel');

				// 3. 取消支付不更新订单状态，保持"待支付"
				console.log('用户主动取消支付，订单状态保持待支付');
			},

			getLoginCode() {
				return new Promise((resolve, reject) => {
					uni.login({
						provider: 'weixin',
						success: (res) => {
							if (res.code) {
								resolve({
									code: res.code
								});
							} else {
								reject(new Error('获取微信code失败'));
							}
						},
						fail: (err) => {
							reject(new Error(`微信登录失败: ${err.errMsg}`));
						}
					});
				});
			},

			showToast(title, icon = "none") {
				uni.showToast({
					title,
					icon,
					duration: 2000
				});
			},
			async handlePayment() {
				console.log('[PaymentButton] 支付按钮点击 - 初始状态检查');

				if (this.loading) return;
				this.loading = true;

				try {
					// 1. 表单验证
					const isValid = this.validateForm();
					if (!isValid) throw new Error('请填写完整的报名信息');

					// 2. 先创建支付订单，获取 order_no
					console.log('[PaymentButton] 开始创建支付订单...');
					const orderData = await this.createPaymentOrder();
					this.orderData = orderData;
					const orderNo = orderData.order_no; // 获取订单号
					if (!orderNo) throw new Error('创建订单失败，未获取到订单号');
					console.log('[PaymentButton] 支付订单创建成功，订单号:', orderNo);

					// 3. 创建报名记录时直接传入 order_no
					console.log('[PaymentButton] 开始创建报名记录（含订单号）...');
					await this.createSignupRecord(orderNo); // 传入订单号

					// 4. 发起支付
					console.log('[PaymentButton] 开始发起支付...');
					await this.initiatePayment(orderData);

				} catch (error) {
					console.error('[PaymentButton] 支付流程错误:', error);
					this.showToast(error.message || '支付流程出错');
					this.vkPay.pageShow = false;
				} finally {
					this.loading = false;
				}
			},

			// 修改创建报名记录的方法，接收 order_no 作为参数
			async createSignupRecord(orderNo) {
				const signupData = {
					user_id: this.userId,
					name: this.formData.name,
					idNumber: this.formData.idNumber,
					jobType: this.selectedJobInfo.jobName,
					examLevel: this.formData.examLevel,
					examType: this.formData.examType,
					auditStatus: "approved",
					createdAt: new Date(),
					auditString: "1",
					order_no: orderNo // 直接传入订单号
				};
				console.log('[PaymentButton] 创建报名记录（含订单号）:', signupData);

				const res = await uniCloud.callFunction({
					name: 'addSignup', // 复用原接口，无需新增云函数
					data: signupData
				});

				if (!res.result || res.result.code !== 0) {
					throw new Error(res.result?.msg || '创建报名记录失败');
				}
			},

			validateForm() {
				console.log('[PaymentButton] 表单验证 - 检查字段:', {
					name: !!this.formData.name,
					idNumber: !!this.formData.idNumber,
					examLevel: !!this.formData.examLevel,
					jobInfo: {
						_id: !!this.selectedJobInfo._id,
						price: this.selectedJobInfo.price,
						jobName: !!this.selectedJobInfo.jobName
					}
				});

				const requiredFields = ['name', 'idNumber', 'examLevel'];
				const fieldsValid = requiredFields.every(field => {
					const isValid = this.formData[field] && String(this.formData[field]).trim();
					console.log(`[PaymentButton] 字段 ${field} 验证:`, isValid);
					return isValid;
				});

				const jobValid = !!this.selectedJobInfo._id &&
					this.selectedJobInfo.price > 0 &&
					!!this.selectedJobInfo.jobName;
				console.log('[PaymentButton] 工种信息验证:', jobValid);

				return fieldsValid && jobValid;
			},

			async createPaymentOrder() {
				console.log('[PaymentButton] 开始获取微信登录凭证...');
				const {
					code
				} = await this.getLoginCode();
				if (!code) throw new Error('获取登录凭证失败');

				const orderData = {
					user_id: this.userId,
					total_price: this.selectedJobInfo.price,
					status: "paying",
					create_time: new Date().toISOString(),
					job_id: this.selectedJobInfo._id,
					js_code: code,
					order_type: 1
				};
				console.log('[PaymentButton] 创建支付订单数据:', orderData);

				const res = await uniCloud.callFunction({
					name: 'createSignUpOrder',
					data: orderData
				});
				console.log('[PaymentButton] 支付订单创建响应:', res);

				if (!res.result || res.result.code !== 200) {
					throw new Error(res.result?.msg || '创建支付订单失败');
				}

				return res.result.data;
			},

			async initiatePayment(orderData) {
				return new Promise((resolve, reject) => {
					this.vkPay.pageShow = true;

					this.$nextTick(() => {
						this.$refs.vkPay.createPayment({
							action: {
								name: "vk-pay",
								action: "pay/createPayment",
								actionKey: "action",
								dataKey: "data"
							},
							data: {
								provider: "wxpay",
								type: "service",
								total_fee: Math.round(this.selectedJobInfo.price * 100),
								order_no: orderData.order_no,
								out_trade_no: orderData.out_trade_no || orderData.order_no,
								subject: this.selectedJobInfo.jobName,
								body: `${this.selectedJobInfo.jobName}考试报名费`,
								openid: orderData.openid
							},
							success: (res) => {
								this.showToast("支付成功", "success");
								this.handlePaymentSuccess(res);
								resolve(res);
							},
							fail: (err) => {
								let errMsg = '支付失败';
								if (err.failType === "create") errMsg = err.msg ||
									'创建支付失败';
								else if (err.failType === "request") errMsg = '请求支付失败';
								this.showToast(errMsg);
								this.handlePaymentFailure(err);
								reject(new Error(err.errMsg || '支付失败'));
							},
							cancel: () => {
								this.showToast("已取消支付");
								this.handlePaymentCancel();
								reject(new Error('用户取消支付'));
							}
						});
					});
				});
			},
		}
	}
</script>

<style scoped>
	.payment-container {
		width: 100%;
		padding: 20rpx 0;
	}

	.payment-btn {
		width: 100%;
		height: 90rpx;
		line-height: 90rpx;
		border-radius: 45rpx;
		border: none;
		font-size: 32rpx;
		font-weight: 500;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
		box-shadow: 0 4rpx 12rpx rgba(24, 209, 194, 0.3);
		transition: all 0.2s;
	}

	.payment-btn:active {
		transform: scale(0.98);
	}

	.payment-btn[disabled] {
		opacity: 0.6;
		box-shadow: none;
	}

	.btn-text {
		letter-spacing: 1rpx;
	}

	.loading-spinner {
		width: 36rpx;
		height: 36rpx;
		margin-left: 15rpx;
		border: 3rpx solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: #fff;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>