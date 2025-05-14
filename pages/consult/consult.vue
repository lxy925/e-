<template>
  <view class="container">
    <!-- 聊天头部 - 显示聊天对象信息 -->
    <view class="chat-header">
      <view class="header-content">
        <view class="back-btn" @click="goBack">
          <image src="/static/images/icons/back.png" class="back-icon"></image>
        </view>
        <view class="left-section">
          <image class="patient-avatar" :src="getPartnerAvatar()"></image>
          <view class="info-text">
            <text class="patient-name">{{getPartnerName()}}</text>
            <!--<text class="online-status">在线</text>-->
          </view>
        </view>
      </view>
    </view>
    
    <scroll-view class="chat-content" scroll-y :scroll-top="scrollTop" @scrolltoupper="loadMoreMessages">
      <view v-for="(item, index) in messageList" :key="index">
        <!-- 时间显示 -->
        <view class="time-wrap" v-if="showTime(index)">
          <text class="time">{{formatTime(item.time)}}</text>
        </view> 
                
        <view :class="['message', isSelfMessage(item) ? 'self' : 'other']">
          <view class="user-info">
            <image class="avatar" :src="isSelfMessage(item) ? getSelfAvatar() : getPartnerAvatar()"></image>
          </view>
          <view class="msg-content" @longpress="handleLongPress">
            <template v-if="item.message_type === 'text'">
              <text user-select>{{item.content}}</text>
            </template>
            <template v-else-if="item.message_type === 'image'">
              <image :src="item.content" mode="widthFix" class="msg-image"></image>
            </template>
            <template v-else-if="item.message_type === 'location'">
              <view class="location-message">
                <text>{{item.content}}</text>
              </view>
            </template>
          </view>
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
</template>

<script>
const db = uniCloud.database();
const messageCollection = db.collection('messages');

