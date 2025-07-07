<template>
	<view class="order-detail">
		<custom-nav :title="pageTitle" :isHomePage="false" :scrollTop="scrollTop" ref="customNav" />
			<scroll-view scroll-y class="page-container" @scroll="handleScroll" :style="{ 
		  paddingTop: navHeight + 'px',
		  height: 'calc(100vh - ' + navHeight + 'px)'
		}" :scroll-top="scrollTop" :show-scrollbar="false">
		

		<view class="content">
			<!-- 支付组件 -->
			<vk-uni-pay ref="vkPay" :query-payment-action="vkPay.queryPaymentAction" :status.sync="vkPay.status"
				:code-url.sync="vkPay.codeUrl" :page-show="vkPay.pageShow" :polling="vkPay.polling"></vk-uni-pay>

			<!-- 状态显示区域 -->
			<view v-if="orderStatus === 'paid'" class="status-card success-card">
				<div class="status-icon success-icon">✔</div>
				<h3 class="status-title">支付成功</h3>
				<p class="status-message">您的订单已支付完成</p>
			</view>

			<view v-if="orderStatus === 'paying' && !isOrderExpired" class="status-card pending-card">
				<div class="status-icon pending-icon">⏳</div>
				<h3 class="status-title">订单待支付</h3>
				<p class="status-message">请在{{timeLeft}}内进行支付，超时将取消</p>
				<div class="timer-progress">
					<div class="timer-bar" :style="{width: timeProgress + '%'}"></div>
				</div>
				<div class="action-buttons">
					<button class="btn cancel-btn" @click="cancelOrder">取消订单</button>
					<button class="btn pay-btn" @click="proceedPayment">立即支付</button>
				</div>
			</view>

			<view v-if="orderStatus === 'cancelled' && isOrderExpired" class="status-card expired-card">
				<div class="status-icon expired-icon">✖</div>
				<h3 class="status-title">订单已取消</h3>
				<p class="status-message">支付超时，订单已自动取消</p>
			</view>

			<view v-if="orderStatus === 'pay_fail'" class="status-card failed-card">
				<div class="status-icon failed-icon">✖</div>
				<h3 class="status-title">支付失败</h3>
				<p class="status-message">请重试或联系客服</p>
				<view class="status-illustration">
					<image src="/static/failed.svg" mode="aspectFit" class="illustration-image"></image>
				</view>
				<button class="btn retry-btn" @click="retryPayment">重试支付</button>
			</view>

			<!-- 服务信息 -->
			<view v-if="orderStatus !== 'paying' || !isOrderExpired" class="info-section">
				<h2 class="section-title">服务详情</h2>
				<div class="service-card">
					<image :src="serviceImage" mode="aspectFill" class="service-image"></image>
					<div class="service-details">
						<h3 class="service-name">{{orderInfo.service_name || '未获取到服务名称'}}</h3>
						<p class="service-desc">{{orderInfo.service_desc || '暂无服务描述'}}</p>
						<div class="service-meta">
							<span class="service-price">¥{{orderInfo.service_price || '0.00'}}</span>
							<span class="service-quantity">x{{quantity}}</span>
						</div>
					</div>
				</div>
			</view>

			<!-- 订单信息 -->
			<view v-if="orderStatus !== 'paying' || !isOrderExpired" class="info-section">
				<h2 class="section-title">订单信息</h2>
				<div class="order-card">
					<div class="order-item">
						<span class="item-label">预约时间</span>
						<span class="item-value">{{formatDate(orderInfo.service_time) || '未设置'}}</span>
					</div>
					<div class="order-item">
						<span class="item-label">订单编号</span>
						<span class="item-value">{{orderInfo.order_no || '未获取'}}</span>
					</div>
					<div class="order-item">
						<span class="item-label">下单时间</span>
						<span class="item-value">{{formatDate(orderInfo.create_time) || '未获取'}}</span>
					</div>
					<div class="order-item" v-if="orderInfo.payment_time && orderStatus === 'paid'">
						<span class="item-label">支付时间</span>
						<span class="item-value">{{formatDate(orderInfo.payment_time)}}</span>
					</div>
					<div class="order-item">
						<span class="item-label">支付状态</span>
						<span class="item-value">
							<text v-if="orderInfo.status === 'paid'" class="text-success">已支付</text>
							<text v-else-if="orderInfo.status === 'paying'" class="text-warning">待支付</text>
							<text v-else-if="orderInfo.status === 'cancelled'" class="text-danger">已取消</text>
							<text v-else>{{orderInfo.status || '未知'}}</text>
						</span>
					</div>
					<div class="order-item" v-if="orderInfo.remark">
						<span class="item-label">备注信息</span>
						<span class="item-value">{{orderInfo.remark}}</span>
					</div>
					<div class="order-item">
						<span class="item-label">支付单号</span>
						<span class="item-value">{{orderInfo.out_trade_no || '未生成'}}</span>
					</div>
					<div class="order-item">
						<span class="item-label">服务名称</span>
						<span class="item-value">{{orderInfo.service_name||'未获取'}}</span>
					</div>
				</div>
			</view>

			<!-- 收货地址信息 -->
			<view v-if="orderStatus !== 'paying' || !isOrderExpired" class="info-section">
				<h2 class="section-title">收货地址</h2>
				<div class="address-card">
					<view class="address-item">
						<text class="address-text">{{deliveryAddress || '未设置地址'}}</text>
					</view>
				</div>
			</view>

			<!-- 费用明细 -->
			<view v-if="orderStatus !== 'paying' || !isOrderExpired" class="info-section">
				<h2 class="section-title">费用明细</h2>
				<div class="fee-card">
					<div class="fee-item">
						<span class="fee-label">服务费用</span>
						<span class="fee-value">¥{{orderInfo.service_price || '0.00'}}</span>
					</div>
					<div class="fee-item">
						<span class="fee-label">数量</span>
						<span class="fee-value">{{quantity}}件</span>
					</div>
					<div class="fee-divider"></div>
					<div class="fee-item total-fee">
						<span class="fee-label">实付总计</span>
						<span class="fee-value total-price">¥{{totalAmount || '0.00'}}</span>
					</div>
				</div>
			</view>
		</view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		components: {
			'custom-nav': () => import('@/components/custom-nav/custom-nav.vue')
		},
		data() {
			return {
				navHeight: 0, // 添加导航栏高度存储
				pageTitle: '服务详情',
				scrollTop: 0,
				orderId: '684b07d055b33785618444cc',
				orderInfo: {
					order_no: 'ORD1749747664843887',
					service_name: '',
					service_price: '',
					service_time: '',
					create_time: '',
					status: 'unpaid',
					expire_time: '',
					out_trade_no: '',
					openid: '',
					total_price: 0,
					service_id: '',
					service_desc: '',
					service_status: '',
				},
				timeLeft: '00:15:00',
				timeProgress: 100,
				quantity: 1,
				deliveryAddress: '火箭联邦学府华夏学院黄龙公寓101',
				serviceImage: '/static/service-default.png',
				timer: null,
				isOrderExpired: false,
				vkPay: {
					status: 0,
					queryPaymentAction: {
						name: "vk-pay",
						action: "pay/queryPayment"
					}
				},
				paymentLoading: false,
				isLoading: false // 添加全局加载状态
			};
		},
		computed: {
			totalAmount() {
				return (this.orderInfo.service_price || 0) * this.quantity;
			},
			orderStatus() {
				return this.orderInfo.status || 'paying';
			}
		},
		onLoad(options) {
			const systemInfo = uni.getSystemInfoSync();
			this.navHeight = systemInfo.statusBarHeight + 44;
			console.log('接收到的订单参数:', options);

			if (options && options.orderId) {
				this.orderId = options.orderId;
				this.loadOrderData();
			} else {
				console.error('订单ID缺失', options);
				uni.showToast({
					title: '订单参数错误',
					icon: 'none'
				});
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			}
		},
		onShow() {
			// 页面显示时刷新订单状态
			if (this.orderId) {
				this.loadOrderData();
			}
		},
		onUnload() {
			this.clearTimer();
		},
		methods: {
			//监视页面滚动情况
			handleScroll(e) {
				if (this.scrollTimer) clearTimeout(this.scrollTimer)
				this.scrollTimer = setTimeout(() => {
					this.scrollTop = e.detail.scrollTop
				}, 16) // 约60fps
			},
			// 统一的订单数据加载方法
			async loadOrderData() {
				try {
					this.isLoading = true;
					await this.getOrderDetails(this.orderId);
					this.startTimer();
				} catch (e) {
					console.error('加载订单数据异常:', e);
				} finally {
					this.isLoading = false;
				}
			},

			async getOrderDetails(orderId) {
				try {
					const db = uniCloud.database();
					console.log('正在查询订单:', orderId);

					// 查询订单数据
					const orderResult = await db.collection('orders')
						.doc(orderId)
						.get();
					console.log('订单数据查询结果:', JSON.stringify(orderResult, null, 2));

					if (orderResult.result && orderResult.result.data && orderResult.result.data.length > 0) {
						let orderInfo = orderResult.result.data[0];
						// 根据订单中的 service_id 查询服务基础信息
						const serviceResult = await db.collection('services')
							.where({
								service_id: orderInfo.service_id
							})
							.get();
						console.log('服务信息查询结果:', serviceResult);

						if (serviceResult.result && serviceResult.result.data && serviceResult.result.data.length >
							0) {
							const serviceInfo = serviceResult.result.data[0];
							// 合并服务信息到订单信息
							orderInfo = {
								...orderInfo,
								openid: orderInfo.userid,
								service_name: serviceInfo.service_name,
								service_price: serviceInfo.service_price,
								service_time: serviceInfo.service_time,
								service_desc: serviceInfo.service_desc || '服务支付'
							};
						} else {
							console.warn('未查询到对应服务信息，service_id:', orderInfo.service_id);
							// 设置默认值
							orderInfo.service_name = '默认服务名称';
							orderInfo.service_price = 0;
							orderInfo.service_time = '';
							orderInfo.service_desc = '服务支付';
						}
						this.orderInfo = orderInfo;
						console.log('合并后订单数据:', this.orderInfo);
						this.calculateTimeLeft();
					} else {
						console.warn('订单不存在:', orderId);
						uni.showToast({
							title: '订单不存在或已删除',
							icon: 'none'
						});
					}
				} catch (e) {
					console.error('获取订单失败:', e);
					uni.showToast({
						title: '查询失败: ' + e.message,
						icon: 'none'
					});
				}
			},
			formatDate(dateStr) {
				if (!dateStr) return '';
				const date = new Date(dateStr);
				return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
			},
			calculateTimeLeft() {
				if (!this.orderInfo.expire_time) {
					console.warn('订单缺少过期时间');
					this.isOrderExpired = true;
					return;
				}

				// 确保时间格式兼容
				const expireTime = new Date(this.orderInfo.expire_time);
				if (isNaN(expireTime.getTime())) {
					console.error('无效的过期时间格式:', this.orderInfo.expire_time);
					this.isOrderExpired = true;
					return;
				}

				const now = new Date();
				const diff = expireTime - now;
				const totalMinutes = 15 * 60; // 假设默认超时时间为15分钟

				if (diff <= 0) {
					this.isOrderExpired = true;
					this.timeLeft = '00:00:00';
					this.timeProgress = 0;
					if (this.orderStatus === 'paying') {
						this.cancelExpiredOrder();
					}
				} else {
					this.updateTimeDisplay(diff, totalMinutes);
				}
			},
			updateTimeDisplay(milliseconds, totalMinutes) {
				if (milliseconds <= 0) {
					this.timeLeft = '00:00:00';
					this.timeProgress = 0;
					this.isOrderExpired = true;
					return;
				}

				const seconds = Math.floor(milliseconds / 1000);
				const totalSeconds = totalMinutes * 60;
				const remainingSeconds = seconds;
				// 计算进度百分比
				this.timeProgress = Math.round((remainingSeconds / totalSeconds) * 100);

				// 确保进度不低于0
				if (this.timeProgress < 0) this.timeProgress = 0;

				const hours = Math.floor(seconds / 3600);
				const mins = Math.floor((seconds % 3600) / 60);
				const secs = seconds % 60;

				this.timeLeft =
					`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
			},
			startTimer() {
				this.clearTimer();
				this.timer = setInterval(() => {
					if (this.orderInfo.expire_time) {
						const expireTime = new Date(this.orderInfo.expire_time);
						const now = new Date();
						const diff = expireTime - now;
						const totalMinutes = 15; // 假设默认超时时间为15分钟
						this.updateTimeDisplay(diff, totalMinutes * 60);

						// 检查是否过期
						if (diff <= 0 && !this.isOrderExpired) {
							this.isOrderExpired = true;
							this.updateOrderStatus('cancelled');
						}
					}
				}, 1000);
			},
			clearTimer() {
				if (this.timer) {
					clearInterval(this.timer);
					this.timer = null;
				}
			},
			async updateOrderStatus(newStatus) {
				try {
					// 确保订单信息已加载
					if (!this.orderInfo.order_no) {
						await this.getOrderDetails(this.orderId);
					}

					// 检查订单号是否存在
					if (!this.orderInfo.order_no) {
						console.error('订单号不存在，无法更新状态');
						uni.showToast({
							title: '订单信息错误，无法更新状态',
							icon: 'none'
						});
						return false;
					}

					// 构建更新数据
					const updateData = {
						status: newStatus,
						updated_time: new Date(),
						audit_status: 'unreviewed',
					};

					// 根据新状态设置 service_status
					if (newStatus === 'cancelled') {
						updateData.service_status = 'cancelled';
					} else if (newStatus === 'paid') {
						updateData.service_status = 'pending';
					}
					// 其他状态不设置 service_status

					// 如果更新为已支付状态，添加支付时间
					if (newStatus === 'paid') {
						updateData.payment_time = new Date();
					}

					const res = await uniCloud.callFunction({
						name: 'updateOrderStatus',
						data: {
							order_no: this.orderInfo.order_no,
							from_status: this.orderInfo.status,
							to_status: newStatus,
							update_data: updateData, // 传递更新数据
						}
					});

					if (res.result.code === 200) {
						console.log('订单状态更新成功');
						// 刷新订单信息
						this.getOrderDetails(this.orderId);
						return true;
					} else {
						console.error('订单状态更新失败:', res.result.message);
						uni.showToast({
							title: res.result.message || '更新失败',
							icon: 'none'
						});
						return false;
					}
				} catch (e) {
					console.error('更新订单状态异常:', e);
					uni.showToast({
						title: '更新失败，请稍后重试',
						icon: 'none'
					});
					return false;
				}
			},
			cancelExpiredOrder() {
				this.updateOrderStatus('cancelled');
			},
			cancelOrder() {
				uni.showModal({
					title: '提示',
					content: '确定要取消订单吗？',
					success: (res) => {
						if (res.confirm) {
							this.updateOrderStatus('cancelled');
						}
					}
				});
			},
			async proceedPayment() {
				if (this.isOrderExpired) {
					uni.showToast({
						title: '订单已过期',
						icon: 'none'
					});
					return;
				}

				if (this.paymentLoading) return;
				this.paymentLoading = true;

				try {
					// 验证必要的支付参数
					if (!this.orderInfo.order_no) {
						throw new Error('订单号不存在，无法支付');
					}
					if (!this.orderInfo.out_trade_no) {
						throw new Error('支付单号不存在，无法支付');
					}
					if (!this.orderInfo.total_price && !this.orderInfo.service_price) {
						throw new Error('支付金额错误，无法支付');
					}
					if (!this.orderInfo.user_id) {
						throw new Error('用户信息错误，无法支付');
					}

					uni.showLoading({
						title: '准备支付...'
					});

					// 调用支付组件
					this.$refs.vkPay.createPayment({
						action: {
							name: "vk-pay",
							action: "pay/createPayment"
						},
						data: {
							provider: "wxpay",
							type: "service",
							total_fee: Math.round((this.orderInfo.total_price || this.orderInfo
								.service_price) * 100), // 单位：分
							order_no: this.orderInfo.order_no,
							out_trade_no: this.orderInfo.out_trade_no,
							subject: this.orderInfo.service_name,
							body: this.orderInfo.service_desc,
							openid: this.orderInfo.openid,
							service_info: {
								order_id: this.orderId,
								service_id: this.orderInfo.service_id
							}
						},
						success: () => this.handlePaymentSuccess(),
						fail: (res) => this.handlePaymentFailure(res.msg || '支付失败'),
						cancel: () => this.handlePaymentCancel()
					});

				} catch (e) {
					console.error('支付错误:', e);
					uni.showToast({
						title: e.message || '支付准备失败',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
					this.paymentLoading = false;
				}
			},

			// 处理支付成功
			async handlePaymentSuccess() {
				uni.showToast({
					title: '支付成功',
					icon: 'success'
				});
				await this.updateOrderStatus('paid');
			},

			// 处理支付失败
			handlePaymentFailure(message) {
				uni.showToast({
					title: message,
					icon: 'none'
				});
				// 更新订单状态为支付失败
				this.updateOrderStatus('pay_fail');
			},

			// 处理支付取消
			handlePaymentCancel() {
				uni.showToast({
					title: '已取消支付',
					icon: 'none'
				});
			},

			retryPayment() {
				// 重试支付逻辑
				this.proceedPayment();
			}
		}
	};
</script>

<style>

	.page-container {
		min-height: 100vh;
		position: relative;
		
		
		margin: 0;
		width: 100%;
		box-sizing: border-box;
		/* 关键：让 width 包含 padding */
		-webkit-overflow-scrolling: touch;
		/* 平滑滚动 */
		scrollbar-width: none;
		/* Firefox */
	}
	
	.page-container ::-webkit-scrollbar {
		display: none;
		/* Chrome/Safari */
		width: 0 !important;
		/* 微信小程序可能需要 */
		height: 0 !important;
	}
	

	/* 基础布局样式 */
	.order-detail {
		height: 100vh;
	}

	/* 导航栏占位元素 */
	.nav-placeholder {
		height: 88rpx;
		/* 与导航栏高度一致 */
	}

	/* 状态卡片样式 */
	.status-card {
		background-color: #fff;
		border-radius: 20rpx;
		margin: 30rpx 20rpx;
		padding: 40rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
		transition: all 0.3s ease;
	}

	.status-card:hover {
		box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
		transform: translateY(-2rpx);
	}

	.status-icon {
		font-size: 80rpx;
		margin-bottom: 20rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		margin: 0 auto 30rpx;
	}

	.success-icon {
		background-color: rgba(76, 217, 100, 0.1);
		color: #4cd964;
	}

	.pending-icon {
		background-color: rgba(21, 203, 188, 0.1);
		color: #15cbbc;
	}

	.expired-icon,
	.failed-icon {
		background-color: rgba(255, 77, 79, 0.1);
		color: #ff4d4f;
	}

	.status-title {
		font-size: 36rpx;
		font-weight: bold;
		text-align: center;
		margin-bottom: 10rpx;
		color: #333;
	}

	.status-message {
		font-size: 28rpx;
		color: #666;
		text-align: center;
		margin-bottom: 40rpx;
	}

	.status-illustration {
		margin-top: 30rpx;
		height: 200rpx;
		display: flex;
		justify-content: center;
	}

	.illustration-image {
		max-height: 100%;
		max-width: 100%;
	}

	/* 待支付状态特殊样式 */
	.pending-card .status-icon {
		font-size: 60rpx;
	}

	.timer-progress {
		height: 8rpx;
		background-color: #f0f0f0;
		border-radius: 4rpx;
		margin: 30rpx 0;
		overflow: hidden;
	}

	.timer-bar {
		height: 100%;
		background-color: #15cbbc;
		width: 100%;
		border-radius: 4rpx;
		transition: width 1s ease;
	}

	.action-buttons {
		display: flex;
		justify-content: center;
		gap: 20rpx;
		margin-top: 30rpx;
	}

	/* 按钮样式 */
	.btn {
		padding: 18rpx 40rpx;
		border-radius: 36rpx;
		font-size: 28rpx;
		font-weight: 500;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.cancel-btn {
		background-color: #fff;
		color: #666;
		border: 1rpx solid #ddd;
	}

	.cancel-btn:hover {
		background-color: #f5f5f5;
	}

	.pay-btn {
		background-color: #15cbbc;
		color: #fff;
	}

	.pay-btn:hover {
		background-color: #0fb9a8;
		transform: scale(1.02);
	}

	.retry-btn {
		background-color: #15cbbc;
		color: #fff;
		width: 100%;
		max-width: 200rpx;
		margin: 0 auto;
	}

	.retry-btn:hover {
		background-color: #0fb9a8;
	}

	/* 信息区块样式 */
	.info-section {
		background-color: #fff;
		border-radius: 20rpx;
		margin: 0 20rpx 30rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 30rpx;
		position: relative;
		padding-left: 20rpx;
	}

	.section-title::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 8rpx;
		height: 32rpx;
		background-color: #15cbbc;
		border-radius: 4rpx;
	}

	/* 服务详情卡片 */
	.service-card {
		display: flex;
		background-color: #f9f9f9;
		border-radius: 16rpx;
		overflow: hidden;
	}

	.service-image {
		width: 180rpx;
		height: 180rpx;
	}

	.service-details {
		padding: 20rpx;
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.service-name {
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 10rpx;
	}

	.service-desc {
		font-size: 24rpx;
		color: #666;
		margin-bottom: 20rpx;
		line-height: 1.5;
	}

	.service-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.service-price {
		font-size: 32rpx;
		font-weight: bold;
		color: #ff3b30;
	}

	.service-quantity {
		font-size: 24rpx;
		color: #999;
		background-color: #f0f0f0;
		padding: 6rpx 16rpx;
		border-radius: 30rpx;
	}

	/* 订单信息卡片 */
	.order-card {
		margin-top: 20rpx;
	}

	.order-item {
		display: flex;
		justify-content: space-between;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.order-item:last-child {
		border-bottom: none;
	}

	.item-label {
		font-size: 28rpx;
		color: #666;
	}

	.item-value {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
	}

	/* 支付状态颜色 */
	.text-success {
		color: #4cd964;
	}

	.text-warning {
		color: #ff9500;
	}

	.text-danger {
		color: #ff4d4f;
	}

	/* 地址卡片样式 */
	.address-card {
		margin-top: 20rpx;
		background-color: #f9f9f9;
		border-radius: 16rpx;
		padding: 20rpx;
	}

	.address-item {
		display: flex;
		align-items: center;
	}

	.address-text {
		font-size: 28rpx;
		color: #333;
	}

	/* 费用明细卡片 */
	.fee-card {
		margin-top: 20rpx;
	}

	.fee-item {
		display: flex;
		justify-content: space-between;
		padding: 16rpx 0;
		font-size: 28rpx;
		color: #666;
	}

	.fee-divider {
		height: 1rpx;
		background-color: #f0f0f0;
		margin: 10rpx 0;
	}

	.total-fee {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
	}

	.total-price {
		color: #ff3b30;
	}

	/* 状态卡片颜色定义 */
	.success-card {
		border-top: 6rpx solid #4cd964;
	}

	.pending-card {
		border-top: 6rpx solid #15cbbc;
	}

	.expired-card,
	.failed-card {
		border-top: 6rpx solid #ff4d4f;
	}
</style>