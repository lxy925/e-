<template>
  <view class="container">
    <!-- 聊天头部 - 显示聊天对象信息 -->
    <view class="chat-header">
      <view class="header-content">
        <view class="back-btn" @click="goBack">
          <image src="/static/images/icons/back.png" class="back-icon"></image>
        </view>
        <view class="left-section">
          <image class="patient-avatar" :src="chatPartner && chatPartner.avatar ? chatPartner.avatar : '/static/service-default.png'"></image>
          <view class="info-text">
            <text class="patient-name">{{chatPartner && chatPartner.name ? chatPartner.name : '未知用户'}}</text>
            <text class="online-status">在线</text>
          </view>
        </view>
      </view>
    </view>
    
    <scroll-view class="chat-content" scroll-y>
      <view v-for="(item, index) in messageList" :key="index">
        <!-- 时间显示 -->
        <view class="time-wrap" v-if="showTime(index)">
          <text class="time">{{formatTime(item.timestamp)}}</text>
        </view> 
                
        <view :class="['message', item.type]">
          <template v-if="item.type === 'doctor'">
            <view class="user-info">
              <image class="avatar" :src="chatPartner && chatPartner.avatar ? chatPartner.avatar : '/static/service-default.png'"></image>
            </view>
            <view class="msg-content" @longpress="handleLongPress">
              <template v-if="item.messageType === 'text'">
                <text user-select>{{item.content}}</text>
              </template>
              <template v-else-if="item.messageType === 'image'">
                <image :src="item.content" mode="widthFix" class="msg-image"></image>
              </template>
              <template v-else-if="item.messageType === 'location'">
                <view class="location-message">
                  <text>{{item.content.address}}</text>
                </view>
              </template>
            </view>
          </template>
               
          <template v-else>
            <view class="user-info">
              <image class="avatar" :src="chatPartner && chatPartner.avatar ? chatPartner.avatar : '/static/service-default.png'"></image>
            </view>
            <view class="msg-content" @longpress="handleLongPress">
              <template v-if="item.messageType === 'text'">
                <text user-select>{{item.content}}</text>
              </template>
              <template v-else-if="item.messageType === 'image'">
                <image :src="item.content" mode="widthFix" class="msg-image"></image>
              </template>
              <template v-else-if="item.messageType === 'location'">
                <view class="location-message">
                  <text>{{item.content.address}}</text>
                </view>
              </template>
            </view>
          </template>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部输入区域 -->
    <view class="footer">
      <view class="input-area">
        <view class="plus-btn" @click="toggleMediaOptions">
          <text class="iconfont">+</text>
        </view>
        <input 
          type="text" 
          v-model="messageText" 
          placeholder="请输入内容" 
          @focus="onInputFocus"
        />
        <button @click="sendMessage">发送</button>
      </view>

      <!-- 多媒体选项弹出层 -->
      <view class="media-options" v-if="showMediaOptions">
        <view class="options-container">
          <view class="option-item" @click="chooseImage">
            <view class="icon-wrapper">
              <image src="/static/images/icons/picture.png" class="option-icon"></image>
            </view>
            <text>图片</text>
          </view>
          <view class="option-item" @click="chooseVideo">
            <view class="icon-wrapper">
              <image src="/static/images/icons/video.png" class="option-icon"></image>
            </view>
            <text>视频</text>
          </view>
          <view class="option-item" @click="chooseFile">
            <view class="icon-wrapper">
              <image src="/static/images/icons/file.png" class="option-icon"></image>
            </view>
            <text>文件</text>
          </view>
          <view class="option-item" @click="chooseLocation">
            <view class="icon-wrapper">
              <image src="/static/images/icons/location.png" class="option-icon"></image>
            </view>
            <text>位置</text>
          </view>
        </view>
      </view>
    </view>
  </view>
	<!--<view>
  <img :src="modalImage" class="modal-image"/> 
	</view>-->
</template>

<script>
const db = uniCloud.database();

