<template>
	<view>
		<custom-nav :title="pageTitle" :isHomePage="false" :scrollTop="scrollTop" ref="customNav" />
		<view class="page-container" :style="{ paddingTop: navHeight + 'px' }">
			<view class="filter-tabs">
				<view class="tab-item" :class="{ active: currentTab === 'all' }" @click="changeTab('all')">
					全部
				</view>
				<view class="tab-item" :class="{ active: currentTab === 'unreviewed' }"
					@click="changeTab('unreviewed')">
					待审核
				</view>
				<view class="tab-item" :class="{ active: currentTab === 'approved' }" @click="changeTab('approved')">
					已通过
				</view>
				<view class="tab-item" :class="{ active: currentTab === 'rejected' }" @click="changeTab('rejected')">
					未通过
				</view>
			</view>

			<scroll-view class="application-list" scroll-y>
				<view class="application-card" v-for="(application, index) in filteredApplications"
					:key="application._id">
					<view class="card-header">
						<text class="application-no">申请编号: {{ application._id.slice(-8) }}</text>
						<text :class="['application-status', getStatusClass(application)]">
							{{ formatStatus(application) }}
						</text>
					</view>

					<view class="card-body">
						<view class="info-row">
							<text class="info-label">姓名:</text>
							<text class="info-value">{{ application.name }}</text>
						</view>

						<view class="info-row">
							<text class="info-label">报考类型:</text>
							<text class="info-value">{{ application.examType }}</text>
						</view>

						<view class="info-row">
							<text class="info-label">报名工种:</text>
							<text class="info-value">{{ application.jobType }}</text>
						</view>

						<view class="info-row">
							<text class="info-label">考试级别:</text>
							<text class="info-value">{{ application.examLevel }}</text>
						</view>

						<view class="info-row" v-if="application.order_no">
							<text class="info-label">关联订单:</text>
							<text class="info-value">{{ application.order_no }}</text>
						</view>

						<view class="order-info" v-if="relatedOrders[application.order_no]">
							<view class="info-row">
								<text class="info-label">订单状态:</text>
								<text
									class="info-value">{{ formatOrderStatus(relatedOrders[application.order_no].status) }}</text>
							</view>
							<view class="info-row">
								<text class="info-label">支付金额:</text>
								<text
									class="info-value price">¥{{ relatedOrders[application.order_no].total_price }}</text>
							</view>
							<view class="info-row">
								<text class="info-label">支付时间:</text>
								<text
									class="info-value">{{ formatDate(relatedOrders[application.order_no].create_time) }}</text>
							</view>
						</view>
					</view>

					<view class="card-footer">
						<button class="action-btn btn-detail" v-if="application.auditStatus === 'unreviewed'"
							@click="applyRefund(application)">
							撤销申请
						</button>

						<!-- <button class="action-btn btn-order" v-if="application.order_no"
							@click="viewOrderDetail(application.order_no)">
							订单详情
						</button> -->

						<button class="action-btn btn-reapply" v-if="application.auditStatus === 'rejected'"
							@click="reapply(application)">
							重新申请
						</button>
					</view>
				</view>

				<view class="empty-tip" v-if="filteredApplications.length === 0">
					暂无申请记录
				</view>
			</scroll-view>
		</view>
	</view>

</template>

