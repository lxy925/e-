<template>
	<view class="order-detail">
		<!-- 订单号输入区域 -->
		<view class="order-input">
			<view class="input-group">
				<text>请输入订单号：</text>
				<input type="text" v-model="orderNoInput" placeholder="请输入订单号" @confirm="queryOrderDetails" />
			</view>
			<button class="query-btn" @click="queryOrderDetails">查询订单</button>
		</view>

		<!-- 加载状态提示 -->
		<view v-if="loading" class="loading">
			<text>正在查询订单信息...</text>
		</view>

		<!-- 错误提示 -->
		<view v-if="errorMessage" class="error-message">
			<text>{{ errorMessage }}</text>
		</view>

		<!-- 订单信息展示区域 -->
		<view v-if="orderInfo && !loading && !errorMessage" class="order-info">
			<view class="order-header">
				<div>
					<text>订单号：{{ orderInfo.order_no || '未知' }}</text>
				</div>
				<div>
					<text class="status" :style="{ color: statusColor }">{{ orderInfo.status || '未知' }}</text>
				</div>
			</view>

			<!-- <view class="order-details">
				<div>
					<text>订单金额：{{ orderInfo.total_price || '未知' }}元</text>
				</div>
				<div>
					<text>支付时间：{{ orderInfo.payment_time || '未知' }}</text>
				</div>
				<div>
					<text>交易单号：{{ orderInfo.out_trade_no || '未知' }}</text>
				</div>
			</view> -->

			<!-- 退款按钮（仅在已支付状态显示） -->
			<button v-if="orderInfo.status === 'paid'" @click="refundOrder" class="refund-btn" :disabled="isRefunding">
				{{ isRefunding ? '退款处理中...' : '申请退款' }}
			</button>
		</view>
	</view>
</template>

<script>
	import api from '@/Utils/api';

	export default {
		data() {
			return {
				orderNoInput: '', // 用户输入的订单号
				orderInfo: null, // 查询到的订单信息
				loading: false, // 加载状态
				errorMessage: '', // 错误信息
				isRefunding: false, // 退款处理中状态
			};
		},
		computed: {
			statusColor() {
				return this.orderInfo?.status === 'paid' ? '#4CAF50' : '#FF5722';
			}
		},
		methods: {
			// 查询订单详情
			async queryOrderDetails() {
				// 检查订单号是否为空
				if (!this.orderNoInput.trim()) {
					this.errorMessage = '请输入有效的订单号';
					return;
				}

				this.loading = true;
				this.errorMessage = '';
				this.orderInfo = null;

				try {
					// 调用云函数查询订单信息
					const res = await uniCloud.callFunction({
						name: 'queryOrder',
						data: {
							outTradeNo: this.orderNoInput
						}
					});

					console.log(`订单查询结果:`, res);

					// // 检查返回结果
					// if (res.result && res.result.status) {
					// 	// 保存订单信息
					// 	this.orderInfo = res.result;

					// 	// 如果订单状态不是已支付，提示用户
					// 	if (res.result.status !== 'paid') {
					// 		this.errorMessage = '当前订单状态不支持退款操作';
					// 	}
					// } else {
					// 	this.errorMessage = '未找到该订单信息，请检查订单号是否正确';
					// }
				} catch (e) {
					console.error(`订单查询失败:`, e);
					this.errorMessage = '订单查询失败，请稍后重试';
				} finally {
					this.loading = false;
				}
			},

			// 申请退款
			async refundOrder() {
				// 防止重复提交
				if (this.isRefunding || !this.orderInfo) return;

				// 确认用户是否要退款
				const confirmRes = await uni.showModal({
					title: '确认退款',
					content: `您确定要对订单 ${this.orderInfo.order_no} 进行退款吗？退款金额为 ${this.orderInfo.total_price} 分`,
					confirmText: '确认退款',
					cancelText: '取消'
				});

				console.log("用户发起退款意愿：", confirmRes);
				if (!confirmRes[1].confirm) return;

				this.isRefunding = true;

				try {
					// 生成退款单号
					const outRefundNo = `RF${Date.now()}${Math.random().toString(36).substr(2, 6)}`;

					// 金额单位转换（元转分）
					const totalFee = Math.round(this.orderInfo.total_price * 1);
					const refundFee = totalFee; // 默认全额退款

					// 调用退款云函数
					const res = await uniCloud.callFunction({
						name: 'reFundPay',
						data: {
							refund_fee: refundFee,
							total_fee: totalFee,
							order_no: this.orderInfo.order_no,
							out_trade_no: this.orderInfo.out_trade_no,
							out_refund_no: outRefundNo
						}
					});

					console.log('退款结果:', res);

					if (res.result && res.result.code === 0) {
						uni.showToast({
							title: '退款申请已提交，请注意查收退款',
							icon: 'success',
							duration: 3000
						});

						// 更新订单信息
						await this.queryOrderDetails();
					} else {
						throw new Error(res.result?.msg || '退款失败');
					}
				} catch (e) {
					console.error('退款失败:', e);
					uni.showToast({
						title: `退款失败: ${e.message || '未知错误'}`,
						icon: 'none'
					});
				} finally {
					this.isRefunding = false;
				}
			}
		}
	};
</script>

<style>
	.order-detail {
		padding: 30rpx;
	}

	.order-input {
		padding: 20rpx;
		background-color: #fff;
		border-radius: 12rpx;
		margin-bottom: 30rpx;
	}

	.input-group {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.input-group text {
		width: 200rpx;
		font-size: 28rpx;
	}

	.input-group input {
		flex: 1;
		height: 80rpx;
		padding: 0 20rpx;
		border: 1rpx solid #eee;
		border-radius: 8rpx;
		font-size: 28rpx;
	}

	.query-btn,
	.refund-btn {
		width: 100%;
		height: 90rpx;
		line-height: 90rpx;
		background-color: #007aff;
		color: white;
		border-radius: 45rpx;
		font-size: 32rpx;
		text-align: center;
	}

	.loading,
	.error-message {
		padding: 40rpx;
		text-align: center;
		font-size: 30rpx;
		color: #666;
	}

	.error-message {
		color: #ff4500;
	}

	.order-info {
		background-color: #fff;
		border-radius: 12rpx;
		padding: 30rpx;
	}

	.order-header {
		padding-bottom: 20rpx;
		border-bottom: 1rpx solid #eee;
		margin-bottom: 20rpx;
	}

	.order-header div {
		margin-bottom: 15rpx;
		font-size: 28rpx;
	}

	.order-details div {
		margin-bottom: 15rpx;
		font-size: 28rpx;
		color: #333;
	}

	.status {
		font-weight: bold;
	}

	.refund-btn[disabled] {
		background-color: #cccccc;
	}
</style>