<template>
  <view class="container">
    <custom-nav title="陪诊咨询" :isHomePage="false"></custom-nav>
    <!-- <view class="chat-header">
      <text class="doctor-name">陪诊咨询</text>
      <text class="doctor-dept">AI助手智能回答</text>
    </view> -->
    
    <scroll-view class="chat-content" scroll-y>
      <view v-for="(item, index) in messageList" :key="index">
        <!-- 时间显示 -->
        <view class="time-wrap" v-if="showTime(index)">
          <text class="time">{{formatTime(item.timestamp)}}</text>
        </view> 
                
             <view :class="['message', item.type]">
               <template v-if="item.type === 'doctor'">
                 <view class="user-info">
                   <image class="avatar" src="/static/doctor.jpg"></image>
                 </view>
                 <view class="msg-content" @longpress="handleLongPress">
                   <text user-select>{{item.content}}</text>
                 </view>
               </template>
               
               <template v-else>
                
                 <view class="msg-content" @longpress="handleLongPress">
                   <text user-select>{{item.content}}</text>
                 </view>
                 <view class="user-info">
                   <image class="avatar" src="/static/patient.png"></image>
                 </view>
             </template>
           </view>
      </view>
    </scroll-view>
    
    <view class="input-area">
      <input type="text" v-model="messageText" placeholder="请输入内容" />
      <button @click="sendMessage">发送</button>
    </view>
  </view>
</template>

<script>
const API_BASE_URL = 'http://192.168.0.105:3000';

export default {
  data() {
    return {
      messageText: '',
      messageList: [
        {
          type: 'doctor',
          content: '您好，我是AI医生助手，请问有什么可以帮您？',
          timestamp: Date.now()
        }
      ],
      accessToken: ''
    }
  },
  
  onLoad() {
      console.log('页面加载，准备获取token');
      // 延迟执行，确保页面完全加载
      setTimeout(() => {
        this.getAccessToken();
      }, 1000);
    },
  
  methods: {
    getAccessToken() {
      // 使用完整的URL
      const url = `${API_BASE_URL}/api/token`;
      console.log('请求token URL:', url);
      
      // 使用 Promise 包装请求
      uni.request({
        url,
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
		timeout: 10000, // 设置10秒超时
        success: (res) => {
          console.log('Token响应:', res);
          if (res.data && res.data.access_token) {
            this.accessToken = res.data.access_token;
            uni.showToast({
              title: '系统初始化成功',
              icon: 'success'
            });
          } else {
            console.error('获取token失败:', res);
            uni.showToast({
              title: '系统初始化失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('请求失败:', err);
                    // 显示具体错误信息
                    uni.showModal({
                      title: '请求失败',
                      content: JSON.stringify(err),
                      showCancel: false
                    });
         },
        complete: () => {
            console.log('请求完成');
            }
        });
    },

async sendMessage() {
  if(!this.messageText.trim()) return;
  
  const userQuestion = this.messageText;
  
  // 添加用户消息
  this.messageList.push({
    type: 'patient',
    content: userQuestion,
    timestamp: Date.now()
  });
  
  this.messageText = '';
  
  if (!this.accessToken) {
    uni.showToast({
      title: '系统未就绪，请稍后重试',
      icon: 'none'
    });
    return;
  }
  
  // 显示医生正在输入状态
  const loadingMessageIndex = this.messageList.length;
  this.messageList.push({
    type: 'doctor',
    content: '正在思考中...',
    timestamp: Date.now()
  });
  
  try {
      const response = await uni.request({
        url: `${API_BASE_URL}/api/chat`,
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        data: {
          messages: [
            {
              role: 'user',
              content: userQuestion
            }
          ],
          access_token: this.accessToken
        },
        timeout: 65000  // 增加到65秒
      });
  
      console.log('AI响应详情:', {
        statusCode: response.statusCode,
        data: response.data,
        header: response.header
      });
      
      if (response.statusCode === 200 && response.data && response.data.result) {
        this.messageList[loadingMessageIndex] = {
          type: 'doctor',
          content: response.data.result,
          timestamp: Date.now()
        };
      } else {
        const errorMsg = response.data?.message || '未知错误';
        console.error('AI响应错误:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('AI回答出错：', error);
      this.messageList[loadingMessageIndex] = {
        type: 'doctor',
        content: '抱歉，我暂时无法回答，请稍后再试。错误信息：' + (error.errMsg || error.message),
        timestamp: Date.now()
      };
      
      uni.showToast({
        title: error.errMsg || error.message || '获取回答失败',
        icon: 'none',
        duration: 3000
      });
    }
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
      // 如果与上一条消息间隔超过5分钟，显示时间
      return currentMsg.timestamp - prevMsg.timestamp > 5 * 60 * 1000;
    }
  }
}
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding-top: 200rpx;
}

.chat-header {
  padding: 20rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #eee;
}

.doctor-name {
  font-size: 32rpx;
  font-weight: bold;
}

.doctor-dept {
  font-size: 24rpx;
  color: #666;
  margin-left: 20rpx;
}

.chat-content {
  flex: 1;
  padding: 20rpx;
  background-color: #f5f5f5;
}

.time-wrap {
  text-align: center;
  margin: 20rpx 0;
}

.time {
  font-size: 24rpx;
  color: #999;
  background-color: rgba(0,0,0,0.1);
  padding: 4rpx 10rpx;
  border-radius: 8rpx;
}

.message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 30rpx;
}

.doctor {
  justify-content: flex-start;
}

.patient {
  justify-content: flex-end;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  min-width: 80rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
}

.msg-content {
  max-width: 60vw;
  padding: 20rpx;
  word-break: break-all;
  user-select: text;
  background-color: #e4e4e4;
  border-radius: 10rpx;
}

.doctor-msg {
  background-color: #ffffff;
  border-radius: 0 10rpx 10rpx 10rpx;
  margin-left: 20rpx;
}

.patient-msg {
  background-color: #a0e75a;
  border-radius: 10rpx 0 10rpx 10rpx;
  margin-right: 20rpx;
}

/* 添加加载状态的样式 */
.msg-content.loading {
  opacity: 0.6;
}

.loading-dots {
  display: inline-block;
  animation: loading 1.4s infinite;
}

@keyframes loading {
  0%, 20%, 80%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}

.input-area {
  display: flex;
  padding: 20rpx;
  background-color: #fff;
  border-top: 1rpx solid #eee;
  width: 100%;
  height: 100rpx;
}

.input-area input {
  flex: 1;
  height: 70rpx;
  padding: 0 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 35rpx;
  margin-right: 20rpx;
}

.input-area button {
  width: 150rpx;
  height: 70rpx;
  line-height: 70rpx;
  font-size: 28rpx;
  background-color: #007AFF;
  color: #fff;
}

.msg-content text {
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

/* 添加长按菜单样式 */
.msg-content.active {
  background-color: rgba(0, 0, 0, 0.1);
}
</style>