<script>
	export default {
		data() {
			return {
				pageTitle: "我的申请",
				navHeight: 0,
				currentTab: 'all',
				applications: [],
				relatedOrders: {},
				loading: false
			}
		},
		computed: {
			filteredApplications() {
				if (this.currentTab === 'all') {
					return this.applications;
				}
				return this.applications.filter(app => app.auditStatus === this.currentTab);
			}
		},
		onLoad() {
			this.loadApplications();
			const systemInfo = uni.getSystemInfoSync();
			this.navHeight = systemInfo.statusBarHeight + 44;
		},
		methods: {
			async loadApplications() {
				this.loading = true;
				uni.showLoading({
					title: '加载中...'
				});

				try {
					// 获取当前用户ID
					const userInfo = uni.getStorageSync('userInfo');
					if (!userInfo || !userInfo._id) {
						throw new Error('用户未登录');
					}

					// 查询用户的报名申请
					const db = uniCloud.database();
					const applicationsRes = await db.collection('signup')
						.where({
							userId: userInfo.user_id
						})
						.orderBy('createdAt', 'desc')
						.get();

					this.applications = applicationsRes.result.data;

					// 收集所有订单号
					const orderNos = this.applications.map(app => app.order_no).filter(Boolean);

					if (orderNos.length > 0) {
						// 批量查询关联订单
						const ordersRes = await db.collection('orders')
							.where({
								order_no: db.command.in(orderNos)
							})
							.get();

						// 构建订单映射表
						this.relatedOrders = {};
						ordersRes.result.data.forEach(order => {
							this.relatedOrders[order.order_no] = order;
						});
					}
				} catch (err) {
					uni.showToast({
						title: '加载失败: ' + (err.message || err.errMsg),
						icon: 'none'
					});
					console.error(err);
				} finally {
					this.loading = false;
					uni.hideLoading();
				}
			},

			changeTab(tab) {
				this.currentTab = tab;
			},

			getStatusClass(application) {
				// 1. 检查订单数据是否已加载（relatedOrders 不为空且包含当前订单）
				const isOrderLoaded = Object.keys(this.relatedOrders).length > 0 &&
					application.order_no &&
					this.relatedOrders[application.order_no] !== undefined;

				// 2. 未加载完成时，直接返回基础状态（不判断退款状态）
				if (!isOrderLoaded) {
					// 可选：仅在开发环境打印未加载提示
					// console.log(`订单数据未加载（申请ID: ${application._id}）`);
					return {
						'status-unreviewed': application.auditStatus === 'unreviewed',
						'status-pending': application.auditStatus === 'pending_review',
						'status-approved': application.auditStatus === 'approved',
						'status-rejected': application.auditStatus === 'rejected',
						'status-refunded': false // 未加载时默认非退款状态
					};
				}

				// 3. 订单数据已加载，正常判断
				const relatedOrder = this.relatedOrders[application.order_no];
				const isRefundedOrder = ['refunded'].includes(relatedOrder.status);

				// 仅在订单数据就绪后打印日志（避免重复）
				console.log(`申请ID: ${application._id} 退款状态:`, isRefundedOrder);

				return {
					'status-refunded': isRefundedOrder,
					'status-unreviewed': application.auditStatus === 'unreviewed',
					'status-pending': application.auditStatus === 'pending_review',
					'status-approved': application.auditStatus === 'approved',
					'status-rejected': application.auditStatus === 'rejected',
				};
			},

			formatStatus(application) {
				// 1. 先判断是否有退款相关的订单状态（优先显示）
				const relatedOrder = this.relatedOrders[application.order_no];
				if (relatedOrder && relatedOrder.status === 'refunded') {
					return '已取消'; // 订单已退款时，显示“已取消”
				}

				// 2. 若无退款状态，再使用申请的 auditStatus
				const statusMap = {
					'unreviewed': '待审核',
					'pending_review': '审核中',
					'approved': '已通过',
					'rejected': '未通过'
				};
				return statusMap[application.auditStatus] || application.auditStatus;
			},

			formatOrderStatus(status) {
				const statusMap = {
					'paid': '已支付',
					'refunded': '已退款',
					'completed': '已完成',
					'cancelled': '已取消'
				};
				return statusMap[status] || status;
			},

			formatDate(dateStr) {
				if (!dateStr) return '';
				const date = new Date(dateStr);
				return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
			},

			viewApplicationDetail(application) {
				uni.navigateTo({
					url: `/pages/application/detail?id=${application._id}`
				});
			},

			viewOrderDetail(orderNo) {
				uni.navigateTo({
					url: `/pages/order/detail?order_no=${orderNo}`
				});
			},
			// 认证考试页面（我的申请页）的methods中
			applyRefund(application) {
				// 关键：根据当前申请的order_no，从relatedOrders中获取对应的单个订单对象
				const order = this.relatedOrders[application.order_no];
				if (!order) {
					uni.showToast({
						title: '未找到关联订单',
						icon: 'none'
					});
					return;
				}

				// 确保订单对象结构与陪诊服务一致
				const standardizedOrder = {
					// 核心字段（与陪诊服务订单对齐）
					order_no: order.order_no,
					total_price: order.total_price,
					status: order.status,
					out_trade_no: order.out_trade_no,
					create_time: order.create_time,
					// 认证考试特有字段
					examType: application.examType,
					jobType: application.jobType,
					order_type: 1,
				};

				// 编码单个订单对象（与陪诊服务传入格式一致）
				const encodedOrderInfo = encodeURIComponent(JSON.stringify(standardizedOrder));
				uni.navigateTo({
					url: `/pages/refund/refund?orderInfo=${encodedOrderInfo}`
				});
			},
			reapply(application) {
				uni.showModal({
					title: '提示',
					content: '确定要重新申请吗？',
					success: (res) => {
						if (res.confirm) {
							// 这里可以跳转到申请页面，携带原有数据
							uni.navigateTo({
								url: `/pages/signup/signup`
							});
						}
					}
				});
			}
		}
	}
