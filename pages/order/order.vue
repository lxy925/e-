<template>
	<view class="page">
    <custom-nav title="e陪无忧" :isHomePage="false"></custom-nav>
  <!--index.wxml-->
    <view class="container">
      <view class="userinfo">
        <view class="appointment-info">
          <image src="../../static/images/icons/order/icon_1.png" class="icon" />
          <text class="title">预约信息</text>
        </view>
        <view class="input-group">
          <text class="label">就诊人</text>
          <input class="input" placeholder="请选择就诊人" />
        </view>
        <view class="input-group">
          <text class="label">服务医院</text>
          <input class="input" placeholder="请选择医院" />
        </view>
        <view class="input-group">
          <text class="label">服务时间</text>
          <input class="input" placeholder="请选择服务时间" />
        </view>
        <view class="input-group">
          <text class="label">陪诊师</text>
          <input class="input" placeholder="请选择陪诊师" />
        </view>
        <view class="note-info">
          <image src="../../static/images/icons/order/icon_2.png" class="icon" />
          <text class="note">若不填陪诊师，我们将为您自动匹配优秀陪诊师</text>
        </view>
      </view>
      
      <view class="department">
        <text class="label_1">科室</text> 
        <text class="more">更多>></text>
        <view class="department-list">
          <button class="department-item top-margin">儿科</button>
          <button class="department-item top-margin">妇产科</button>
          <button class="department-item top-margin">内科</button>
          <button class="department-item">外科</button>
          <button class="department-item">精神科</button>
          <button class="department-item">心胸外科</button>
        </view>
      </view>
  
      <view class="upload-section">
        <view class="upload-labels">
          <text class="label_1">上传材料</text>
          <text class="label_2">(就诊卡、病例、挂号记录等)</text>
        </view>
        <button class="upload-button">
          <image src="../../static/images/icons/order/icon_3.png" class="upload-icon" />
          <text class="upload-text">添加图片</text>
        </button>
      </view>
  
      <view class="requirements">
        <text class="label_1">就诊人特点及陪诊需求</text>
        <view class="requirements-list">
          <label class="custom-checkbox">
            <text class="checkbox-text">半自理</text>
            <checkbox value="halfSelf" class="hidden-checkbox" />
          </label>
          <label class="custom-checkbox">
            <text class="checkbox-text">无法自理</text>
            <checkbox value="noSelf" class="hidden-checkbox" />
          </label>
          <label class="custom-checkbox">
            <text class="checkbox-text">普通话沟通</text>
            <checkbox value="common" class="hidden-checkbox" />
          </label>
          <label class="custom-checkbox">
            <text class="checkbox-text">有家属陪同</text>
            <checkbox value="family" class="hidden-checkbox" />
          </label>
          <label class="custom-checkbox">
            <text class="checkbox-text">男陪诊师</text>
            <checkbox value="family" class="hidden-checkbox" />
          </label>
          <label class="custom-checkbox">
            <text class="checkbox-text">女陪诊师</text>
            <checkbox value="family" class="hidden-checkbox" />
          </label>
        </view>
      </view>
    </view>
	
    <view class="submit">
      <view class="total">
        <view class="total-info">
          <text class="total-label">总额</text>
          <text class="currency" style="color: black;">¥</text>
          <text class="total-amount" style="color:#DD5858;">90.00</text>
        </view>
        <text class="discount">含单值保险 ¥30 优惠抵扣 ¥5</text>
      </view>
      <button class="submit-button">提交订单</button>
    </view>
	</view>
</template>

<script>
export default {
  name: 'OrderComponent',
  data() {
    return {
      // Define your data properties here
    };
  },
  methods: {
    // Define your methods here
  }
}
</script>

<style scoped>
/**index.wxss**/
.page {
  height: 100vh;
  display: flex;
  flex-direction: column; /* 垂直排列子元素 */
  background: linear-gradient(to bottom, #0bd6c8, #99efe9,#ddf5f4,rgb(226, 226, 226));
  padding-top: 200rpx; 
}

.container {
  height:100vh;
  margin: 0 20rpx;
  border-radius: 30rpx; /* 圆角 */
  background-color: #ffffff; /* 容器背景为白色 */
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3); /* 更明显的阴影，调整为更接近图片的效果 */
  display: flex; /* 使用 flexbox 布局 */
  flex-direction: column; /* 垂直排列子元素 */
  justify-content: flex-start; /* 顶部对齐 */
  align-items: flex-start; /* 确保子元素顶部对齐 */
  padding: 20rpx; /* 保持内边距 */
  padding-bottom: 50rpx;
}