export default {
  data() {
    return {
      messageText: '',
      messageList: [],
      sessionId: Date.now().toString(),
      userId: '',
      showMediaOptions: false,
      chatPartner: null,
      userType: '',
      orderInfo: null
    }
  },
  
  async onLoad() {
    console.log('页面加载');
    this.sessionId = Date.now().toString();
     
    try {
        // 初始化用户ID和类型
        const userInfo = uni.getStorageSync('userInfo');
        if (userInfo) {
            this.userId = userInfo._id;
            this.userType = userInfo.type;
            
            // 获取聊天对象信息
            await this.getChatPartner();
        } else {
            uni.showToast({
                title: '请先登录',
                icon: 'none'
            });
            setTimeout(() => {
                uni.navigateBack();
            }, 1500);
        }
    } catch (e) {
        console.error('获取用户信息失败:', e);
        uni.showToast({
            title: '获取用户信息失败',
            icon: 'none'
        });
        setTimeout(() => {
            uni.navigateBack();
        }, 1500);
    }
  },
  
  methods: {
    // 获取聊天对象信息
    async getChatPartner() {
        try {
            console.log('开始获取聊天对象信息，用户类型：', this.userType);
            console.log('当前用户ID：', this.userId);
            
            // 查询订单
            const orderCollection = db.collection('order');
            const query = {
                order_status: '已确认',
                $or: [
                    { user_id: this.userId },
                    { escort_id: this.userId }
                ]
            };
            
            console.log('查询订单条件：', query);
            const { result } = await orderCollection.where(query).get();
            console.log('订单查询结果：', result);
            
            if (result.data && result.data.length > 0) {
                this.orderInfo = result.data[0];
                console.log('当前订单信息：', this.orderInfo);
                
                // 根据订单信息确定聊天对象
                let partnerId;
                if (this.userId === this.orderInfo.user_id) {
                    // 当前用户是普通用户，聊天对象是陪诊师
                    partnerId = this.orderInfo.escort_id;
                    console.log('当前用户是普通用户，聊天对象ID：', partnerId);
                    
                    // 从escorts数据库获取陪诊师信息
                    const escortsCollection = db.collection('escorts');
                    console.log('开始查询陪诊师信息，ID：', partnerId);
                    
                    // 先尝试使用doc方法
                    try {
                        const escortResult = await escortsCollection.doc(partnerId).get();
                        console.log('陪诊师查询结果（doc方法）：', escortResult);
                        
                        if (escortResult.result && escortResult.result.data && escortResult.result.data.length > 0) {
                            this.chatPartner = escortResult.result.data[0];
                            console.log('获取到的陪诊师信息：', this.chatPartner);
                        } else {
                            // 如果doc方法失败，尝试使用where方法
                            console.log('doc方法未找到陪诊师，尝试使用where方法');
                            const escortWhereResult = await escortsCollection.where({
                                _id: partnerId
                            }).get();
                            console.log('陪诊师查询结果（where方法）：', escortWhereResult);
                            
                            if (escortWhereResult.result && escortWhereResult.result.data && escortWhereResult.result.data.length > 0) {
                                this.chatPartner = escortWhereResult.result.data[0];
                                console.log('获取到的陪诊师信息：', this.chatPartner);
                            } else {
                                throw new Error('未找到陪诊师信息');
                            }
                        }
                    } catch (e) {
                        console.error('查询陪诊师信息时出错：', e);
                        throw new Error('查询陪诊师信息失败：' + e.message);
                    }
                } else if (this.userId === this.orderInfo.escort_id) {
                    // 当前用户是陪诊师，聊天对象是普通用户
                    partnerId = this.orderInfo.user_id;
                    console.log('当前用户是陪诊师，聊天对象ID：', partnerId);
                    
                    // 从users数据库获取普通用户信息
                    const usersCollection = db.collection('users');
                    const userResult = await usersCollection.doc(partnerId).get();
                    if (userResult.result && userResult.result.data && userResult.result.data.length > 0) {
                        this.chatPartner = userResult.result.data[0];
                        console.log('获取到的普通用户信息：', this.chatPartner);
                    } else {
                        throw new Error('未找到用户信息');
                    }
                } else {
                    throw new Error('订单信息不匹配');
                }
            } else {
                uni.showToast({
                    title: '暂无聊天对象',
                    icon: 'none'
                });
                setTimeout(() => {
                    uni.navigateBack();
                }, 1500);
            }
        } catch (e) {
            console.error('获取聊天对象失败:', e);
            uni.showToast({
                title: e.message || '获取聊天对象失败',
                icon: 'none'
            });
            setTimeout(() => {
                uni.navigateBack();
            }, 1500);
        }
    },

    // 切换多媒体选项显示状态
    toggleMediaOptions() {
      this.showMediaOptions = !this.showMediaOptions;
    },
    
    // 输入框获取焦点时隐藏多媒体选项
    onInputFocus() {
      this.showMediaOptions = false;
    },
    
    // 发送消息
    async sendMessage() {
      if (!this.messageText.trim()) return;
     
      const userMessage = {
        type: 'patient',
        messageType: 'text',
        content: this.messageText,
        timestamp: Date.now()
      };
      this.messageList.push(userMessage);
     
      const question = this.messageText;
      this.messageText = '';
      this.showMediaOptions = false;  // 发送消息后隐藏多媒体选项
      
      // 模拟医生回复
      setTimeout(() => {
        const doctorMessage = {
          type: 'doctor',
          messageType: 'text',
          content: '收到您的消息了',
          timestamp: Date.now()
        };
        this.messageList.push(doctorMessage);
      }, 1000);
    },

    // 格式化时间
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    },
    
    // 判断是否显示时间
    showTime(index) {
      if(index === 0) return true;
      const currentMsg = this.messageList[index];
      const prevMsg = this.messageList[index - 1];
      return currentMsg.timestamp - prevMsg.timestamp > 5 * 60 * 1000;
    },
    
    // 选择图片
    async chooseImage() {
      try {
        const res = await uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera']
        });
        
        this.messageList.push({
          type: 'patient',
          messageType: 'image',
          content: res.tempFilePaths[0],
          timestamp: Date.now()
        });
        
        this.showMediaOptions = false;  // 选择后隐藏多媒体选项
      } catch (e) {
        console.error(e);
      }
    },
    
    // 选择视频
    async chooseVideo() {
      try {
        const res = await uni.chooseVideo({
          sourceType: ['album', 'camera']
        });
        
        this.messageList.push({
          type: 'patient',
          messageType: 'video',
          content: res.tempFilePath,
          timestamp: Date.now()
        });
        
        this.showMediaOptions = false;  // 选择后隐藏多媒体选项
      } catch (e) {
        console.error(e);
      }
    },
    
    // 选择位置
    async chooseLocation() {
      try {
        const res = await uni.chooseLocation();
        
        this.messageList.push({
          type: 'patient',
          messageType: 'location',
          content: {
            latitude: res.latitude,
            longitude: res.longitude,
            address: res.address
          },
          timestamp: Date.now()
        });
        
        this.showMediaOptions = false;  // 选择后隐藏多媒体选项
      } catch (e) {
        console.error(e);
      }
    },
    
    // 选择文件
    async chooseFile() {
      try {
        const res = await uni.chooseFile({
          count: 1,
          type: 'all'
        });
        
        this.messageList.push({
          type: 'patient',
          messageType: 'file',
          content: {
            name: res.tempFiles[0].name,
            path: res.tempFiles[0].path
          },
          timestamp: Date.now()
        });
        
        this.showMediaOptions = false;
      } catch (e) {
        console.error(e);
      }
    },
    
    // 处理长按事件
    handleLongPress() {
      // 实现长按事件的处理逻辑
    },

    // 返回方法
    goBack() {
        uni.navigateBack({
            delta: 1,
            fail: () => {
                // 如果返回失败，则跳转到首页
                uni.switchTab({
                    url: '/pages/index/index'
                });
            }
        });
    }
  }
}
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.chat-header {
  background-color: #ffffff;
  border-bottom: 1rpx solid #eee;
  width: 100%;
  padding-top: 20rpx;
}

