<template>
	<view class="page">
		<custom-nav title="e陪无忧" :isHomePage="false" class="nav"></custom-nav>
		<view class="container">
			<!-- 固定头部区域 -->
			<view class="fixed-header">
				<!-- 搜索、筛选等 -->
				<view class="header">
					<view class="search-container">
						<input class="search-input" placeholder="请输入交易名称" v-model="searchQuery"
							@confirm="handleSearch" />
						<image src="../../static/images/order/icon_4.png" class="search-icon" />
					</view>
					<!-- <view class="filter-container" @click="showFilter = true">
						<image src="../../static/images/order/icon_5.png" class="filter-icon" />
						<text class="filter-text">筛选</text>
						<view class="notification" v-if="filterCount > 0">{{ filterCount }}</view>
					</view> -->
				</view>

				<!-- 标签切换 -->
				<view class="tabs">
					<text v-for="(tab, index) in tabs" :key="index"
						:class="{'tab': true, 'active': currentTab === index}"
						@click="selectTab(index)">{{ tab.label }}</text>
				</view>
			</view>

			<!-- 可滚动内容区域 -->
			<scroll-view class="content" scroll-y :style="{height: scrollHeight + 'px'}" @scrolltolower="loadMore"
				:scroll-with-animation="true">
				<!-- 有数据时展示订单列表 -->
				<view v-if="filteredOrders.length > 0">
					<view class="order-card" v-for="(order, index) in filteredOrders" :key="order.order_no"
						@click="viewOrderDetail(order)">
						<view class="card-header">
							<text class="order-no">订单号：{{ order.order_no }}</text>
							<text :class="['order-status', getStatusClass(order)]">
								{{ formatStatus(order) }}
							</text>
						</view>

						<view class="card-body">
							<view class="service-info">
								<view class="service-icon">
									<image src="../../static/images/order/service-icon.png" mode="aspectFit" />
								</view>
								<view class="service-details">
									<text class="service-name">{{ order.service_name || '未命名服务' }}</text>
									<text class="service-id">服务ID: {{ order.service_id }}</text>
								</view>
							</view>

							<view class="order-meta">
								<view class="meta-item">
									<text class="meta-label">金额</text>
									<text class="meta-value price-value">¥{{ order.total_price }}</text>
								</view>
								<view class="meta-item">
									<text class="meta-label">服务时长</text>
									<text class="meta-value">{{ order.duration || '2小时' }}</text>
								</view>
								<!-- 新增退款金额显示 -->
								<view class="meta-item" v-if="order.refund_amount">
									<text class="meta-label">退款金额</text>
									<text class="meta-value refund-value">¥{{ order.refund_amount }}</text>
								</view>
							</view>
						</view>

						<view class="card-footer">
							<!-- 支付成功的订单显示退款按钮 -->
							<button class="action-btn btn-refund" @click.stop="applyRefund(order)"
								v-if="order.status === 'paid'">
								申请退款
							</button>

							<!-- 非支付成功的订单显示删除按钮 -->
							<button class="action-btn btn-delete" @click.stop="deleteOrder(order)"
								v-if="order.status !== 'paid'">
								删除订单
							</button>

							<!-- 所有订单都显示详情按钮 -->
							<button class="action-btn btn-detail" @click.stop="viewOrderDetail(order)">
								查看详情
							</button>
						</view>
					</view>

					<!-- 加载更多提示 -->
					<view class="load-more" v-if="hasMore">
						<text>{{ loading ? '加载中...' : '上拉加载更多' }}</text>
					</view>
					<view class="no-more" v-else>
						<text>没有更多数据了</text>
					</view>
				</view>

				<!-- 无数据时展示空状态 -->
				<view v-else class="empty-state">
					<image src="../../static/images/order/img_1.png" class="empty-image" />
					<text class="empty-text">暂无订单数据~</text>
				</view>
			</scroll-view>
		</view>

		<!-- 自定义筛选弹窗 -->
		<view class="custom-popup-mask" v-if="showFilter" @click="showFilter = false" @touchmove.stop.prevent>
			<view class="custom-popup-container" @click.stop>
				<view class="custom-popup-header">
					<text class="custom-popup-title">筛选订单</text>
					<text class="custom-popup-close" @click="showFilter = false">×</text>
				</view>

				<view class="custom-popup-body">
					<view class="filter-section">
						<text class="section-title">订单状态</text>
						<view class="filter-tags">
							<text v-for="(tab, index) in tabs" :key="index"
								:class="['filter-tag', {'active': activeStatus === tab.value}]"
								@click="activeStatus = tab.value">
								{{ tab.label }}
							</text>
						</view>
					</view>
				</view>

				<view class="custom-popup-footer">
					<button class="custom-reset-btn" @click="resetFilter">重置</button>
					<button class="custom-confirm-btn" @click="confirmFilter">确定</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'OrderList',
		data() {
			return {
				currentTab: 0,
				tabs: [{
						label: '全部',
						value: 'all'
					},
					{
						label: '待服务',
						value: 'pending'
					},
					{
						label: '进行中',
						value: 'processing'
					},
					{
						label: '已完成',
						value: 'completed'
					},
					{
						label: '已取消',
						value: 'canceled'
					}
				],
				orderList: [],
				scrollHeight: 0,
				searchQuery: '',
				showFilter: false,
				filterCount: 0,
				activeStatus: 'all',
				pageSize: 10,
				currentPage: 1,
				hasMore: true,
				loading: false
			};
		},
		computed: {
			filteredOrders() {
				let result = [...this.orderList];

				// 简化标签页筛选逻辑
				if (this.currentTab > 0) {
					const tabValue = this.tabs[this.currentTab].value;

					switch (tabValue) {
						case 'pending':
							result = result.filter(order =>
								order.status === 'paid' &&
								order.service_status === 'pending'
							);
							break;

						case 'processing':
							result = result.filter(order =>
								order.status === 'paid' &&
								order.service_status === 'processing'
							);
							break;

						case 'completed':
							result = result.filter(order =>
								order.service_status === 'completed'
							);
							break;

						case 'canceled':
							result = result.filter(order =>
								// 支付失败
								order.status === 'pay_fail' ||

								// 服务被取消
								order.service_status === 'cancelled' ||

								// 订单被取消
								order.status === 'cancelled' ||

								// 退款中或已退款
								order.status === 'refunding' ||
								order.status === 'refunded'
							);
							break;
					}
				}

				// 根据搜索关键词筛选
				if (this.searchQuery) {
					const query = this.searchQuery.toLowerCase();
					result = result.filter(order =>
						(order.service_name && order.service_name.toLowerCase().includes(query)) ||
						(order.order_no && order.order_no.toLowerCase().includes(query)));
				}

				// 应用筛选条件
				if (this.activeStatus && this.activeStatus !== 'all') {
					result = result.filter(order => {
						if (this.activeStatus === 'canceled') {
							return (order.status === 'paid' && order.service_status === 'cancelled') ||
								order.status === 'pay_fail';
						}
						return order.status === this.activeStatus;
					});
				}

				return result;
			}
		},
		onLoad() {
			this.getOrderList(); // 全局错误捕获（定位隐藏的异常）
			uni.onError((err) => {
				console.error('全局错误捕获:', err);
				uni.showToast({
					title: '操作异常，请稍后重试',
					icon: 'none'
				});
			});
		},
		onReady() {
			this.calculateScrollHeight();
		},
		onShow() {
			setTimeout(() => this.calculateScrollHeight(), 100);
		},
		methods: {

			// 删除订单方法
			deleteOrder(order) {
				uni.showModal({
					title: '删除订单',
					content: `确定要删除订单 ${order.order_no} 吗？`,
					success: async (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '删除中...'
							});
							try {
								const db = uniCloud.database();
								await db.collection('orders').doc(order._id).remove();

								// 从本地列表移除
								this.orderList = this.orderList.filter(item => item._id !== order._id);

								uni.showToast({
									title: '删除成功',
									icon: 'success'
								});
							} catch (e) {
								uni.showToast({
									title: '删除失败',
									icon: 'none'
								});
							} finally {
								uni.hideLoading();
							}
						}
					}
				});
			},

			// 退款方法（仅限paid状态）
			applyRefund(order) {
				// 严格检查退款条件：已支付且待服务状态
				if (order.status !== 'paid' || order.service_status !== 'pending') {
					uni.showToast({
						title: order.status !== 'paid' ? '订单未支付，无法退款' : '订单已服务，无法退款',
						icon: 'none',
						duration: 2000
					});
					return;
				}
				// 跳转到退款页面并传递订单数据
				uni.navigateTo({
					url: `/pages/refund/refund?orderInfo=${encodeURIComponent(JSON.stringify(order))}`
				});
			},


			// 处理退款逻辑
			// async processRefund(order) {
			// 	uni.showLoading({
			// 		title: '处理中...'
			// 	});
			// 	try {
			// 		const db = uniCloud.database();
			// 		await db.collection('orders').doc(order._id).update({
			// 			status: 'refunding',
			// 			refund_apply_time: Date.now()
			// 		});

			// 		// 更新本地数据
			// 		const index = this.orderList.findIndex(item => item._id === order._id);
			// 		if (index !== -1) {
			// 			this.$set(this.orderList[index], 'status', 'refunding');
			// 		}

			// 		uni.showToast({
			// 			title: '退款申请已提交',
			// 			icon: 'success'
			// 		});
			// 	} catch (e) {
			// 		uni.showToast({
			// 			title: '退款申请失败',
			// 			icon: 'none'
			// 		});
			// 	} finally {
			// 		uni.hideLoading();
			// 	}
			// },
			// 修改状态格式化方法
			formatStatus(order) {
				// 1. 服务完成时显示审核状态
				if (order.service_status === "completed" && order.audit_status) {
					const auditMap = {
						'unreviewed': '未审核',
						'pending_review': '审核中',
						'approved': '审核通过',
						'rejected': '审核拒绝'
					};
					return auditMap[order.audit_status] || order.audit_status;
				}

				// 2. 已支付订单显示服务状态
				if (order.status === "paid" && order.service_status) {
					const serviceMap = {
						'pending': '待服务',
						'processing': '进行中',
						'completed': '已完成',
						'cancelled': '已取消' // 修正服务状态取消的显示
					};
					return serviceMap[order.service_status] || order.service_status;
				}

				// 3. 其他情况显示支付状态
				const paymentMap = {
					'paid': '已支付', // 修改为"已支付"更准确
					'unpaid': '未支付',
					'paying': '支付中',
					'pay_fail': '支付失败',
					'cancelled': '已取消', // 添加取消状态
					'refunding': '退款中',
					'refunded': '已退款'
				};
				return paymentMap[order.status] || order.status;
			},

			getStatusClass(order) {
				// 1. 服务完成时显示审核状态
				if (order.service_status === "completed" && order.audit_status) {
					return `audit-${order.audit_status}`;
				}

				// 2. 已支付订单显示服务状态
				if (order.status === "paid" && order.service_status) {
					return `service-${order.service_status}`;
				}

				// 3. 其他情况显示支付状态
				return `payment-${order.status}`;
			},

			selectTab(index) {
				this.currentTab = index;
				this.currentPage = 1; // 切换标签时重置页码
				this.getOrderList();
			},
			async getOrderList() {
				if (this.loading) return;

				this.loading = true;
				uni.showLoading({
					title: '加载中...'
				});

				try {
					const db = uniCloud.database();
					let query = db.collection('orders');

					// 重构查询逻辑 - 更灵活的标签分类
					if (this.currentTab > 0) {
						const tabValue = this.tabs[this.currentTab].value;

						// 使用更灵活的查询条件
						switch (tabValue) {
							case 'pending':
								// 待服务：已支付且服务状态为待服务
								query = query.where({
									status: 'paid',
									service_status: 'pending'
								});
								break;

							case 'processing':
								// 进行中：已支付且服务状态为进行中
								query = query.where({
									status: 'paid',
									service_status: 'processing'
								});
								break;

							case 'completed':
								// 已完成：服务状态为已完成（无论审核状态如何）
								query = query.where({
									service_status: 'completed'
								});
								break;

							case 'canceled':
								// 已取消：更广泛的取消状态定义
								query = query.where({
									'$or': [
										// 支付失败
										{
											status: 'pay_fail'
										},

										// 服务被取消
										{
											service_status: 'cancelled'
										},

										// 订单被取消
										{
											status: 'cancelled'
										},

										// 退款中或已退款
										{
											status: 'refunding'
										},
										{
											status: 'refunded'
										}
									]
								});
								break;
						}
					}

					// 添加排序，最新订单在前
					query = query.orderBy('create_time', 'desc');
					console.log('最终查询命令:', JSON.stringify(query.getParam(), null, 2));
					const res = await query
						.orderBy('create_time', 'desc')
						.skip((this.currentPage - 1) * this.pageSize)
						.limit(this.pageSize)
						.get();

					console.log('原始查询结果:', res); // 调试日志

					if (res.result.data && res.result.data.length > 0) {
						// 关键修复：直接使用res.result.data而不是processedData
						const dataToRender = res.result.data.map(item => ({
							...item,
							// 确保字段兼容
							service_status: item.service_status || null,
							// 添加服务时长默认值
							duration: item.duration || '2小时'
						}));

						console.log('渲染数据:', dataToRender); // 调试日志

						if (this.currentPage === 1) {
							this.orderList = dataToRender;
						} else {
							this.orderList = [...this.orderList, ...dataToRender];
						}
						this.hasMore = res.result.data.length >= this.pageSize;
					} else {
						this.hasMore = false;
						if (this.currentPage === 1) {
							this.orderList = [];
						}
					}

					// 获取服务信息（确保不覆盖已有数据）
					await this.fetchServiceInfo(false);

				} catch (error) {
					console.error('查询订单异常:', error);
					uni.showToast({
						title: '查询订单异常，请稍后重试',
						icon: 'none'
					});
				} finally {
					this.loading = false;
					uni.hideLoading();
				}
			},
			async fetchServiceInfo(overwrite = true) {
				try {
					const serviceIds = [...new Set(
						this.orderList
						.filter(order => order.service_id)
						.map(order => order.service_id)
					)];

					if (serviceIds.length === 0) return;

					const db = uniCloud.database();
					const servicesRes = await db.collection('services')
						.where({
							service_id: db.command.in(serviceIds)
						})
						.get();

					if (servicesRes.result.data) {
						const servicesMap = {};
						servicesRes.result.data.forEach(s => {
							servicesMap[s.service_id] = s;
						});

						// 关键修改：不覆盖已有数据
						this.orderList = this.orderList.map(order => {
							const service = servicesMap[order.service_id] || {};
							return {
								...order, // 保留原始数据
								service_name: order.service_name || service.service_name || '未知服务',
								service_price: order.service_price || service.service_price || 0
							};
						});
					}
				} catch (e) {
					console.error('获取服务信息失败:', e);
				}
			},
			calculateScrollHeight() {
				const query = uni.createSelectorQuery().in(this);
				query.select('.fixed-header').boundingClientRect(data => {
					const systemInfo = uni.getSystemInfoSync();
					this.scrollHeight = systemInfo.windowHeight - (data ? data.height : 180);
				}).exec();
			},
			processRefund(orderNo) {
				const index = this.orderList.findIndex(order => order.order_no === orderNo);
				if (index !== -1) {
					const refundAmount = (this.orderList[index].service_price * 0.8).toFixed(2);
					this.$set(this.orderList[index], 'refund_amount', refundAmount);
					this.$set(this.orderList[index], 'refund_status', 'processing');
					this.$set(this.orderList[index], 'status', 'canceled');
				}
			},
			viewRefundDetail(order) {
				uni.navigateTo({
					url: `/pages/order/refundDetail?id=${order.order_no}`
				});
			},
			viewOrderDetail(order) {
				// 校验订单数据完整性
				if (!order.order_no) {
					uni.showToast({
						title: '订单信息异常',
						icon: 'none'
					});
					return;
				}

				console.log('查看订单详情，订单号:', order.order_no);
				uni.navigateTo({
					url: `/pages/order/detail?id=${order.order_no}`
				});
			},
			goToHome() {
				uni.switchTab({
					url: '/pages/home/index'
				});
			},
			resetFilter() {
				this.activeStatus = 'all';
			},
			confirmFilter() {
				this.showFilter = false;
				this.filterCount = this.activeStatus !== 'all' ? 1 : 0;
			},
			handleSearch() {
				this.currentPage = 1;
				this.getOrderList();
			},
			loadMore() {
				if (this.hasMore && !this.loading) {
					this.currentPage += 1;
					this.getOrderList();
				}
			}
		}
	};
