<template>
  <view class="page">
    <!--pages/order_details/order_details.wxml-->

    <view class="container">
      <custom-nav title="e陪无忧" :isHomePage="false"></custom-nav>

      <scroll-view scroll-y="true" class="scroll-content">
        <view class="accompany-service">
          <image
            src="../../static/images/order/img_2.png"
            id="service-introduce"
            mode=""
          />
        </view>
        <view class="service-information">
          <view class="service-info">
            <text class="s_1">优惠价 </text>
            <text class="s_2">¥</text>
            <text class="s_3">{{ service.service_price }} </text>
            <text class="s_4" >起/小时/次 </text>
            <text class="s_5">已售{{ service.sold_quantity}}单</text>
          </view>
          <text class="s_6">{{service.service_name}}</text>
          <view class="text-container_2">
            <text class="s_7">平安自营</text>
            <text class="s_8">持证上岗更安心</text>
          </view>
        </view>
        <view class="options">
         
          <view class="quantity">
            <text>数量</text>
            <text>1</text>
          </view>
        </view>
        <view class="service-content">
          <view class="service-title">
            <text class="green">服务内容</text>
          </view>
          <view class="service-details">
            {{ service.service_details }}
          </view>
        </view>
      </scroll-view>
      <view class="fixed-buttons">
        <button class="customer-service">
          <image src="../../static/images/icons/order/icon_7.png" alt="" />
        </button>
        <button
          class="order-now"
          style="border: none; position: relative"
          @tap="goToOrder()"
        >
          <text class="button-text">立即下单</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "OrderComponent",
  data() {
    return {
      service:{}
    };
  },
  onLoad(options) {
    if (options.service) {
      this.service = JSON.parse(decodeURIComponent(options.service));
    }
    console.log(this.service)
  },
  methods: {
    goToOrder() {
      uni.navigateTo({
        url: "/pages/order/order",
      });
    },
  },
};
</script>

<style scoped>
/**index.wxss**/
/* pages/order_details/order_details.wxss */
page {
  background: linear-gradient(
    to bottom,
    #0bd6c8,
    #99efe9,
    #ddf5f4,
    rgb(226, 226, 226)
  );
}
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
  padding-top: 165rpx;
}

.scroll-content {
  flex: 1;
}

.image-container {
  position: relative; /* 使子元素可以绝对定位 */
}

.fixed-buttons {
  position: fixed; /* 固定在页面底部 */
  bottom: 0; /* 距离底部0 */
  left: 0; /* 距离左边0 */
  right: 0; /* 距离右边0 */
  display: flex;
  justify-content: space-between;
  padding: 20rpx 10rpx;
  background-color: #ffffff;
  border-top: 1px solid #ccc;
}

.order-now {
  flex: 0 0 60%; /* 右边按钮宽度 */
  background-color: #00baad;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 25rpx;
  border: none;
  box-shadow: 0 5rpx 5rpx 3rpx #00baae54;
}
#service-introduce {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 450rpx;
  object-fit: cover; /* 保持比例并填充容器 */
}

.accompany-service {
  position: relative;
}

.intro_1 {
  position: absolute; /* 绝对定位 */
  left: 5%; /* 距离左边5% */
  top: 12%; /* 距离顶部10% */
  color: white; /* 文字颜色 */
  padding: 5rpx; /* 内边距 */
  display: flex;
  flex-direction: column; /* 垂直排列 */
  font-size: 24rpx;
}
.intro_2 {
  position: absolute; /* 绝对定位 */
  left: 5%; /* 距离左边5% */
  bottom: 25%; /* 距离底部20% */
  padding: 5rpx; /* 内边距 */
}

.text-with-icon {
  display: flex; /* 使用flex布局 */
  align-items: flex-start; /* 垂直对齐 */
  margin-top: 10rpx; /* 调整文本与图片的间距 */
}

.text-container {
  display: flex;
  flex-direction: column; /* 垂直排列文本 */
}

.icon {
  width: 80rpx; /* 图标宽度 */
  height: 80rpx; /* 图标高度 */
  margin-right: 15rpx; /* 图标与文本之间的间距 */
}

