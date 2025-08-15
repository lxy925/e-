<template>
	<view class="order-detail">
		<custom-nav :title="pageTitle" :isHomePage="false" :scrollTop="scrollTop" ref="customNav"
			:on-back="handleBack" />
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
						<div class="timer-bar" :style="{width: (100-timeProgress) + '%'}"></div>
					</div>
					<div class="action-buttons">
						<button class="btn cancel-btn" @click="cancelOrder">取消订单</button>
						<button class="btn pay-btn" @click="proceedPayment">立即支付</button>
					</div>
				</view>

				<view v-if="orderStatus === 'cancelled' || isOrderExpired" class="status-card expired-card">
					<div class="status-icon expired-icon">✖</div>
					<h3 class="status-title">订单已取消</h3>
					<p class="status-message">支付超时，订单已自动取消</p>
				</view>

				<view v-if="orderStatus === 'pay_fail' && !isOrderExpired" class="status-card failed-card">
					<div class="status-icon failed-icon">✖</div>
					<h3 class="status-title">支付失败</h3>
					<p class="status-message">请重试或联系客服</p>
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

				<!-- 打卡信息模块（从check_ins集合获取） -->
				<view class="info-section">
					<h2 class="section-title">打卡信息</h2>
					<!-- 已打卡状态：显示打卡详情 -->
					<div v-if="checkInInfo.check_in_time" class="checkin-card">
						<div class="checkin-item">
							<span class="item-label">打卡时间</span>
							<span class="item-value">{{formatDate(checkInInfo.check_in_time) || '未记录'}}</span>
						</div>
						<div class="checkin-item">
							<span class="item-label">打卡地点</span>
							<span class="item-value">
								{{checkInInfo.location && checkInInfo.location.name ? checkInInfo.location.name : (checkInInfo.location && checkInInfo.location.address ? checkInInfo.location.address : '未记录')}}
							</span>
						</div>
						<!-- <div class="checkin-item full-width">
							<span class="item-label">打卡描述</span>
							<div class="item-value full-content">
								{{checkInInfo.description || '无描述'}}
							</div>
						</div> -->
						<div v-if="checkInInfo.images && checkInInfo.images.length > 0" class="checkin-item full-width">
							<span class="item-label">打卡图片</span>
							<div class="checkin-images">
								<image v-for="(img, index) in checkInInfo.images" :key="index" :src="img"
									mode="aspectFill" class="checkin-image" @click="previewImage(img)"></image>
							</div>
						</div>
					</div>

					<!-- 未打卡状态：显示提示 -->
					<div v-else class="no-checkin-card">
						<div class="no-checkin-icon">⚠️</div>
						<p class="no-checkin-text">陪诊师尚未打卡</p>
						<p class="no-checkin-desc" v-if="orderStatus === 'paid'">服务开始后，陪诊师需在指定地点完成打卡</p>
						<p class="no-checkin-desc" v-else>服务开始时将显示打卡信息</p>
					</div>
				</view>

				<!-- 收货地址信息 -->
				<view v-if="orderInfo.include_transport" class="info-section">
					<h2 class="section-title">服务地址</h2>
					<div class="address-card">
						<view class="address-item">
							<text class="address-text">{{orderInfo.address || '未设置地址'}}</text>
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
	import order_detailVue from './order_detail.vue';

	export default {
		components: {
			'custom-nav': () => import('@/components/custom-nav/custom-nav.vue')
		},
		data() {
			return {
				prevPagePath: '',
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
				checkInInfo: {
					check_in_time: '',
					description: '',
					images: [],
					location: {
						name: '',
						address: '',
						latitude: '',
						longitude: '',
					}
				},
				timeProgress: 100,
				quantity: 1,
				deliveryAddress: '',
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
			this.getPrevPagePath();
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
		// 父组件的 onReady 生命周期
		onReady() {
			console.log('父组件中 custom-nav 的 listeners:', this.$refs.customNav.$listeners);
		},
		onShow() {
			this.getPrevPagePath();
			// 页面显示时刷新订单状态
			if (this.orderId) {
				this.loadOrderData();
			}
		},
		onUnload() {
			this.clearTimer();
		},
		methods: {
			getPrevPagePath() {
				const pages = getCurrentPages();
				if (pages.length >= 2) {
					const prevPage = pages[pages.length - 2];
					this.prevPagePath = prevPage.route;
					console.log('上一页真实路径:', this.prevPagePath); // 重点看这里输出
				}
			},
			handleBack() {
				console.log('------------------- 父组件（order_detail） -------------------');
				console.log('1. 收到 click-back 事件，进入 handleBack 方法');

				// 实时获取页面栈，不依赖 prevPagePath
				const pages = getCurrentPages();
				let prevPagePath = '';
				if (pages.length >= 2) {
					const prevPage = pages[pages.length - 2];
					prevPagePath = prevPage.route; // 实时获取上一页路径
				}

				console.log('2. 实时获取的上一页路径:', prevPagePath);
				const isFromOrderPage = prevPagePath === 'subPackageB/pages/order/order';
				console.log('3. 是否来自 order 页面:', isFromOrderPage);

				if (isFromOrderPage) {
					console.log('4. 执行跳转 → 首页');
					uni.reLaunch({
						url: '/pages/index/index', // 跳转到首页
						success: () => console.log('5. 重定向到首页成功'),
						fail: (err) => console.error('5. 重定向到首页失败:', err)
					});
				} else {
					console.log('4. 执行默认返回（uni.navigateBack）');
					uni.navigateBack();
				}
				console.log('-------------------------------------------------------');
			},
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
					//1.获取订单数据
					await this.getOrderDetails(this.orderId);

					// 2. 只有当订单信息加载成功后，才查询打卡信息
					if (this.orderInfo && this.orderInfo.order_no) {
						await this.getCheckInInfo(); // 此时调用，可直接使用 this.orderInfo.order_no
					} else {
						console.warn('订单信息中未找到 order_no，无法查询打卡信息');
						this.checkInInfo = {
							check_in_time: '',
							description: '',
							images: [],
							location: {}
						};
					}

					//3.根据订单是否支付判断是否开启定时器
					if (this.orderInfo && this.orderInfo.status === 'paying') {
						this.startTimer();
					}
				} catch (e) {
					console.error('加载订单数据异常:', e);
				} finally {
					this.isLoading = false;
				}
			},

			// 从check_ins集合获取打卡信息
			async getCheckInInfo() {
				try {
					const db = uniCloud.database();
					// 直接从 this.orderInfo 中获取订单编号（order_no）
					const orderNo = this.orderInfo.order_no;
					console.log('正在查询订单对应的打卡信息，order_no:', orderNo);

					// 用订单编号（order_no）匹配打卡信息中的 order_id
					const checkInResult = await db.collection('check_ins')
						.where({
							order_id: orderNo // 关键：用订单的 order_no 匹配打卡信息的 order_id
						})
						.get();
					console.log('打卡信息查询结果:', checkInResult);

					if (checkInResult.result && checkInResult.result.data && checkInResult.result.data.length > 0) {
						this.checkInInfo = checkInResult.result.data[0];
					} else {
						console.log('该订单暂无打卡记录');
						this.checkInInfo = {
							check_in_time: '',
							description: '',
							images: [],
							location: {}
						};
					}
				} catch (e) {
					console.error('获取打卡信息失败:', e);
				}
			},

			// 预览打卡图片
			previewImage(url) {
				uni.previewImage({
					current: url,
					urls: this.checkInInfo.images || []
				});
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

						if (serviceResult.result && serviceResult.result.data && serviceResult.result.data
							.length >
							0) {
							const serviceInfo = serviceResult.result.data[0];
							// 合并服务信息到订单信息
							orderInfo = {
								...orderInfo,
								openid: orderInfo.userid,
								include_transport: serviceInfo.include_transport,
								service_name: serviceInfo.service_name,
								service_price: serviceInfo.service_price,
								service_time: orderInfo.service_info.service_time,
								service_desc: serviceInfo.service_desc || '服务支付',

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
			// 修改 calculateTimeLeft 方法
			calculateTimeLeft() {
				if (!this.orderInfo.expire_time) {
					console.warn('订单缺少过期时间');
					this.isOrderExpired = true;
					return;
				}

				const expireTime = new Date(this.orderInfo.expire_time);
				const now = new Date();
				const diff = expireTime - now;

				// 计算总超时秒数（从当前时间到过期时间）
				const totalSeconds = Math.max(Math.floor(diff / 1000), 0);
				const initialTotalSeconds = 15 * 60; // 假设默认超时时间为15分钟

				if (diff <= 0) {
					this.isOrderExpired = true;
					this.timeLeft = '00:00:00';
					this.timeProgress = 0;
					if (this.orderStatus === 'paying') {
						this.cancelExpiredOrder();
					}
				} else {
					// 使用实际剩余秒数和初始总秒数计算进度
					this.updateTimeDisplay(totalSeconds, initialTotalSeconds);
				}
			},

			// 修改 updateTimeDisplay 方法
			updateTimeDisplay(remainingSeconds, initialTotalSeconds) {
				// 计算进度百分比
				this.timeProgress = Math.round((remainingSeconds / initialTotalSeconds) * 100);
				console.log('timeProgress 更新为:', this.timeProgress);
				// 确保进度不低于0
				if (this.timeProgress < 0) this.timeProgress = 0;

				const hours = Math.floor(remainingSeconds / 3600);
				const mins = Math.floor((remainingSeconds % 3600) / 60);
				const secs = remainingSeconds % 60;

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

						if (diff <= 0 && !this.isOrderExpired) {
							this.isOrderExpired = true;
							this.updateOrderStatus('cancelled');
						} else {
							// 重新计算剩余时间和进度
							const totalSeconds = Math.max(Math.floor(diff / 1000), 0);
							const initialTotalSeconds = 15 * 60; // 默认15分钟
							this.updateTimeDisplay(totalSeconds, initialTotalSeconds);

							// 强制更新视图（可选，用于确保进度条刷新）
							this.$forceUpdate();
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
				uni.$emit('clear-order-form-data');
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
	/* 未打卡状态样式 */
	.no-checkin-card {
		padding: 40rpx 20rpx;
		text-align: center;
		background-color: #f9f9f9;
		border-radius: 16rpx;
	}

	.no-checkin-icon {
		font-size: 60rpx;
		color: #ff9500;
		margin-bottom: 20rpx;
	}

	.no-checkin-text {
		font-size: 30rpx;
		font-weight: 500;
		color: red;
		margin-bottom: 10rpx;
	}

	.no-checkin-desc {
		font-size: 24rpx;
		color: #999;
		line-height: 1.5;
	}

	/* 打卡信息样式 */
	.checkin-card {
		margin-top: 20rpx;
	}

	.checkin-item {
		display: flex;
		justify-content: space-between;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.checkin-item:last-child {
		border-bottom: none;
	}

	.full-width {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 10rpx;
	}

	.full-content {
		width: 100%;
		text-align: left;
		line-height: 1.6;
	}

	.checkin-images {
		display: flex;
		gap: 16rpx;
		margin-top: 10rpx;
		flex-wrap: wrap;
	}

	.checkin-image {
		width: 160rpx;
		height: 160rpx;
		border-radius: 10rpx;
		object-fit: cover;
	}

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