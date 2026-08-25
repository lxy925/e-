<template>
  <view class="page">
    <!-- 导航栏保持不变 -->
    <custom-nav :title="pageTitle" :isHomePage="false" :scrollTop="scrollTop" ref="customNav" />
    
    <view scroll-y 
	class="container"
          :style="{
            paddingTop: navHeight + 'px',
            height: `calc(100vh - ${navHeight + bottomBarHeight}px)`
          }">
        <!--  <view class="container" :style="{ paddingTop: navHeight + 'px' }"> -->
            <!-- 服务图片区域 -->
            <view class="service-image-container">
              <image :src="serviceDataImage" mode="aspectFill" class="main-image" />
              <view class="image-overlay"></view>
            </view>
            
            <!-- 整合后的卡片容器 -->
            <view class="spec-card">
              <!-- 服务信息卡片 -->
              <view class="spec-item service-info-item">
              <!--  <text class="spec-name">服务信息</text> -->
                <view class="service-info-content">
                  <view class="price-section">
                    <text class="discount-tag">限时优惠</text>
                    <view class="price-group">
                      <text class="price-symbol">¥</text>
                      <text class="price">{{serviceData && serviceData.service_price ? serviceData.service_price : '--'}}</text>
                      <text class="original-price">日常价 ¥178</text>
                    </view>
                    <text class="sales">已售{{serviceData && serviceData.sold_quantity ? serviceData.sold_quantity : '0'}}单</text>
                  </view>
                  
                  <text class="service-title">{{serviceData && serviceData.service_name ? serviceData.service_name : '服务加载中'}}</text>
                  
                  <view class="badge-group">
                    <text class="badge orange">平安自营</text>
                    <text class="badge green">持证上岗</text>
                    <text class="badge blue">100%好评</text>
                  </view>
                </view>
              </view>
              
              <view class="divider"></view>
              
              <!-- 服务规格 -->
              <view class="spec-item">
                <text class="spec-name">服务规格</text>
                <text class="spec-value">{{serviceData && serviceData.service_details ? serviceData.service_details : '标准服务'}}</text>
              </view>
              
              <view class="divider"></view>
              
          
              
              <view class="divider"></view>
              
              <!-- 服务内容 -->
              <view class="spec-item service-content-item">
                <text class="spec-name">服务内容</text>
                <view class="content-container">
                  <image v-if="details.length > 0" :src="details[1].image" mode="widthFix" class="content-image" />
                </view>
              </view>
            </view>
         <!-- </view> -->
        </view>
    
    <!-- 底部按钮 - 更现代的设计 -->
    <view class="action-bar">
      <button class="action-btn contact">
        <image src="../../../static/images/order/icon_7.png" class="btn-icon" />
        <text>客服</text>
      </button>
      <button class="action-btn primary" @click="goToOrder">
        <text>立即预约</text>
      </button>
    </view>
  </view>
</template>

<script>
	export default {
		name: 'OrderComponent',
		data() {
			return {
				navHeight: 0, // 添加导航栏高度存储
				pageTitle: '服务详情',
				scrollTop: 0,
				// Define your data properties here
				details: [],
				serviceData: null, // 用于存储接收到的数据
				service_id: 0, //用于存储服务类型,
				include_transport: false,
        serviceDataImage:'https://mp-4a957f51-d071-4dd1-b83f-240df3a73de3.cdn.bspapp.com/banners/3.webp'
			};
		},
		methods: {
			//监视页面滚动情况
			handleScroll(e) {
				if (this.scrollTimer) clearTimeout(this.scrollTimer)
				this.scrollTimer = setTimeout(() => {
					this.scrollTop = e.detail.scrollTop
				}, 16) // 约60fps
			},
			goToOrder() {
				const service = encodeURIComponent(JSON.stringify(this.serviceData));
				console.log("传递的 service 参数:", service);
				uni.navigateTo({
					url: `/subPackageB/pages/order/order?service=${service}&from=order_details`
				});
			},
			async getDetailsImage() {
				try {
					uni.showLoading({
						title: '加载中'
					})

					const {
						result
					} = await uniCloud.callFunction({
						name: 'Order_details'
					})

					if (result.code === 0) {
						this.details = result.data
					} else {
						uni.showToast({
							title: result.msg || '获取图片失败',
							icon: 'none'
						})
					}
				} catch (e) {
					uni.showToast({
						title: '获取图片失败',
						icon: 'none'
					})
				} finally {
					uni.hideLoading()
				}
			}
		},
		onLoad(options) {
			const systemInfo = uni.getSystemInfoSync();
			this.navHeight = systemInfo.statusBarHeight + 44;
			console.log("this.navHeight",this.navHeight)
			console.log("options 参数:", options);
			this.getDetailsImage();
			// 从 options 中获取 service 参数
			const serviceDataString = options.service;

			if (serviceDataString) {
				try {
					this.serviceData = JSON.parse(decodeURIComponent(serviceDataString));
				} catch (error) {
					console.error("解析 JSON 失败:", error);
					this.serviceData = decodeURIComponent(serviceDataString); // 回退到字符串
				}
			}

			console.log("最终数据:", this.serviceData);
			if (this.serviceData) {
				this.service_id = this.serviceData.service_id;
				this.include_transport = this.serviceData.include_transport;
			}
		}
	}