export default {
  data() {
    return {
      messageText: '',
      messageList: [],
      sessionId: '',
      userId: '',
      showMediaOptions: false,
      chatPartner: null,
      userType: '',
      orderInfo: null,
      scrollTop: 0,
      messageListener: null,
      pageSize: 20,
      hasMore: true
    }
  },
  
  async onLoad() {
    console.log('页面加载');
    this.sessionId = Date.now().toString();
     
    try {
      const currentUserInfo = uni.getStorageSync('currentUserInfo');
      console.log('获取到的用户信息：', currentUserInfo);
      
      if (!currentUserInfo) {
        throw new Error('用户信息不存在');
      }

      if (!currentUserInfo._id) {
        throw new Error('用户ID不存在');
      }

      if (!currentUserInfo.type) {
        throw new Error('用户类型不存在');
      }

      if (!currentUserInfo.partner_id) {
        throw new Error('聊天对象ID不存在');
      }

      this.userId = currentUserInfo._id;
      this.userType = currentUserInfo.type;
      
      console.log('初始化用户信息：', {
        userId: this.userId,
        userType: this.userType
      });

      await this.getChatPartner();
      await this.loadMessages();
      this.startMessageListener();
    } catch (e) {
      console.error('页面加载失败:', e);
      uni.showToast({
        title: e.message || '页面加载失败',
        icon: 'none'
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  },
  
  onUnload() {
    // 页面卸载时停止监听
    if (this.messageListener) {
      this.messageListener.close();
    }
  },
  
  methods: {
    // 获取聊天对象信息
    async getChatPartner() {
      try {
        console.log('开始获取聊天对象信息，用户类型：', this.userType);
        console.log('当前用户ID：', this.userId);
        
        const currentUserInfo = uni.getStorageSync('currentUserInfo');
        if (!currentUserInfo || !currentUserInfo.partner_id) {
          throw new Error('未找到聊天对象信息');
        }
        
        let partnerId = currentUserInfo.partner_id;
        let collection;
        
        if (this.userType === '普通用户') {
          collection = db.collection('escorts');
        } else {
          collection = db.collection('users');
        }
        
        console.log('开始查询聊天对象信息，ID：', partnerId);
        const { result } = await collection.doc(partnerId).get();
        
        if (result.data && result.data.length > 0) {
          this.chatPartner = result.data[0];
          console.log('获取到的聊天对象信息：', this.chatPartner);
        } else {
          throw new Error('未找到聊天对象信息');
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
    
    // 判断是否是自己的消息
    isSelfMessage(message) {
      return message.user_id === this.userId;
    },
    
    // 获取自己的头像
    getSelfAvatar() {
      const currentUserInfo = uni.getStorageSync('currentUserInfo');
      return currentUserInfo.avatar || '/static/service-default.png';
    },
    
    // 加载历史消息
    async loadMessages() {
      try {
        if (!this.userId || !this.chatPartner || !this.chatPartner._id) {
          throw new Error('用户信息不完整');
        }
        
        const { result } = await messageCollection
          .where({
            $or: [
              { user_id: this._id, escort_id: this.chatPartner._id },
              { user_id: this.chatPartner._id, escort_id: this._id }
            ]
          })
          .orderBy('time', 'desc')
          .limit(this.pageSize)
          .get();
          
        if (result.data) {
          this.messageList = result.data.reverse();
          this.scrollToBottom();
        }
      } catch (e) {
        console.error('加载消息失败:', e);
        uni.showToast({
          title: '加载消息失败',
          icon: 'none'
        });
      }
    },
    
    // 加载更多历史消息
    async loadMoreMessages() {
      if (!this.hasMore) return;
      
      try {
        const lastMessage = this.messageList[0];
        const { result } = await messageCollection
          .where({
            $or: [
              { user_id: this._id, escort_id: this.chatPartner._id },
              { user_id: this.chatPartner._id, escort_id: this._id }
            ],
            time: db.command.lt(lastMessage.time)
          })
          .orderBy('time', 'desc')
          .limit(this.pageSize)
          .get();
          console.log('历史会话',result.data);
        if (result.data && result.data.length > 0) {
          this.messageList = [...result.data.reverse(), ...this.messageList];
          this.hasMore = result.data.length === this.pageSize;
        } else {
          this.hasMore = false;
        }
      } catch (e) {
        console.error('加载更多消息失败:', e);
      }
    },
    
    // 开始监听新消息
    startMessageListener() {
      try {
        if (this.messageListener) {
          this.messageListener.close();
        }
    
        // 监听双方的消息
        const query = {
          $or: [
            { user_id: this._id, escort_id: this.chatPartner._id }, // 用户1发送给用户2
            { user_id: this.chatPartner._id, escort_id: this._id } // 用户2发送给用户1
          ]
        };
    
        console.log('开始监听消息，查询条件：', query);
    
        this.messageListener = messageCollection
          .where(query)
          .orderBy('time', 'desc')
          .limit(20)
          .watch({
            onChange: (snapshot) => {
              console.log('收到新消息:', snapshot);
              if (snapshot.docs && snapshot.docs.length > 0) {
                const newMessages = snapshot.docs.map(doc => doc.data());
                // 过滤掉已经存在的消息
                const uniqueMessages = newMessages.filter(newMsg =>
                  !this.messageList.some(existingMsg =>
                    existingMsg._id === newMsg._id
                  )
                );
                if (uniqueMessages.length > 0) {
                  console.log('添加新消息:', uniqueMessages);
                  this.messageList = [...this.messageList, ...uniqueMessages];
                  this.scrollToBottom();
                }
              }
            },
            onError: (err) => {
              console.error('监听消息失败:', err);
            }
          });
      } catch (e) {
        console.error('启动消息监听失败:', e);
      }
    },
    
    // 发送消息
    async sendMessage() {
      if (!this.messageText.trim()) return;
      
      try {
        if (!this.userId || !this.chatPartner || !this.chatPartner._id) {
          throw new Error('用户信息不完整');
        }
        
        const message = {
          user_id: this.userId,
          escort_id: this.chatPartner._id,
          content: this.messageText,
          message_type: 'text',
          time: Date.now().toString(),
          status: 'sending',
          sender_type: this.userType,
          receiver_type: this.userType === '普通用户' ? '陪诊师' : '普通用户'
        };
        
        console.log('准备发送消息:', message);
        
        // 先显示消息
        this.messageList.push(message);
        this.scrollToBottom();
        
        // 发送到数据库
        const { result } = await messageCollection.add(message);
        
        if (result.id) {
          console.log('消息发送成功，ID:', result.id);
          // 更新消息状态为已发送
          const index = this.messageList.findIndex(msg => msg.status === 'sending');
          if (index !== -1) {
            this.messageList[index].status = 'sent';
            this.messageList[index]._id = result.id;
          }
        }
        
        this.messageText = '';
        this.showMediaOptions = false;
      } catch (e) {
        console.error('发送消息失败:', e);
        uni.showToast({
          title: '发送消息失败',
          icon: 'none'
        });
      }
    },
    
    // 滚动到底部
    scrollToBottom() {
      setTimeout(() => {
        const query = uni.createSelectorQuery().in(this);
        query.select('.chat-content').boundingClientRect();
        query.selectViewport().scrollOffset();
        query.exec((res) => {
          if (res[0]) {
            this.scrollTop = res[0].height;
          }
        });
      }, 100);
    },

    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(parseInt(timestamp));
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    },
    
    // 判断是否显示时间
    showTime(index) {
      if (index === 0) return true;
      const currentMsg = this.messageList[index];
      const prevMsg = this.messageList[index - 1];
      return parseInt(currentMsg.time) - parseInt(prevMsg.time) > 5 * 60 * 1000;
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
          time: Date.now()
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
          time: Date.now()
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
          time: Date.now()
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
          time: Date.now()
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
    },

    // 获取聊天对象头像
    getPartnerAvatar() {
      if (!this.chatPartner) return '/static/service-default.png';
      if (this.userType === '普通用户') {
        // 当前用户是普通用户，聊天对象是陪诊师
        return this.chatPartner.avatarUrl || '/static/service-default.png';
      } else {
        // 当前用户是陪诊师，聊天对象是普通用户
        return this.chatPartner.avatar || '/static/service-default.png';
      }
    },
    
    // 获取聊天对象名称
    getPartnerName() {
      if (!this.chatPartner) return '未知用户';
      if (this.userType === '普通用户') {
        // 当前用户是普通用户，聊天对象是陪诊师
        return this.chatPartner.name || '未知用户';
      } else {
        // 当前用户是陪诊师，聊天对象是普通用户
        return this.chatPartner.realName || '未知用户';
      }
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

.message.self {
  flex-direction: row-reverse;
}

.message.other {
  flex-direction: row;
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

.self .msg-content {
  background-color: #02D4C6;
  color: #fff;
  border-radius: 16rpx 0 16rpx 16rpx;
}

.other .msg-content {
  background-color: #fff;
  color: #333;
  border-radius: 0 16rpx 16rpx 16rpx;
  box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
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

.message {
  opacity: 1;
  transition: opacity 0.3s;
}

.message.sending {
  opacity: 0.7;
}
</style>