.userinfo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  color: #333;
  margin-top: 0; /* 确保没有顶部外边距 */
  padding: 0; /* 确保没有内边距 */
  margin-bottom: 20rpx;
}

.title {
  font-size: 23px; /* 字体大小与图片一致 */
  font-weight:normal;
  margin-bottom: 15rpx;
  color: #000000 /* 主色调 */
}

.input-group {
  display: flex;
  width: 100%;
  margin-bottom: 15rpx;
  border-bottom: 0.5px solid rgba(224, 224, 224, 0.5); /* 更细更淡的底部边框 */
  padding-bottom: 10rpx; /* 可选：为输入框留出一些空间 */
}

.label {
  width: 100px;
  color: #646464;
  font-weight: 500; /* 标签稍微加粗 */
}

.input {
  font-size: 15px;
  color: #B3B3B3;
  flex: 1;
  border: none;
  border-radius: 4px;
  padding: 10rpx;
}


.note-info {
  display: flex; /* 使用 flexbox 布局 */
  align-items: center; /* 垂直居中对齐 */
  margin-top: 5rpx; /* 与上方内容的间距 */
}

.note {
  font-size: 16px;
  color: #B29A6C;
}

.department {
  margin-top: 0; /* 确保没有顶部外边距 */
  padding: 0; /* 确保没有内边距 */
}

.department-list {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
}

.department-item {
font-size: 16px;
  flex: 0 0 27%; /* 每个复选框占据 30% 的宽度 */
  display: flex; /* 使用 flexbox 布局 */
  align-items: center; /* 水平居中对齐 */
  justify-content: center; /* 垂直居中对齐 */
  background-color: #E5E5E5; /* 背景颜色 */
  border-radius: 20px; /* 圆角 */
  padding:0rpx ;
  margin:0rpx 30rpx; /* 按钮之间的间距 */
  margin-bottom: 20rpx; /* 按钮之间的间距 */
}
.department-item:nth-child(1){
  margin-left:1rpx ;
}
.department-item:nth-child(4){
  margin-left:1rpx ;
}
.department-item:nth-child(3){
  margin-right:1rpx ;
}
.department-item:nth-child(6){
  margin-right:1rpx ;
}

.upload-section {
  display: flex;
  flex-direction: column; /* 垂直排列 */
  margin-top: 20rpx; /* 顶部间距 */
  width: 100%; /* 确保父容器宽度为 100% */
  align-items: flex-start; /* 确保子元素靠左对齐 */
}

.upload-labels {
  display: flex; /* 使用 flexbox 布局 */
  align-items: center; /* 垂直居中对齐 */
  margin-bottom: 10rpx; /* 与按钮的间距 */
}

.upload-button {
  width: 200rpx !important; /* 强制设置按钮宽度 */
  height: 200rpx !important; /* 强制设置高度 */
  background-color: #E5E5E5; /* 背景颜色 */
  color: #333; /* 字体颜色 */
  border-radius: 15px; /* 圆角 */
  border: none; /* 边框 */
  font-size: 16px; /* 字体大小 */
  display: flex; /* 使用 flexbox 布局 */
  flex-direction: column; /* 垂直排列 */
  align-items: center; /* 水平居中对齐 */
  justify-content: center; /* 垂直居中对齐 */
  margin-top: 10rpx; /* 顶部间距 */
}

.upload-icon {
  width: 70rpx; /* 图标宽度 */
  height: 70rpx; /* 图标高度 */
  margin-bottom: 5rpx; /* 图标与文本之间的间距 */
}
.upload-text{
  font-size: 13px;
  color:#BABABA;
}


.submit {
  display: flex; /* 使用 flexbox 布局 */
  justify-content: space-between; /* 在两端对齐 */
  align-items: center; /* 垂直居中对齐 */
  margin-top: 70rpx; /* 顶部间距 */
  padding: 20rpx; /* 内边距 */
  background-color: #ffffff; /* 背景颜色 */
  border-radius: 10rpx; /* 圆角 */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* 阴影效果 */
  position: fixed;
  bottom: 2rpx;
  width: 100%;
}