.header-content {
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  height: 100rpx;
}

.back-btn {
  padding: 10rpx 20rpx;
  margin-right: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  width: 48rpx;
  height: 48rpx;
}

.left-section {
  display: flex;
  align-items: center;
  flex: 1;
}

.patient-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  border: 2rpx solid #eee;
}

.info-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.patient-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 4rpx;
}

.online-status {
  font-size: 24rpx;
  color: #4CAF50;
}

.chat-content {
  flex: 1;
  padding: 20rpx 30rpx;
  background-color: #f5f5f5;
}

.message {
  display: flex;
  margin-bottom: 30rpx;
  align-items: flex-start;
}

.doctor {
  flex-direction: row;
}

.patient {
  flex-direction: row-reverse;
}

.user-info {
  display: flex;
  align-items: flex-start;
  margin: 0 20rpx;
}

.avatar {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  border: 2rpx solid #eee;
}

.msg-content {
  max-width: 60%;
  padding: 20rpx 24rpx;
  border-radius: 8rpx;
  word-break: break-all;
  font-size: 28rpx;
  line-height: 1.4;
}

.doctor .msg-content {
  background-color: #fff;
  color: #333;
  border-radius: 0 16rpx 16rpx 16rpx;
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
}

.patient .msg-content {
  background-color: #02D4C6;
  color: #fff;
  border-radius: 16rpx 0 16rpx 16rpx;
}

.msg-image {
  max-width: 400rpx;
  border-radius: 8rpx;
}

.time-wrap {
  text-align: center;
  margin: 30rpx 0;
}

.time {
  font-size: 24rpx;
  color: #999;
  background-color: rgba(0,0,0,0.05);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.footer {
  background-color: #fff;
  border-top: 1rpx solid #eee;
  width: 100%;
}

.input-area {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
}

.plus-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #666;
  margin-right: 20rpx;
}

.input-area input {
  flex: 1;
  height: 72rpx;
  padding: 0 24rpx;
  background-color: #f5f5f5;
  border-radius: 36rpx;
  font-size: 28rpx;
  margin-right: 20rpx;
  border: none;
}

.input-area button {
  width: 120rpx;
  height: 72rpx;
  line-height: 72rpx;
  font-size: 28rpx;
  background-color: #02D4C6;
  color: #fff;
  border-radius: 36rpx;
  padding: 0;
}

.media-options {
  background-color: #fff;
  padding: 30rpx;
  border-top: 1rpx solid #eee;
}

.options-container {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding: 20rpx 0;
}

.option-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 20rpx;
}

.icon-wrapper {
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.option-icon {
  width: 60rpx;
  height: 60rpx;
}

.option-item text {
  font-size: 26rpx;
  color: #666;
}

.location-message {
  background: #f5f5f5;
  padding: 20rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
}

/* 文件消息样式 */
.msg-file {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
}

.file-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
}

.file-name {
  font-size: 28rpx;
  color: #333;
}
</style>