<template>
  <view class="page">
    <view class="container">
      <custom-nav title="e陪无忧" :isHomePage="false"></custom-nav>

      <view class="header">
        <view class="search-container">
          <input class="search-input" placeholder="请输入交易名称" />
          <image
            src="../../static/images/icons/order/icon_4.png"
            class="search-icon"
          />
        </view>
        <view class="filter-container">
          <image
            src="../../static/images/icons/order/icon_5.png"
            class="filter-icon"
          />
          <text class="filter-text">筛选</text>
          <view class="notification">12</view>
        </view>
      </view>
      <view class="tabs">
        <text
          @click="selectTab(0)"
          :class="{ tab: true, active: currentTab == 0 }"
          bindtap="selectTab"
          data-index="0"
          >全部</text
        >
        <text
          @click="selectTab(1)"
          :class="{ tab: true, active: currentTab == 1 }"
          bindtap="selectTab"
          data-index="1"
          >待服务</text
        >
        <text
          @click="selectTab(2)"
          :class="{ tab: true, active: currentTab == 2 }"
          bindtap="selectTab"
          data-index="2"
          >进行中</text
        >
        <text
          @click="selectTab(3)"
          :class="{ tab: true, active: currentTab == 3 }"
          bindtap="selectTab"
          data-index="3"
          >已完成</text
        >
        <text
          @click="selectTab(4)"
          :class="{ tab: true, active: currentTab == 4 }"
          bindtap="selectTab"
          data-index="4"
          >已取消</text
        >
      </view>
      <view class="content">
        <text>当前选中的 Tab: {{ currentTab }}</text>
        <!-- 当数据库为空的时候显示 -->
        <!-- <view class="trade-container">
          <text class="trade-info">全部：共0件交易</text>
          <view class="bulk-operation">批量操作</view>
        </view>
        
        可以复制多个 order-item 来显示多个订单 -->
        <view class="order-item">
          <view class="order-header">
            <text class="order-time">2024-01-20 14:30</text>
            <text class="order-status">待服务</text>
          </view>

          <view class="order-content">
            <image
              class="service-image"
              src="../../static/images/service-demo.png"
            />
            <view class="service-info">
              <view>
                <text class="service-title">3h陪诊服务</text>
                <view class="service-tags">
                  <text class="tag">专车接送</text>
                  <text class="tag">星级陪诊师</text>
                </view>
                <text class="service-desc"
                  >预约时间：2024-01-25 15:00-18:00</text
                >
              </view>
              <view class="price-info">
                <text class="price">¥299.00</text>
              </view>
            </view>
          </view>

          <view class="order-footer">
            <view class="btn btn-default">取消订单</view>
            <view class="btn btn-primary">立即支付</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "OrderComponent",
  data() {
    return {
      // Define your data properties here
      currentTab: 0,
    };
  },
  //设置页面初始状态
  onLoad(options) {
    // 接收传递过来的参数
    const type = options.type;
    console.log("接收到的参数:", type);
    // 将参数设置为 currentTab 的值
    if (type) {
      this.currentTab = parseInt(type);
    }
  },
  methods: {
    selectTab(index) {
      this.currentTab = index; // 更新当前选中的 tab
      console.log("当前选中的 tab 索引:", this.currentTab); // 调试信息
    },
  },
};
</script>

<style scoped>
.container {
  margin: 0; /* 重置外边距 */
  padding: 0; /* 重置内边距 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100vh;
  /* background-color: #ffffff; 背景颜色 */
  background: linear-gradient(
    to bottom,
    #0bd6c8,
    #99efe9,
    #ddf5f4,
    rgb(226, 226, 226)
  );
  padding-top: 200rpx;
}

.header {
  margin: 0; /* 重置外边距 */
  padding: 10rpx; /* 添加内边距 */
  display: flex;
  justify-content: space-between; /* 使输入框和通知图标分开 */
  align-items: center; /* 垂直居中 */
  width: 100%; /* 使头部占满宽度 */
  background-color: #ffffff; /* 背景颜色 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
}

.title {
  font-size: 28px; /* 增大标题字体大小 */
  font-weight: bold;
  color: #333;
}