.i_1 {
  margin-top: 5rpx;
  font-size: 30rpx;
  font-weight: 500;
}
.i_2 {
  margin-top: 5rpx;
  color: #c0c0c0;
  font-size: 18rpx;
}
.i_3 {
  color: #464646;
  display: block; /* 确保是块级元素 */
  white-space: normal; /* 允许换行 */
  font-size: 13rpx; /* 字体大小 */
  line-height: 22rpx; /* 行间距 */
  margin: 0; /* 确保没有外边距 */
  margin-top: 10rpx;
  padding: 0; /* 确保没有内边距 */
  overflow-wrap: break-word; /* 允许单词换行 */
  word-break: break-all; /* 强制换行 */
}
.text-container_1 {
  width: 90%; /* 设置容器宽度 */
  max-width: 340rpx; /* 最大宽度 */
}
.service-information {
  background-color: #ffffff;
  margin: 0 30rpx;
  margin-top: 30rpx;
  padding-bottom: 25rpx;
  border-radius: 10rpx;
}
.service-info {
  color: #02a89d;
  padding: 20rpx;
  padding-bottom: 5rpx;
}
.s_1 {
  margin-left: 10rpx;
  font-size: 30rpx;
}
.s_2 {
  margin-left: 3rpx;
  font-weight: bold;
  font-size: 40rpx;
}
.s_3 {
  font-weight: bold;
  font-size: 50rpx;
}
.s_4 {
  font-weight: 300;
}
.s_5 {
  color: #909090;
  margin-left: 170rpx;
}
.s_6 {
  color: #000000;
  margin-left: 27rpx;
  font-weight: normal;
  font-size: 40rpx;
}
.text-container_2 {
  margin-top: 30rpx;
}
.s_7 {
  color: #ff8d1a;
  border: 0.5rpx solid #ff8d1a;
  font-size: 25rpx;
  border-radius: 10rpx;
  margin-left: 25rpx;
  padding: 3rpx 5rpx;
}
.s_8 {
  color: #43cf7c;
  border: 0.5rpx solid #43cf7c;
  font-size: 25rpx;
  border-radius: 10rpx;
  margin-left: 20rpx;
  padding: 3rpx 5rpx;
}
.options {
  background-color: #ffffff;
  margin: 0 30rpx;
  margin-top: 30rpx;
  padding-bottom: 25rpx;
  border-radius: 10rpx;
  display: flex;
  flex-direction: column;
}

.quantity {
  display: flex;
  justify-content: space-between;
  margin: 25rpx 50rpx;
  margin-bottom: 0;
  padding-left: -15rpx;
  padding-right: 10rpx;
}
.selection {
  padding-bottom: 30rpx;
  border-bottom: 1px solid #ededed;
}
.quantity {
  padding-right: 30rpx;
}
.service-content {
  background-color: #ffffff;
  margin: 0 30rpx;
  margin-top: 30rpx;
  padding-bottom: 25rpx;
  border-radius: 10rpx;
  display: flex;
  flex-direction: column;
}
.service-title {
  margin-top: 40rpx;
  margin-left: 30rpx;
  font-weight: bold;
  font-size: 35rpx;
}
.green {
  background: linear-gradient(to bottom, transparent 50%, #4bcb7e93 100%);
  padding: 0 2rpx; /* 上下内边距为0，左右内边距为2rpx */
}
.service-details {
  
margin:20rpx 30rpx;
/* margin-left: 30rpx; */
padding: 20rpx 15rpx;
border-radius: 10rpx;
  background-color: #e4e4e4;
}
.customer-service {
  display: flex;
  justify-content: center;
  align-items: center; /* 垂直居中 */
  flex: 0 0 14%; /* 左边按钮宽度 */
  height: 100rpx;
  padding: 5rpx; /* 添加内边距以增加按钮大小 */
  border: 6rpx solid #8fe1db;
  border-radius: 25rpx;
}
.customer-service image {
  width: 80%;
  height: 80%;
  object-fit: contain;
}
</style>
