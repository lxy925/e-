<template>
	<view class="page">
		<custom-nav title="陪诊服务选择" :isHomePage="false" :scrollTop="scrollTop"></custom-nav>
		<view class="service-list" :style="{ paddingTop: navHeight + 'px' }">
			<view class="service-card" v-for="(service, index) in services" :key="index">
				<image :src="service.image" mode="aspectFill" class="service-image"></image>
				<view class="provide_transport"> {{ service.include_transport ? "含接送" : "无接送" }}</view>
				<view class="service-info">
					<view class="service-name">{{ service.service_name }}</view>
					<view class="service-price">价格: ¥{{ service.service_price }}</view>
					<view class="service-sold">已售: {{ service.sold_quantity }} 个</view>

				</view>

				<button class="book-button" @click="bookService(service)">立即预约</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				services: [

				],
				navHeight:0
			};
		},
		onPageScroll(e) {
			// console.log('页面滚动:', e.scrollTop);
			this.scrollTop = e.scrollTop;
		},
		onLoad() {
			this.fetchServices();
			const systemInfo = uni.getSystemInfoSync();
			this.navHeight = systemInfo.statusBarHeight + 44;
		},
		methods: {
			async fetchServices() {
				try {
					const res = await uniCloud.callFunction({
						name: 'getServices' // 云函数名称
					});
					if (res.result.success) {
						console.log('获取服务数据成功:', res.result.data);
						this.services = res.result.data;
					} else {
						console.error('获取服务数据失败:', res.result.error);
					}
				} catch (err) {
					console.error('调用云函数失败:', err);
				}
			},
			bookService(service) {
				const serviceData = encodeURIComponent(JSON.stringify(service));
				// 在服务选择页面的跳转代码中
				uni.navigateTo({
					url: `/subPackageB/pages/order_details/order_details?service=${encodeURIComponent(JSON.stringify(service))}&from=serviceSelection`
				});
			}
		}
	};
</script>

<style>
	/* 全局变量：支持暗黑模式 */
	page {
	  --bg-color: #f5f7fa;
	  --card-bg: #ffffff;
	  --text-main: #2c3e50;
	  --text-sub: #7f8c8d;
	  --primary: #007AFF;
	  --danger: #e74c3c;
	  --green: #1fc7d6;
	  --radius: 20rpx;
	  --shadow: 0 8rpx 24rpx rgba(0, 0, 0, .06);
	}
	@media (prefers-color-scheme: dark) {
	  page {
	    --bg-color: #121212;
	    --card-bg: #1e1e1e;
	    --text-main: #f5f5f5;
	    --text-sub: #9e9e9e;
	    --shadow: 0 8rpx 24rpx rgba(0, 0, 0, .4);
	  }
	}
	
	/* 页面背景 */
	.page {
	/*  background: var(--bg-color); */
	/*  padding: 200rpx 20rpx 40rpx; */
	
	}
	
	/* 列表容器 */
	.service-list {
	  /* padding: 0 20rpx; */
	  width: 100%;
	  box-sizing: border-box;
	  /* 关键：让 padding 包含在宽度内 */
	  padding-left: 25rpx;
	  padding-right: 25rpx;
	  height: calc(100vh - var(--nav-height));
	  overflow-y: auto;
	  display: flex;
	  flex-direction: column;
	  gap: 30rpx;
	}
	
	/* 卡片 */
	.service-card {
	  display: flex;
	  align-items: center;
	  background: var(--card-bg);
	  border-radius: var(--radius);
	  box-shadow: var(--shadow);
	  padding: 30rpx;
	  position: relative;
	  overflow: hidden;
	}
	
	/* 图片 */
	.service-image {
	  width: 160rpx;
	  height: 160rpx;
	  border-radius: var(--radius);
	  flex-shrink: 0;
	}
	
	/* 标签：含接送/无接送 */
	.provide_transport {
	  position: absolute;
	  top: 20rpx;
	  left: 20rpx;
	  background: var(--green);
	  color: #fff;
	  font-size: 22rpx;
	  font-weight: 600;
	  padding: 6rpx 14rpx;
	  border-radius: 8rpx;
	  letter-spacing: 1rpx;
	}
	
	/* 信息区 */
	.service-info {
	  flex: 1;
	  margin-left: 30rpx;
	  display: flex;
	  flex-direction: column;
	  justify-content: space-between;
	}
	
	.service-name {
	  font-size: 34rpx;
	  font-weight: 700;
	  color: var(--text-main);
	  line-height: 1.3;
	  margin-bottom: 12rpx;
	}
	
	.service-price {
	  font-size: 28rpx;
	  color: var(--danger);
	  font-weight: 600;
	  margin-bottom: 8rpx;
	}
	
	.service-sold {
	  font-size: 24rpx;
	  color: var(--text-sub);
	}
	
	/* 预约按钮 */
	.book-button {
	  margin-left: auto;
	  background: linear-gradient(135deg, #007AFF 0%, #005eef 100%);
	  color: #fff;
	  font-size: 28rpx;
	  font-weight: 600;
	  padding: 10rpx 15rpx;
	  border-radius: var(--radius);
	  border: none;
	  box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, .35);
	  transition: transform .15s;
	}
	.book-button:active {
	  transform: scale(.96);
	}
</style>