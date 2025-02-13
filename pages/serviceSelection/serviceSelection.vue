<template>
  <view class="page">
    <custom-nav title="陪诊服务选择" :isHomePage="false"></custom-nav>
    <view class="service-list">
      <view class="service-card" v-for="(service, index) in services" :key="index" @click="goServiceInfo(service)">
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
        
      ]
    };
  },
  onLoad() {
    this.fetchServices();
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
    goServiceInfo(service){
        const serviceData = encodeURIComponent(JSON.stringify(service));
      uni.navigateTo({
        url: `/pages/order_details/order_details?service=${serviceData}`
      });
    },
    bookService(service) {
        const serviceData = encodeURIComponent(JSON.stringify(service));
      uni.navigateTo({
        url: `/pages/order/order?service=${serviceData}`
      });
      
    }
  }
};
</script>

<style>
.page {
    padding: 0 20rpx;
  padding-top: 200rpx;
 
}

.service-list {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.service-card {
  display: flex;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background-color: #ffffff;
  flex-direction: row;
  padding: 20rpx;
  position: relative;
}

.service-image {
  width: 150rpx;
  height: 150rpx;
  background-color: #e74c3c;
}

.service-info {
  flex: 1;
  padding: 10rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: 15rpx;
  
}

.service-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.service-price {
  font-size: 25rpx;
  color: #e74c3c;
}

.service-sold {
  font-size: 20rpx;
  color: #666;
}
.provide_transport{
position: absolute;
top: 8rpx;
left: 10rpx;
background-color: #0cefcd;
padding: 5rpx;
border-radius: 10rpx;

}
.book-button {
  background-color: #007AFF;
  color: #fff;
  border: none;
  border-radius: 10rpx;
  margin: 40rpx;
  margin-right: 0;
  text-align: center;
  font-size: 30rpx;
  cursor: pointer;
  
}
</style> 