</script>

<style>
	.page-container {
		min-height: 100vh;
		position: relative;

		padding-left: 25rpx;
		padding-right: 25rpx;
		margin: 0;
		width: 100%;
		box-sizing: border-box;
		/* 关键：让 width 包含 padding */
		-webkit-overflow-scrolling: touch;
		/* 平滑滚动 */
		scrollbar-width: none;
		/* Firefox */
	}

	.filter-tabs {

		display: flex;
		background-color: #fff;
		border-radius: 10rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.tab-item {
		flex: 1;
		text-align: center;
		padding: 20rpx 0;
		font-size: 28rpx;
		color: #666;
		position: relative;
	}

	.tab-item.active {
		color: #007aff;
		font-weight: bold;
	}

	.tab-item.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 60rpx;
		height: 4rpx;
		background-color: #007aff;
		border-radius: 2rpx;
	}

	.application-list {
		height: calc(100vh - 180rpx);
	}

	.application-card {
		background-color: #fff;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		padding: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 15rpx;
		border-bottom: 1rpx solid #eee;
		margin-bottom: 15rpx;
	}

	.application-no {
		font-size: 26rpx;
		color: #999;
	}

	.application-status {
		font-size: 26rpx;
		padding: 4rpx 12rpx;
		border-radius: 20rpx;
	}

	.status-unreviewed {
		color: #ff9500;
		background-color: #fff4e5;
	}

	.status-pending {
		color: #007aff;
		background-color: #e6f2ff;
	}

	.status-approved {
		color: #34c759;
		background-color: #e6f9ec;
	}

	.status-rejected {
		color: #ff3b30;
		background-color: #ffebea;
	}

	.card-body {
		margin-bottom: 20rpx;
	}

	.info-row {
		display: flex;
		margin-bottom: 12rpx;
		font-size: 28rpx;
	}

	.info-label {
		color: #666;
		width: 140rpx;
	}

	.info-value {
		color: #333;
		flex: 1;
	}

	.price {
		color: #ff9500;
		font-weight: bold;
	}

	.order-info {
		background-color: #f9f9f9;
		border-radius: 8rpx;
		padding: 15rpx;
		margin-top: 15rpx;
	}

	.card-footer {
		display: flex;
		justify-content: space-between;
		border-top: 1rpx solid #eee;
		padding-top: 15rpx;

	}

	.action-btn {
		font-size: 26rpx;
		padding: 8rpx 20rpx;
		margin-left: 0rpx;
		width: 100%;
		border-radius: 20rpx;
		background-color: #fff;
		border: 1rpx solid #ddd;
	}

	.btn-detail {
		color: #007aff;
		border-color: #007aff;
	}

	.btn-order {
		color: #5856d6;
		border-color: #5856d6;
	}

	.btn-reapply {
		color: #ff9500;
		border-color: #ff9500;
	}

	.empty-tip {
		text-align: center;
		padding: 50rpx 0;
		color: #999;
		font-size: 28rpx;
	}
</style>