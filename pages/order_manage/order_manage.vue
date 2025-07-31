<template>
	<view class="page">
		<custom-nav title="e陪无忧" :isHomePage="false" class="nav"></custom-nav>
		<view class="container">
			<!-- 完全保持您原有的header结构 -->
			<view class="fixed-header">
				<view class="header">
					<view class="search-container">
						<input class="search-input" placeholder="请输入交易名称" v-model="searchQuery"
							@confirm="handleSearch" />
						<image src="../../static/images/order/icon_4.png" class="search-icon" />
					</view>
				</view>

				<!-- 保持您原有的tabs结构 -->
				<view class="tabs">
					<text v-for="(tab, index) in tabs" :key="index"
						:class="{'tab': true, 'active': currentTab === index}"
						@click="selectTab(index)">{{ tab.label }}</text>
				</view>
			</view>

			<!-- 完全保持您原有的内容区域 -->
			<scroll-view class="content" scroll-y :style="{height: scrollHeight + 'px'}" @scrolltolower="loadMore">
				<view v-if="filteredOrders.length > 0">
					<view class="order-card" v-for="(order, index) in filteredOrders" :key="order.order_no">
						<!-- 保持您原有的卡片结构 -->
						<view class="card-header">
							<text class="order-no">订单号：{{ order.order_no }}</text>
							<text :class="['order-status', getStatusClass(order)]">
								{{ formatStatus(order) }}
							</text>
						</view>

						<view class="card-body">
							<!-- 保持您原有的服务信息展示 -->
							<view class="service-info">
								<view class="service-icon">
									<image src="../../static/images/order/service-icon.png" mode="aspectFit" />
								</view>
								<view class="service-details">
									<text class="service-name">{{ order.service_info.service_name }}</text>
									<text class="service-id">服务ID: {{ order.service_id }}</text>
								</view>
							</view>

							<!-- 保持您原有的订单元信息 -->
							<view class="order-meta">
								<view class="meta-item">
									<text class="meta-label">金额</text>
									<text class="meta-value price-value">¥{{ order.total_price }}</text>
								</view>
								<view class="meta-item">
									<text class="meta-label">服务时长</text>
									<text class="meta-value">{{ order.duration || '2小时' }}</text>
								</view>
							</view>
						</view>

						<!-- 保持您原有的底部按钮 -->
						<view class="card-footer">
							<button class="action-btn btn-refund" v-if="order.status === 'paid'"
								@click.stop="applyRefund(order)">
								申请退款
							</button>
							<button class="action-btn btn-delete" v-if="order.status !== 'paid'"
								@click.stop="deleteOrder(order)">
								删除订单
							</button>
							<button class="action-btn btn-detail" @click.stop="viewOrderDetail(order)">
								查看详情
							</button>
							<button class="action-btn btn-complete"
								v-if="order.status === 'paid'&&order.service_status!=='completed'"
								@click.stop="completeOrder(order)">
								服务完成
							</button>
						</view>
					</view>
				</view>

				<!-- 保持您原有的空状态 -->
				<view v-else class="empty-state">
					<image src="../../static/images/order/img_1.png" class="empty-image" />
					<text class="empty-text">暂无订单数据~</text>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentTab: 0,
				tabs: [], // 将通过computed动态生成
				orderList: [],
				scrollHeight: 0,
				searchQuery: '',
				pageSize: 10,
				currentPage: 1,
				hasMore: true,
				loading: false,
				userRole: 'user', // user/doctor
				initialStatus: '',
			}
		},
		computed: {
			// 动态生成标签页
			roleTabs() {
				const tabs = this.userRole === 'doctor' ? [
					// 陪诊师标签
					{
						label: '全部',
						value: 'all'
					},
					{
						label: '待接单',
						value: 'pending'
					},
					{
						label: '服务中',
						value: 'processing'
					},
					{
						label: '已完成',
						value: 'completed'
					},
					{
						label: '已取消',
						value: 'cancelled'
					}
				] : [
					// 普通用户标签
					{
						label: '全部',
						value: 'all'
					},
					{
						label: '待付款',
						value: 'paying'
					},
					{
						label: '待服务',
						value: 'pending'
					},
					{
						label: '已完成',
						value: 'completed'
					},
					{
						label: '已取消',
						value: 'cancelled'
					}
				];
				return tabs.map(tab => {
					switch (tab.value) {
						case 'pending':
							return {
								...tab,
								filter: this.userRole === 'doctor' ? {
									status: 'paid',
									service_status: 'pending'
								} : {
									status: 'paid',
									service_status: 'pending'
								}
							};
						case 'processing':
							return {
								...tab,
								filter: {
									status: 'paid',
									service_status: 'processing'
								}
							};
						case 'completed':
							return {
								...tab,
								filter: {
									status: 'paid',
									service_status: 'completed'
								}
							};
						case 'cancelled':
							return {
								...tab,
								filter: {
									status: 'cancelled',
									service_status: 'cancelled'
								}
							};
						case 'paying':
							return {
								...tab,
								filter: {
									status: 'paying'
								}
							};
						default:
							return {
								...tab,
								filter: {} // 全部订单不筛选
							};
					}
				});
			},
			// 保持原有过滤逻辑
			filteredOrders() {
				let result = this.orderList;
				// ... 保持原有过滤逻辑不变
				return result;
			}
		},
		onLoad(options) {
			// 初始化角色
			this.initialStatus = options.status || '';
			const role = options.role || '';
			// 初始化角色
			const userInfo = uni.getStorageSync('userInfo') || {};
			this.userRole = role || (userInfo.type === '陪诊师' ? 'doctor' : 'user');
			this.initTabs();
			this.tabs = this.roleTabs; // 初始化tabs

			this.calculateScrollHeight();
			this.getOrderList();
		},
		methods: {
			//根据初始状态初始化标签页
			initTabs() {
				this.tabs = this.roleTabs;
				// 如果有初始状态，找到对应的标签索引
				if (this.initialStatus) {
					const index = this.tabs.findIndex(tab => tab.value === this.initialStatus);
					if (index > -1) {
						this.currentTab = index;
					}
				}
			},
			// 服务完成按钮点击事件（合并弹窗与云函数调用）
			completeOrder(order) {
				// 二次确认弹窗
				uni.showModal({
					title: '确认服务完成',
					content: '确定陪诊服务已完成吗？',
					confirmText: '确认完成',
					cancelText: '取消',
					success: async (res) => {
						if (res.confirm) {
							try {

								// 直接在当前方法调用云函数
								const res = await uniCloud.callFunction({
									name: 'updateOrderStatus',
									data: {
										order_no: order.order_no,
										from_status: order.status, // 原订单状态（如 'paid'）
										to_status: order.status, // 订单状态不变（仅更新服务状态）
										update_data: {
											service_status: 'completed', // 服务状态设为已完成
											audit_status: 'unreviewed', // 审核状态设为未审核
											completed_time: new Date().toISOString(), // 记录完成时间
											updated_time: new Date().toISOString()
										}
									}
								});

								// 处理结果
								if (res.result.code === 200) {
									uni.showToast({
										title: '服务已标记为完成',
										icon: 'success'
									});
									this.getOrderList(); // 刷新订单列表
								} else {
									uni.showToast({
										title: res.result.message || '更新失败',
										icon: 'none'
									});
								}
							} catch (e) {
								console.error('更新失败:', e);
								uni.showToast({
									title: '更新失败，请重试',
									icon: 'none'
								});
							} finally {
								uni.hideLoading();
							}
						}
					}
				});
			},
			calculateScrollHeight() {
				const query = uni.createSelectorQuery().in(this);
				// 同时获取 nav 和 fixed-header 的高度
				query.select('.nav').boundingClientRect(navData => {
					query.select('.fixed-header').boundingClientRect(headerData => {
						const systemInfo = uni.getWindowInfo();;
						// 视口高度 - nav 高度 - fixed-header 高度
						this.scrollHeight = systemInfo.windowHeight - (navData ? navData.height : 44) - (
							headerData ? headerData.height : 0);
					}).exec();
				}).exec();
			},

			// 修改：添加角色条件
			async getOrderList() {
				if (this.loading) return;
				this.loading = true;

				try {
					const db = uniCloud.database();
					const userInfo = uni.getStorageSync('userInfo') || {};

					const _ = db.command;
					// 构建查询条件
					let query = db.collection('orders')
						.where({
							[this.userRole === 'doctor' ? 'doctor_id' : 'user_id']: userInfo.user_id
						});

					// 添加搜索条件 - 只根据服务名称或患者姓名搜索
					if (this.searchQuery) {
						const searchRegex = new RegExp(this.searchQuery, 'i');

						// 创建复合查询条件：服务名称 OR 患者姓名
						query = query.where(
							_.or([{
									'service_info.service_name': searchRegex
								},
								{
									'patient_name': searchRegex
								}
							])
						);
					}


					// 保持原有状态筛选逻辑
					if (this.currentTab > 0) {
						const tabValue = this.tabs[this.currentTab].value;
						if (tabValue !== 'all') {
							query = query.where(this.roleTabs.find(t => t.value === tabValue).filter);
						}
					}

					// 保持原有分页逻辑
					const res = await query
						.orderBy('create_time', 'desc')
						.skip((this.currentPage - 1) * this.pageSize)
						.limit(this.pageSize)
						.get();
					// 正确方式：
					console.log("查询到的订单结果:", res.result);

					// 保持原有结果处理
					if (res.result.data) {
						this.orderList = this.currentPage === 1 ?
							res.result.data : [...this.orderList, ...res.result.data];
						this.hasMore = res.result.data.length >= this.pageSize;
					}
				} catch (e) {
					console.error('查询失败:', e);
				} finally {
					this.loading = false;
				}
			},

			// 保持原有方法不变
			selectTab(index) {
				this.currentTab = index;
				this.currentPage = 1;
				this.getOrderList();
			},
			handleSearch() {
				this.currentPage = 1;
				console.log("执行搜索，关键词:", this.searchQuery); // 添加日志
				this.getOrderList();
			},
			loadMore() {
				if (this.hasMore && !this.loading) {
					this.currentPage += 1;
					this.getOrderList();
				}
			},
			viewOrderDetail(order) {
				uni.navigateTo({
					url: `/pages/order_detail/order_detail?orderId=${order._id}`
				});
			},
			applyRefund(order) {
				// 将订单对象编码为URL安全的字符串
				const encodedOrderInfo = encodeURIComponent(JSON.stringify(order));

				uni.navigateTo({
					url: `/pages/refund/refund?orderInfo=${encodedOrderInfo}`
				});
			},
			deleteOrder(order) {
				uni.showModal({
					title: '确认删除',
					content: `确定删除订单 ${order.order_no} 吗？`,
					success: async (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '删除中...'
							});
							try {
								await db.collection('orders').doc(order._id).remove();
								this.orderList = this.orderList.filter(item => item._id !== order._id);
								uni.showToast({
									title: '删除成功'
								});
							} catch (e) {
								uni.showToast({
									title: '删除失败',
									icon: 'none'
								});
							}
						}
					}
				});
			},
			formatStatus(order) {
				if (order.service_status === "completed") return '已完成';
				if (order.status === "paid") {
					return order.service_status === "pending" ? '待服务' :
						order.service_status === "processing" ? '进行中' : '已完成';
				}
				return order.status === "paying" ? '待付款' : '已取消';
			},
			getStatusClass(order) {
				const status = this.formatStatus(order);
				return {
					'status-pending': ['待付款', '待服务'].includes(status),
					'status-processing': status === '进行中',
					'status-completed': status === '已完成',
					'status-cancelled': status === '已取消'
				}
			}
		}
	}