.search-container {
  position: relative; /* 使子元素可以绝对定位 */
  width: 80%; /* 容器宽度 */
}

.search-icon {
  position: absolute; /* 绝对定位 */
  left: 60rpx; /* 距离左边的距离 */
  top: 50%; /* 垂直居中 */
  transform: translateY(-50%); /* 使图标垂直居中 */
  width: 45rpx; /* 图标宽度 */
  height: 45rpx; /* 图标高度 */
}

.search-input {
  margin-left: 40rpx;
  width: 80%; /* 输入框宽度 */
  padding: 20rpx 10rpx 20rpx 80rpx; /* 内边距，左边留出空间给图标 */
  border: none; /* 边框 */
  background-color: #f5f5f5;
  border-radius: 15px; /* 圆角 */
}

.notification {
  border: none;
  background-color: #d64444; /* 红色背景 */
  color: #fff; /* 字体颜色 */
  border-radius: 40%; /* 圆形 */
  width: 60rpx; /* 宽度 */
  height: 38rpx; /* 高度 */
  display: flex; /* 使用 flex 布局 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  position: absolute; /* 绝对定位 */
  top: -25rpx; /* 调整位置 */
  right: -20rpx; /* 调整位置 */
}

.tabs {
  background-color: #ffffff;
  display: flex;
  justify-content: space-around;
  width: 100%;
}

.tabs text {
  font-size: 18px;
  color: #383838;
  padding: 10rpx;
  cursor: pointer;
}

.tabs text.active {
  color: #568eff; /* 选中时字体颜色 */
  border-bottom: 2rpx solid #568eff; /* 选中时下方横线 */
}

.content {
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 20rpx;
  box-sizing: border-box;
}

.order-item {
  background-color: #ffffff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.order-time {
  color: #999;
  font-size: 24rpx;
}

.order-status {
  color: #568eff;
  font-size: 24rpx;
}

.order-content {
  display: flex;
  padding: 20rpx 0;
}

.service-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
}

.service-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.service-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
  font-weight: 500;
}

.service-desc {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.price-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  color: #ff4d4f;
  font-size: 32rpx;
  font-weight: bold;
}

.order-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
  gap: 20rpx;
}

.btn {
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
}

.btn-primary {
  background-color: #568eff;
  color: #fff;
}

.btn-default {
  background-color: #f5f5f5;
  color: #666;
}

.service-tags {
  display: flex;
  gap: 10rpx;
  margin-bottom: 10rpx;
}

.tag {
  background-color: #f0f8ff;
  color: #568eff;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  font-size: 22rpx;
}

.trade-container {
  display: flex; /* 使用 Flexbox 布局 */
  justify-content: space-between; /* 左右对齐 */
  width: calc(100% - 20rpx); /* 减去内边距 */
  box-sizing: border-box; /* 包括内边距和边框在内 */
  padding: 10rpx; /* 添加内边距 */
  margin-top: 20rpx;
}

.trade-info {
  margin-left: 20rpx;
  color: #383838; /* 默认字体颜色 */
  font-size: 16px; /* 字体大小 */
}

.bulk-operation {
  color: #568eff; /* 批量操作字体颜色 */
  font-size: 16px; /* 字体大小 */
  cursor: pointer; /* 鼠标悬停时显示为可点击 */
}

.empty-image {
  width: 70%;
  height: 400rpx;
  margin: 40rpx auto;
}

.empty-text {
  text-align: center;
  margin-top: 10rpx;
  font-size: 18px;
  color: #26d7cf;
}

.filter-container {
  display: flex; /* 使用 flex 布局 */
  align-items: center; /* 垂直居中 */
  justify-content: flex-end; /* 靠右对齐 */
  width: 15%; /* 容器宽度 */
  margin-top: 10rpx; /* 顶部间距 */
  margin-right: 40rpx;
  position: relative;
}

.filter-icon {
  width: 40rpx; /* 图标宽度 */
  height: 40rpx; /* 图标高度 */
  margin-right: 5rpx; /* 图标与文本之间的间距 */
}

.filter-text {
  font-size: 16px; /* 字体大小 */
  color: #b9b9b9; /* 字体颜色 */
}
</style>
