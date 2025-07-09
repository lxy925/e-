<template>
	<view class="refund-page">
		<custom-nav title="申请退款" :isHomePage="false"></custom-nav>

		<view class="refund-container">
			<!-- 服务信息 -->
			<view class="product-info">
				<text class="product-name">{{orderInfo.service_name || '陪诊服务'}}</text>
				<text class="product-spec">服务时间：{{orderInfo.service_time || ''}}</text>
				<text class="product-spec">订单号：{{orderInfo.order_no || ''}}</text>
				<text class="product-spec">商户单号：{{orderInfo.out_trade_no || '无'}}</text>
			</view>

			<!-- 退款表单 -->
			<view class="refund-form">
				<!-- 申请类型 -->
				<view class="form-item">
					<text class="item-label">申请类型</text>
					<picker @change="bindTypeChange" :value="refundTypeIndex" :range="refundTypes">
						<view class="picker">
							{{refundType || '点击选择申请类型'}}
						</view>
					</picker>
				</view>

				<!-- 申请原因 -->
				<view class="form-item">
					<text class="item-label">申请原因</text>
					<picker @change="bindReasonChange" :value="reasonIndex" :range="reasons">
						<view class="picker">
							{{reason || '点击选择申请原因'}}
						</view>
					</picker>
				</view>

				<!-- 申请金额 -->
				<view class="form-item">
					<text class="item-label">申请金额</text>
					<view class="amount">¥{{orderInfo.total_price || '0.00'}}</view>
				</view>

				<!-- 申请说明 -->
				<view class="form-item textarea-item">
					<text class="item-label">申请说明</text>
					<textarea class="textarea" placeholder="必填，请您详细填写申请说明" v-model="description" maxlength="170"
						placeholder-class="placeholder"></textarea>
					<text class="word-count">{{description.length}}/170</text>
				</view>

				<!-- 联系电话 -->
				<view class="form-item">
					<text class="item-label">联系电话</text>
					<input type="number" class="input" placeholder="请输入联系电话" v-model="phoneNumber" />
				</view>
			</view>

			<!-- 提交按钮 -->
			<button class="submit-btn" @click="submitRefund">提交申请</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				orderInfo: {}, // 初始化为空对象，将从订单页面传入
				refundTypes: ["全额退款"],
				refundTypeIndex: 0,
				refundType: "全额退款",
				reasons: [
					"行程有变，不需要服务了",
					"服务人员联系不上",
					"找到了其他陪诊人员",
					"医院预约取消",
					"服务时间不合适",
					"其他原因"
				],
				reasonIndex: 0,
				reason: "行程有变，不需要服务了",
				description: "",
				phoneNumber: "",
				refundResult: null
			};
		},
		onLoad(options) {
			// 从订单列表页传入的订单信息
			if (options.orderInfo) {
				this.orderInfo = JSON.parse(decodeURIComponent(options.orderInfo));
				// 设置默认联系电话
				this.phoneNumber = this.orderInfo.patient_phone || "1371999999";
				console.log('加载订单信息:', this.orderInfo);
			}
		},
		methods: {
			bindTypeChange(e) {
				this.refundTypeIndex = e.detail.value;
				this.refundType = this.refundTypes[this.refundTypeIndex];
			},
			bindReasonChange(e) {
				this.reasonIndex = e.detail.value;
				this.reason = this.reasons[this.reasonIndex];
			},
			async submitRefund() {
				// 表单验证
				if (!this.refundType) return uni.showToast({
					title: '请选择申请类型',
					icon: 'none'
				});
				if (!this.reason) return uni.showToast({
					title: '请选择申请原因',
					icon: 'none'
				});
				if (!this.description) return uni.showToast({
					title: '请填写申请说明',
					icon: 'none'
				});
				if (!this.phoneNumber) return uni.showToast({
					title: '请填写联系电话',
					icon: 'none'
				});

				// 确认提交
				const confirmResult = await this.confirmSubmit();
				if (!confirmResult) return;

				uni.showLoading({
					title: '提交退款申请中...',
					mask: true
				});

				try {
					// 1. 调用微信退款接口
					const refundRes = await this.refund();
					console.log('微信退款接口响应:', refundRes);
					this.refundResult = refundRes;

					// 2. 插入退款记录
					const addRes = await this.insertRefundRecord();
					console.log('退款记录插入成功:', addRes);

					// 3. 更新订单状态为"退款中"
					const updateRes = await this.updateOrderStatus();
					console.log('订单状态更新成功:', updateRes);

					// 4. 更新退款记录状态（可选）
					if (refundRes && refundRes.result && refundRes.result.refundId) {
						await this.updateRefundStatus('success', refundRes.result);
					}

					// 操作成功
					uni.showToast({
						title: '退款申请已提交，请注意查收退款',
						icon: 'success',
						duration: 3000
					});

					setTimeout(() => {
						uni.navigateBack({
							delta: 1
						});
					}, 2000);

				} catch (e) {
					console.error('退款流程错误:', e);
					uni.showToast({
						title: e.message || '退款申请失败，请稍后重试',
						icon: 'none',
						duration: 3000
					});
				} finally {
					uni.hideLoading();
				}
			},
			// 确认提交对话框
			confirmSubmit() {
				return new Promise(resolve => {
					uni.showModal({
						title: '确认提交退款申请',
						content: `您确定要申请${this.refundType}吗？退款金额为¥${this.orderInfo.total_price}`,
						confirmText: '确认提交',
						cancelText: '返回修改',
						success: (res) => {
							resolve(res.confirm);
						}
					});
				});
			},
			// 插入退款记录
			async insertRefundRecord() {
				const refundData = {
					order_no: this.orderInfo.order_no,
					refund_type: this.refundType,
					reason: this.reason,
					amount: this.orderInfo.total_price,
					description: this.description,
					phone: this.phoneNumber,
					service_name: this.orderInfo.service_name,
					service_time: this.orderInfo.service_time,
					status: 'pending',
					create_time: new Date(),
					user_id: uni.getStorageSync('userInfo')._id || 'unknown',
					refund_api_response: this.refundResult?.result || {} // 保存API响应
				};

				const res = await uniCloud.callFunction({
					name: 'addRefundRecord',
					data: {
						refundData
					}
				});

				if (res.result.code !== 200) {
					throw new Error(res.result.message || '退款记录插入失败');
				}

				// 保存退款记录ID
				this.refundId = res.result.data.id;
				return res.result;
			},
			// 更新订单状态
			async updateOrderStatus() {
				const res = await uniCloud.callFunction({
					name: 'updateOrderStatus',
					data: {
						order_no: this.orderInfo.order_no,
						from_status: this.orderInfo.status,
						to_status: 'refunded', // 状态：已退款
						update_data: {
							service_status: 'cancelled',
							last_refund_time: Date.now(),
							refund_id: this.refundId, // 关联退款记录ID
							refund_api_response: this.refundResult?.result || {} // 保存API响应
						}
					}
				});

				if (res.result.code !== 200) {
					throw new Error(res.result.message || '订单状态更新失败');
				}

				return res.result;
			},
			// 更新退款记录状态
			async updateRefundStatus(status, refundData) {
				const res = await uniCloud.callFunction({
					name: 'updateRefundRecord',
					data: {
						refund_id: this.refundId,
						status: status,
						refund_data: refundData,
						update_time: Date.now()
					}
				});

				if (res.result.code !== 200) {
					console.warn('退款记录状态更新失败:', res.result.message);
				}

				return res.result;
			},
			// 调用微信退款接口
			async refund() {
				// 检查订单是否有out_trade_no，没有则使用order_no
				const tradeNo = this.orderInfo.out_trade_no || this.orderInfo.order_no;
				if (!tradeNo) {
					throw new Error('商户订单号不存在，无法发起退款');
				}

				// 确保金额为实际订单金额（单位：分）
				const totalFee = Math.round(this.orderInfo.total_price * 100);
				if (totalFee <= 0) {
					throw new Error('订单金额异常，无法发起退款');
				}

				return new Promise((resolve, reject) => {
					uni.showLoading({
						title: '正在处理退款...',
						mask: true
					});

					this.callFunction({
						name: "vk-pay",
						data: {
							action: "pay/refund",
							data: {
								out_trade_no: tradeNo,
								total_fee: totalFee,
								refund_fee: totalFee, // 全额退款
								out_refund_no: `REFUND_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
								reason: this.reason,
								notify_url: 'https://your-server.com/notify/refund' // 退款回调URL
							}
						},
						success: (response) => {
							console.log('微信退款API原始响应:', response);
							uni.hideLoading();

							// 关键修改：根据实际响应结构判断成功（示例：检查refundId是否存在）
							if (response.result && response.result.refundId) {
								console.log('微信退款成功:', response);
								resolve(response);
							} else if (response.result && response.result.code === 0) {
								// 备用判断：假设code=0为成功（根据实际情况调整）
								console.log('微信退款成功:', response);
								resolve(response);
							} else {
								// 处理失败情况
								const errorMsg = response.result?.message || '微信退款失败，请稍后重试';
								reject(new Error(errorMsg));
							}
						},
						fail: (err) => {
							console.error('微信退款API调用失败:', err);
							uni.hideLoading();
							reject(new Error(err.message || '微信退款接口调用失败，请稍后重试'));
						}
					});
				});
			},
			// 确保callFunction方法存在
			callFunction(options) {
				return uniCloud.callFunction(options);
			}
		}
	};
</script>

<style scoped>
	.refund-page {
		min-height: 100vh;
	}

	.refund-container {
		margin-top: 200rpx;
		padding: 20rpx;
	}

	.product-info {
		background-color: #fff;
		padding: 30rpx;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.product-name {
		font-size: 30rpx;
		color: #333;
		display: block;
		margin-bottom: 10rpx;
		font-weight: bold;
	}

	.product-spec {
		font-size: 26rpx;
		color: #666;
		display: block;
		margin-bottom: 5rpx;
	}

	.refund-form {
		background-color: #fff;
		border-radius: 12rpx;
		padding: 0 30rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.form-item {
		padding: 30rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
		display: flex;
		align-items: center;
	}

	.form-item:last-child {
		border-bottom: none;
	}

	.textarea-item {
		flex-direction: column;
		align-items: flex-start;
	}

	.item-label {
		font-size: 28rpx;
		color: #333;
		width: 180rpx;
	}

	.picker {
		flex: 1;
		font-size: 28rpx;
		color: #666;
		text-align: right;
	}

	.amount {
		flex: 1;
		font-size: 28rpx;
		color: #ff6a00;
		font-weight: bold;
		text-align: right;
	}

	.textarea {
		width: 100%;
		height: 200rpx;
		margin-top: 20rpx;
		font-size: 28rpx;
		color: #333;
		background-color: #f9f9f9;
		padding: 20rpx;
		border-radius: 8rpx;
		box-sizing: border-box;
	}

	.placeholder {
		color: #ccc;
	}

	.word-count {
		align-self: flex-end;
		font-size: 24rpx;
		color: #999;
		margin-top: 10rpx;
	}

	.input {
		flex: 1;
		font-size: 28rpx;
		color: #333;
		text-align: right;
	}

	.submit-btn {
		margin: 40rpx auto;
		background: linear-gradient(135deg, #568eff, #3a6cd9);
		color: #fff;
		border-radius: 50rpx;
		height: 90rpx;
		line-height: 90rpx;
		font-size: 32rpx;
		width: 90%;
		box-shadow: 0 4rpx 12rpx rgba(58, 108, 217, 0.3);
	}
</style>