.total {
  margin-left: 10rpx;
  display: flex; /* 使用 flexbox 布局 */
  flex-direction: column; /* 垂直排列 */
  justify-content: flex-start; /* 顶部对齐 */
  margin-right: 100rpx; /* 与按钮的间距 */
}

.total-info {
  display: flex; /* 使用 flexbox 布局 */
  align-items: center; /* 垂直居中对齐 */
}

.total-label {
  font-size: 16px; /* 字体大小 */
  color: #333; /* 字体颜色 */
  margin-right: 10rpx; /* 标签与金额之间的间距 */
}

.currency {
  font-size: 18px; /* 字体大小 */
  margin-right: 5rpx; /* 与金额之间的间距 */
}

.total-amount {
  font-size: 18px; /* 字体大小 */
  font-weight: bold; /* 加粗 */
}
.discount {
  font-size: 12px; /* 字体大小 */
  color: #999; /* 字体颜色 */
}

.submit-button {
  width: 300rpx; /* 设置按钮宽度 */
  height: 80rpx; /* 设置高度 */
  background-color: #2196f3; /* 背景颜色 */
  color: white; /* 字体颜色 */
  border-radius: 30px; /* 圆角 */
  border: none; /* 去掉边框 */
  font-size: 16px; /* 字体大小 */
  display: flex; /* 使用 flexbox 布局 */
  align-items: center; /* 垂直居中对齐 */
  justify-content: center; /* 水平居中对齐 */
}

.icon {
  width: 45rpx; /* 图标宽度 */
  height: 45rpx; /* 图标高度 */
  margin-right: 20rpx; /* 图标与文本之间的间距 */
}

.appointment-info {
 display: flex; /* 使用 flexbox 布局 */
  align-items: center; /* 垂直居中对齐 */
  margin-bottom: 15rpx; /* 与下方内容的间距 */
}
.label_1{
  font-size: 17px;
  color: #545454;
}
.more {
  font-size: 16px; /* 字体大小 */
  color:#808080; /* 颜色 */
  margin-left: 500rpx; /* 自动左边距以右对齐 */
  align-self: center; /* 垂直居中对齐 */
}

.top-margin {
  margin-top: 25rpx; /* 仅为这三个按钮添加顶部间距 */
}
.label_2{
margin-left: 35rpx;
  font-size:15px;
  color: #B0B0B0;
}

.requirements-list {
  display: flex; /* 使用 flexbox 布局 */
  flex-wrap: wrap; /* 允许换行 */
}

.custom-checkbox {
  flex: 0 0 24%; /* 每个复选框占据 30% 的宽度 */
  display: flex; /* 使用 flexbox 布局 */
  align-items: center; /* 水平居中对齐 */
  justify-content: center; /* 垂直居中对齐 */
  background-color: #E5E5E5; /* 背景颜色 */
  border-radius: 20px; /* 圆角 */
  padding: 7rpx 10rpx; /* 内边距 */
  margin:12rpx 28rpx; /* 按钮之间的间距 */
  margin-bottom: 10rpx; /* 按钮之间的间距 */
}
.custom-checkbox:nth-child(1){
  margin-top: 30rpx;
  margin-left: 1rpx;
}
.custom-checkbox:nth-child(4){
  margin-left: 1rpx !important;
}
.custom-checkbox:nth-child(3){
  margin-top: 30rpx;
  margin-right: 1rpx;
}
.custom-checkbox:nth-child(2){
  margin-top: 30rpx;
}
.custom-checkbox:nth-child(6){
  margin-right: 1rpx !important;
}
.hidden-checkbox {
  display: none; /* 隐藏原始复选框 */
}

.checkbox-text {
  font-size: 16px; /* 字体大小 */
  color: #333; /* 字体颜色 */
  margin-left: 10rpx; /* 文本与复选框之间的间距 */
}

.requirements {
  margin-top: 0; /* 确保没有顶部外边距 */
  margin-bottom: 0; /* 确保没有底部外边距 */
  padding: 0; /* 确保没有内边距 */
}

</style>