</script>

<style scoped>
	/* 新增退款金额样式 */
	.refund-value {
		color: #ff6a00;
		font-weight: 600;
	}

	/* 新增查看退款按钮样式 */
	.btn-refund-detail {
		color: #ff6a00;
		border-color: #ff9c6e;
		background: linear-gradient(to right, #fff7e6, #fff2e8);
		margin-left: 10px;
	}

	/* 调整按钮间距 */
	.card-footer {
		display: flex;
		justify-content: flex-end;
		padding: 12px 15px;
		border-top: 1px solid #f5f5f5;
		flex-wrap: wrap;
		gap: 10px;
	}

	.action-btn {
		height: 32px;
		min-width: 90px;
		border-radius: 16px;
		font-size: 13px;
		font-weight: 500;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid #ddd;
		background: white;
		padding: 0 15px;
		margin: 0;
	}

	@media (max-width: 350px) {
		.action-btn {
			min-width: 80px;
			font-size: 12px;
			padding: 0 8px;
		}
	}


	.page {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100vh;
		position: relative;
	}

	.container {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		overflow: hidden;
	}

	.nav {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 1000;
		height: 44px;
	}

	.fixed-header {
		margin-top: 90rpx;
		/* 恢复原来的上边距 */
		width: 100%;
		position: fixed;
		top: 44px;
		left: 0;
		z-index: 999;
		background-color: #fff;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.header {
		width: 100%;
		padding: 10px 15px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.search-container {
		position: relative;
		flex: 1;
		margin-right: 15px;
	}

	.search-input {
		width: 100%;
		padding: 8px 15px 8px 35px;
		border: none;
		background-color: #f5f5f5;
		border-radius: 20px;
		font-size: 14px;
	}

	.search-icon {
		position: absolute;
		left: 10px;
		top: 50%;
		transform: translateY(-50%);
		width: 18px;
		height: 18px;
	}

	.filter-container {
		display: flex;
		align-items: center;
		position: relative;
	}

	.filter-icon {
		width: 20px;
		height: 20px;
		margin-right: 5px;
	}

	.filter-text {
		font-size: 14px;
		color: #383838;
	}

	.notification {
		background-color: #d64444;
		color: #fff;
		border-radius: 50%;
		width: 20px;
		height: 20px;
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		top: -8px;
		right: -8px;
		font-size: 12px;
	}

	.tabs {
		width: 100%;
		display: flex;
		justify-content: space-around;
		padding: 10px 0;
		border-bottom: 1px solid #eee;
	}

	.tab {
		font-size: 14px;
		color: #383838;
		position: relative;
		padding: 5px 0;
	}

	.active {
		color: #568eff !important;
		font-weight: bold;
	}

	.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 2px;
		background-color: #568eff;
		border-radius: 1px;
	}

	.content {
		margin-top: 400rpx;
		/* 恢复原来的上边距 */

		width: 100%;
		padding: 10px;
		box-sizing: border-box;
	}

	.order-card {
		background: white;
		border-radius: 12px;
		margin-bottom: 12px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		padding: 12px 15px;
		border-bottom: 1px solid #f5f5f5;
	}

	.order-no {
		color: #666;
		font-size: 13px;
	}

	.order-status {
		font-size: 13px;
		font-weight: 500;
	}

	.status-pending {
		color: #ff9c00;
	}

	.status-processing {
		color: #568eff;
	}

	.status-completed {
		color: #09be4f;
	}

	.status-canceled {
		color: #999;
	}

	.card-body {
		padding: 15px;
	}

	.service-info {
		display: flex;
		margin-bottom: 15px;
	}

	.service-icon {
		width: 60px;
		height: 60px;
		border-radius: 8px;
		background: linear-gradient(135deg, #6ca3ff, #3a6cd9);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 12px;
	}

	.service-icon image {
		width: 30px;
		height: 30px;
	}

	.service-details {
		flex: 1;
	}

	.service-name {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 5px;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.service-id {
		color: #999;
		font-size: 13px;
	}

	.order-meta {
		display: flex;
		justify-content: space-between;
		background: #fafbfc;
		border-radius: 8px;
		padding: 12px;
		margin-top: 10px;
	}

	.meta-item {
		text-align: center;
		flex: 1;
	}

	.meta-label {
		color: #999;
		font-size: 12px;
		margin-bottom: 4px;
	}

	.meta-value {
		font-weight: 500;
		color: #333;
	}

	.price-value {
		color: #ff6a00;
		font-weight: 600;
	}

	.card-footer {
		display: flex;
		justify-content: flex-end;
		padding: 12px 15px;
		border-top: 1px solid #f5f5f5;
	}

	.action-btn {
		height: 32px;
		min-width: 90px;
		margin-left: 10px;
		border-radius: 16px;
		font-size: 13px;
		font-weight: 500;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid #ddd;
		background: white;
		padding: 0 15px;
	}

	.btn-refund {
		color: #ff6a00;
		border-color: #ff9c6e;
		background: linear-gradient(to right, #fff7e6, #fff2e8);
		position: relative;
		/* 确保按钮在层级最上方 */
		z-index: 999;
	}

	.btn-detail {
		color: #568eff;
		border-color: #85a5ff;
		background: linear-gradient(to right, #f0f7ff, #e6f4ff);
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60px 20px;
		text-align: center;
		height: 100%;
	}

	.empty-image {

		margin-bottom: 120rpx;
		width: 100%;
		opacity: 0.6;
	}

	.empty-text {
		font-size: 15px;
		color: #999;
		margin-bottom: 30px;
	}


	.load-more,
	.no-more {
		text-align: center;
		padding: 15px;
		color: #999;
		font-size: 14px;
	}

	/* 自定义弹窗样式 */
	.custom-popup-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 999;
		display: flex;
		justify-content: center;
		align-items: flex-end;
	}

	.custom-popup-container {
		width: 100%;
		max-height: 70vh;
		background-color: #fff;
		border-radius: 16px 16px 0 0;
		overflow: hidden;
		animation: popup-show 0.3s ease;
	}

	@keyframes popup-show {
		from {
			transform: translateY(100%);
		}

		to {
			transform: translateY(0);
		}
	}

	.custom-popup-header {
		padding: 15px 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid #f5f5f5;
	}

	.custom-popup-title {
		font-size: 18px;
		font-weight: bold;
		color: #333;
	}

	.custom-popup-close {
		font-size: 24px;
		color: #999;
		padding: 5px;
	}

	.custom-popup-body {
		padding: 20px;
		max-height: 50vh;
		overflow-y: auto;
	}

	.filter-section {
		margin-bottom: 20px;
	}

	.section-title {
		display: block;
		font-size: 16px;
		font-weight: 500;
		margin-bottom: 12px;
		color: #333;
	}

	.filter-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.filter-tag {
		padding: 6px 15px;
		border-radius: 15px;
		background: #f5f5f5;
		color: #666;
		font-size: 14px;
	}

	.filter-tag.active {
		background: #e6f4ff;
		color: #568eff;
		border: 1px solid #568eff;
	}

	.time-range {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.time-picker {
		flex: 1;
		padding: 8px 12px;
		border: 1px solid #eee;
		border-radius: 4px;
		text-align: center;
	}

	.time-separator {
		color: #999;
	}

	.custom-popup-footer {
		display: flex;
		padding: 15px 20px;
		border-top: 1px solid #f5f5f5;
	}

	.custom-reset-btn {
		flex: 1;
		height: 44px;
		line-height: 44px;
		background-color: #f5f5f5;
		color: #333;
		border-radius: 22px;
		margin-right: 15px;
		font-size: 16px;
		border: none;
	}

	.custom-confirm-btn {
		flex: 1;
		height: 44px;
		line-height: 44px;
		background: linear-gradient(135deg, #568eff, #3a6cd9);
		color: white;
		border-radius: 22px;
		font-size: 16px;
		border: none;
	}

	@media (max-width: 350px) {
		.action-btn {
			min-width: 80px;
			font-size: 12px;
			padding: 0 8px;
		}

		.tab {
			font-size: 12px;
		}
	}
</style>