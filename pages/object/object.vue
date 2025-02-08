<!--pages/object.wxml-->
<template>
  <view class="page">
    <view class="object_info">
    <view class="add_object_container">
      <button class="add_object">
        <text class="add_text">+新增服务对象</text>
      </button>
      <view class="divider"></view>
    </view>
      <view class="input_group">
        <text class="label">服务对象姓名</text>
        <input class="input" placeholder="请填写就诊人姓名" v-model="name" />
      </view>
      <view class="input_group">
        <text class="label">服务对象性别</text>
        <button class="gender-select" @tap="showGenderPicker">
          <text>{{selectedGender ? selectedGender : '请选择性别'}}</text>
        </button>
      </view>
      <view class="input_group">
        <text class="label">服务对象年龄</text>
        <input class="input" placeholder="请填写周岁年龄" v-model="age" />
      </view>
      <view class="input_group">
        <text class="label">服务对象手机</text>
        <input class="input" placeholder="如没有可填监护人手机号" v-model="phone" />
      </view>
      <view class="input_group">
        <text class="label">与就诊人关系</text>
        <input class="input" placeholder="请选择与就诊人关系" v-model="relationship" />
      </view>
      <view class="button-container">
        <button class="object_confirm" @tap="submitData"><text>确认保存</text></button>
      </view>
    </view>
   <!-- 自定义底部弹出框 -->
   <view v-if="showPicker" class="picker-overlay" @tap="hideGenderPicker">
      <view class="picker-content" @tap="stopPropagation">
          <view class="picker-option" @tap="selectGender" data-value="男">男</view>
          <view class="picker-option" @tap="selectGender" data-value="女">女</view>
          <button class="close-picker" @tap="hideGenderPicker">关闭</button>
      </view>
   </view>
  </view>
</template>

<script>
export default {
  name: 'OrderComponent',
  data() {
    return {
      name: '', // 服务对象姓名
      selectedGender: '',
      age: '', // 服务对象年龄
      phone: '', // 服务对象手机
      relationship: '', // 与就诊人关系
      showPicker: false,
    };
  },
  methods: {
    showGenderPicker() {
      this.showPicker = true;
    },
    
    hideGenderPicker() {
      this.showPicker = false;
    },
    
    selectGender(event) {
      const gender = event.currentTarget.dataset.value;
      this.selectedGender = gender;
      this.showPicker = false;
    },
    
    stopPropagation(event) {
      event.stopPropagation();
    },
    
    submitData() {
      const dataToSubmit = {
        name: this.name, // 直接使用 data 中的值
        gender: this.selectedGender,
        age: this.age, // 直接使用 data 中的值
        phone: this.phone, // 直接使用 data 中的值
        relationship: this.relationship, // 直接使用 data 中的值
      };

      // 调用云函数提交数据
      uniCloud.callFunction({
        name: 'server_object', // 云函数名称
        data: dataToSubmit,
      }).then(res => {
        console.log('提交结果：', res);
        if (res.result.code === 0) {
          uni.showToast({
            title: '提交成功',
            icon: 'success'
          });
        } else {
          uni.showToast({
            title: '提交失败',
            icon: 'none'
          });
        }
      }).catch(err => {
        console.error('提交错误：', err);
        uni.showToast({
          title: '提交失败',
          icon: 'none'
        });
      });
    }
  },
  created() {
    console.log('Created Refs:', this.$refs); // 检查 refs 是否可用
  }
}
</script>

<style scoped>
/* pages/object.wxss */

.page {
  margin: 0; /* 确保没有外边距 */
  padding: 0; /* 确保没有内边距 */
  width: 100%; /* 确保宽度为100% */
  height: 100%;
  background: linear-gradient(#18d1c2, #F2F3F9, white);
}

.object_info {
  padding: 0; /* 确保没有内边距 */
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 15rpx;
  margin: 0 auto;
  margin-top: 30rpx; /* 仅保留顶部间距 */
  width: 93%; /* 允许宽度自适应 */
}

.add_object{
  background-color: #ffffff;
  width: 90%;
  margin: 15rpx;
  padding-top:15rpx ;
}
.button-container {
    display: flex; /* 使用 Flexbox 布局 */
    justify-content: center; /* 水平居中 */
}
.object_confirm{
  flex: 0 0 600rpx;
  height: 100rpx;
  font-size: 35rpx;
  font-weight: 500;
  background-color: #1c8a1c;
  color: #ffffff;
  margin: 20rpx;
  line-height:100rpx;
}
.add_text{
  font-size: 35rpx;
  font-weight: 500;
}
.input_group{
  padding: 30rpx;
  display: flex !important; /* 强制使用 Flexbox 布局 */
  align-items:center;
  justify-content: space-between;
  margin-bottom: 10rpx; /* 添加底部间距 */
  border-bottom: 0.1rpx solid #b3b3b36e ;
}
.input {
  flex: 1; /* 输入框占据剩余空间 */
  font-size: 35rpx;
  color: #B3B3B3;
  border: none;
  padding: 10rpx;
  flex:2;
  text-align: right;
  white-space: nowrap; /* 不允许换行 */
}
.input::placeholder {
  text-align: right; /* placeholder 文本右对齐 */
  color: #B3B3B3; /* placeholder 颜色 */
}
.label {
  flex:1;
  font-size: 35rpx;
  color: #000000;
  font-weight: 500;
  white-space: nowrap; /* 不允许换行 */
}
.custom-radio {
  display: flex;
  align-items: center;
  margin: 0; /* 去掉外边距 */
  padding: 0; /* 去掉内边距 */
}
.radio-input {
  display: none; /* 隐藏默认的 radio 按钮 */
}
.radio-label {
  font-size: 35rpx;
  color: #000000;
  padding: 20rpx 30rpx;
  cursor: pointer; /* 鼠标悬停时显示为手型 */
  border: 1px solid rgba(22, 150, 22, 0.301);
  border-radius: 10rpx;
}
.add_object_container {
  display: flex;
  flex-direction: column; /* 垂直排列 */
  align-items: center; /* 水平居中 */
}

.divider {
  width: 100%; /* 下划线宽度 */
  height: 2rpx; /* 下划线高度 */
  background-color: #b3b3b36e; /* 下划线颜色 */
  margin-top: 10rpx; /* 按钮与下划线之间的间距 */
}
/* 在相应的 CSS 文件中添加 */
.picker-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5); /* 半透明背景 */
    display: flex;
    justify-content: center;
    align-items: flex-end; /* 从底部升起 */
}

.picker-content {
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    width:100%;
    text-align: center;
}

.picker-option {
  margin: 15rpx 0;
  padding: 20rpx 0;
    font-size: 18px;
    cursor: pointer;
    text-align: center; /* 文本居中 */
    border: none; /* 去掉边框 */
}

.close-picker {
    margin-top: 20px;
}
.gender-select{
  font-size: 35rpx;
  font-weight: 500;
  height: 80rpx;
}
</style>