</script>
<style scoped>
  /* 基础样式 */
  .page {
    /* background-color: #f8f8f8; */
  }
  
  .container {
    padding-left: 25rpx;
	padding-right: 25rpx;
   /* padding-bottom: 160rpx; */
  }
  
  /* 服务图片区域 */
  .service-image-container {
    position: relative;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 8rpx 24rpx rgba(0, 186, 173, 0.1);
   width: 100%; /* 必须设置宽度 */
     height: 400rpx;
  }
  
  .main-image {
    width: 100%;
    height: 100%;
	display: block;
  }
  
  .image-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 120rpx;
    background: linear-gradient(transparent, rgba(0,0,0,0.5));
  }
  
  /* 服务卡片 */
  .service-card {
    background: white;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-top: 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  }
  
  .price-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 20rpx;
  }
  
  .discount-tag {
    background: #FF5A5F;
    color: white;
    padding: 4rpx 12rpx;
    border-radius: 6rpx;
    font-size: 24rpx;
  }
  
  .price-group {
    display: flex;
    align-items: baseline;
  }
  
  .price-symbol {
    color: #FF5A5F;
    font-size: 36rpx;
    font-weight: bold;
    margin-right: 4rpx;
  }
  
  .price {
    color: #FF5A5F;
    font-size: 48rpx;
    font-weight: bold;
  }
  
  .original-price {
    color: #999;
    font-size: 24rpx;
    text-decoration: line-through;
    margin-left: 16rpx;
  }
  
  .sales {
    color: #999;
    font-size: 24rpx;
  }
  
  .service-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    line-height: 1.4;
  }
  
  /* 徽章组 */
  .badge-group {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
  }
  
  .badge {
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
  }
  
  .orange {
    background: #FFF2E8;
    color: #FF7D00;
    border: 1rpx solid #FF7D00;
  }
  
  .green {
    background: #E8F8F1;
    color: #00BAAD;
    border: 1rpx solid #00BAAD;
  }
  
  .blue {
    background: #E8F3FF;
    color: #1890FF;
    border: 1rpx solid #1890FF;
  }
  
  .spec-card {
      background: white;
      border-radius: 16rpx;
      padding: 0 30rpx;
      margin-top: 30rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    }
  
    .spec-item {
      padding: 30rpx 0;
      display: flex;
      justify-content: space-between;
    }
  
    .service-info-item,
    .service-content-item {
      align-items: flex-start;
    }
  
    .spec-name {
      width: 160rpx;
      color: #666;
      font-size: 28rpx;
      flex-shrink: 0;
    }
  
    .service-info-content,
    .content-container {
      flex: 1;
      margin-left: 20rpx;
    }
  
    /* 服务信息区域调整 */
    .price-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 20rpx;
      flex-wrap: wrap;
    }
  
    .price-group {
      display: flex;
      align-items: baseline;
    }
  
    .service-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 20rpx;
      line-height: 1.4;
    }
  
    /* 徽章组调整 */
    .badge-group {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;
      margin-top: 15rpx;
    }
  
    /* 服务内容图片调整 */
    .content-image {
      width: 100%;
      border-radius: 8rpx;
      margin-top: 15rpx;
    }
  .section-title {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
  }
  
  .title-decoration {
    width: 8rpx;
    height: 36rpx;
    background: #1fc7d6;
    border-radius: 4rpx;
    margin-right: 16rpx;
  }
  
  .title-text {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
  
  .content-image {
    width: 100%;
    border-radius: 8rpx;
  }
  
  /* 底部操作栏 */
  .action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    padding: 20rpx;
    background: white;
    box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);
  }
  
  .action-btn {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 90rpx;
    border-radius: 45rpx;
    font-size: 32rpx;
    transition: all 0.3s;
  }
  
  .contact {
    background: white;
    border: 1rpx solid #1fc7d6;
    color: #1fc7d6;
    margin-right: 20rpx;
  }
  
  .primary {
    background: linear-gradient(90deg, #1fc7d6, #1fc7d6);
    color: white;
    box-shadow: 0 8rpx 16rpx rgba(0, 186, 173, 0.3);
  }
  
  .primary:active {
    opacity: 0.9;
    transform: translateY(2rpx);
  }
  
  .btn-icon {
    width: 40rpx;
    height: 40rpx;
    margin-right: 10rpx;
  }
</style>