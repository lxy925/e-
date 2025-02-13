<template>
	<view class="page">
 <view class="container">
  <custom-nav title="e陪无忧" :isHomePage="false"></custom-nav>

   <view class="header">
     <view class="search-container">
       <input class="search-input" placeholder="请输入交易名称" />
       <image src="../../static/images/icons/order/icon_4.png" class="search-icon" />
     </view>
     <view class="filter-container">
       <image src="../../static/images/icons/order/icon_5.png" class="filter-icon" />
       <text class="filter-text">筛选</text>
       <view class="notification">12</view>
     </view>
   </view>
 <view class="tabs">
 <text :class="{'tab': true, 'active': currentTab == 0}" bindtap="selectTab" data-index="0">全部</text>
 <text :class="{'tab': true, 'active': currentTab == 1}" bindtap="selectTab" data-index="1">待服务</text>
 <text :class="{'tab': true, 'active': currentTab == 2}" bindtap="selectTab" data-index="2">进行中</text>
 <text :class="{'tab': true, 'active': currentTab == 3}" bindtap="selectTab" data-index="3">已完成</text>
 <text :class="{'tab': true, 'active': currentTab == 4}" bindtap="selectTab" data-index="4">已取消</text>
 </view>
 <view class="content">
    <view class="trade-container">
     <text class="trade-info">全部：共0件交易</text>
     <view class="bulk-operation">批量操作</view>
    </view>
     <image src="../../static/images/order/img_1.png" class="empty-image" />
     <text class="empty-text">暂无数据~</text>
 </view>
 </view>
	</view>
</template>

<script>
export default {
  name: 'OrderComponent',
  data() {
    return {
      // Define your data properties here
	  currentTab: 0,
    };
  },
  methods: {
    // Define your methods here
	selectTab(event) {
    const index = event.currentTarget.dataset.index; // 获取点击的 tab 索引
    console.log('Clicked tab index:', index); // 调试信息
    this.setData({
      currentTab: index // 更新当前选中的 tab
    });
    console.log('Updated currentTab:', this.data.currentTab); // 确认 currentTab 的值是否更新
  }
  }
}
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
  background: linear-gradient(to bottom, #0bd6c8, #99efe9,#ddf5f4,rgb(226, 226, 226));
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
  background-color: #F5F5F5;
  border-radius: 15px; /* 圆角 */
}

.notification {
  border: none;
  background-color:#D64444; /* 红色背景 */
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
  margin-bottom: 20rpx;
}

.tab {
  font-size: 18px; /* 字体大小 */
  color: #383838; /* 默认字体颜色 */
  padding: 10rpx; /* 增加内边距 */
  position: relative; /* 使横线相对定位 */
}

.active {
  color: #568EFF !important; /* 选中时字体颜色 */
  border-bottom: 2rpx solid #568EFF !important; /* 选中时下方横线 */
}

.content {
  background-color: #F5F5F5;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
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
  color: #568EFF; /* 批量操作字体颜色 */
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
  color: #26D7CF;
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
  color: #B9B9B9; /* 字体颜色 */
}
</style>