</script>

<style scoped>
	/* 完全保持您原有的样式定义 */
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
		overflow-y: auto;
		margin-top: 340rpx;
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

	.status-cancelled {
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
		border-radius: 16px;
		font-size: 13px;
		font-weight: 500;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid #ddd;
		background: white;
		padding: 0 15px;
		margin-left: 80rpx;
	}

	.btn-refund {
		color: #ff6a00;
		border-color: #ff9c6e;
		background: linear-gradient(to right, #fff7e6, #fff2e8);
	}

	.btn-detail {
		color: #568eff;
		border-color: #85a5ff;
		background: linear-gradient(to right, #f0f7ff, #e6f4ff);
	}

	.btn-complete {
		/* 文字色：选用深绿色，传递“成功/完成”的明确语义，避免过于鲜艳的绿色导致视觉疲劳 */
		color: #0a9b44;
		/* 边框色：比文字色浅一度，与背景渐变自然过渡 */
		border-color: #5cdb87;
		/* 背景渐变：从浅绿到更浅的绿，营造清爽感，与“完成”状态匹配 */
		background: linear-gradient(to right, #f0fff4, #e6ffef);
	}

	.btn-delete {
		color: #ff4d4f;
		border-color: #ff7875;
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
		width: 200px;
		height: 200px;
		margin-bottom: 15px;
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