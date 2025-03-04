<template>
  <view class="container">
<<<<<<< HEAD:pages/index/index.uvue
    <view class="chat-header">
          <text class="doctor-name">陪诊咨询</text>
          <text class="doctor-dept">AI助手智能回答</text>
        </view>
=======
    <custom-nav title="陪诊咨询" :isHomePage="false"></custom-nav>
    <!-- <view class="chat-header">
      <text class="doctor-name">陪诊咨询</text>
      <text class="doctor-dept">AI助手智能回答</text>
    </view> -->
>>>>>>> lxy:pages/AI/AI.vue
    
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
const API_BASE_URL = 'http://192.168.10.103:3000';
const db = uniCloud.database();

export default {
  data() {
    return {
      messageText: '',
      messageList: [],
      accessToken: '',
      sessionId: '',
      userId: ''
    }
  },
  
  async onLoad() {
   console.log('页面加载，准备获取token');
     // 生成会话ID
     this.sessionId = Date.now().toString();
     
     try {
       // 初始化用户ID
       const userInfo = await uni.getStorage({
         key: 'userId'
       });
       this.userId = userInfo.data;
     } catch (e) {
       // 如果没有存储过用户ID，创建新的
       this.userId = 'user_' + Date.now();
       await uni.setStorage({
         key: 'userId',
         data: this.userId
       });
     }
     
     // 添加欢迎消息
     this.messageList.push({
       type: 'doctor',
       content: '您好！我是您的AI医疗助手。我可以为您提供以下帮助：\n\n1. 解答基础医疗问题\n2. 提供就医建议\n3. 健康知识咨询\n4. 症状初步分析\n\n请注意：我提供的建议仅供参考，具体诊断和治疗方案请以医生的专业意见为准。\n\n请问有什么可以帮您？',
       timestamp: Date.now()
     });
     
     // 获取历史消息
     await this.loadHistoryMessages();
     
     // 获取token
     this.getAccessToken();
  },
  
  methods: {
    // 检查服务器健康状态
    async checkServerHealth() {
      try {
        const res = await uni.request({
          url: `${API_BASE_URL}/health`,
          method: 'GET',
          timeout: 5000
        });
        return res.statusCode === 200;
      } catch (error) {
        console.error('服务器健康检查失败:', error);
        return false;
      }
    },

    // 获取token
    async getAccessToken(retryCount = 0) {
      const maxRetries = 3;
      const url = `${API_BASE_URL}/api/token`;
      console.log('请求token URL:', url);
      
      try {
        // 先检查服务器健康状态
        const isHealthy = await this.checkServerHealth();
        if (!isHealthy) {
          throw new Error('服务器未就绪');
        }

        const response = await uni.request({
          url,
          method: 'POST',
          header: {
            'content-type': 'application/json'
          },
          timeout: 10000
        });

        console.log('Token响应:', response);
        if (response.statusCode === 200 && response.data?.access_token) {
          this.accessToken = response.data.access_token;
          uni.showToast({
            title: '系统初始化成功',
            icon: 'success'
          });
        } else {
          throw new Error('无效的token响应');
        }
      } catch (error) {
        console.error('获取token失败:', error);
        
        if (retryCount < maxRetries) {
          console.log(`尝试重新获取token (${retryCount + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return this.getAccessToken(retryCount + 1);
        }

        uni.showModal({
          title: '连接失败',
          content: '无法连接到服务器，请检查网络设置或稍后重试',
          showCancel: false
        });
      }
    },

    // 加载历史消息
    async loadHistoryMessages() {
        try {
          const { result } = await db.collection('chat_messages')
            .where({
              userId: this.userId
            })
            .orderBy('timestamp', 'asc')
            .limit(50)
            .get();
            
          if (result && result.data) {
            // 保留欢迎消息，添加历史消息
            const welcomeMessage = this.messageList[0];
            this.messageList = [
              welcomeMessage,
              ...result.data.map(msg => ({
                type: msg.type,
                content: msg.content,
                timestamp: msg.timestamp
              }))
            ];
          } else {
            console.log('没有历史消息');
            // 只保留欢迎消息
            this.messageList = this.messageList.slice(0, 1);
          }
        } catch (error) {
          console.error('加载历史消息失败：', error);
          if (error.message.includes('schema.json')) {
            console.log('schema错误，继续执行');
            // 只保留欢迎消息
            this.messageList = this.messageList.slice(0, 1);
          }
        }
    },

    // 发送消息
    async sendMessage() {
      if(!this.messageText.trim()) return;
      
      const userQuestion = this.messageText;
      
      // 添加用户消息到列表
      const userMessage = {
        type: 'patient',
        content: userQuestion,
        timestamp: Date.now(),
        userId: this.userId,
        sessionId: this.sessionId
      };
      this.messageList.push(userMessage);
      
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
            access_token: this.accessToken,
            userId: this.userId,
            sessionId: this.sessionId
          },
          timeout: 65000
        });

        console.log('AI响应详情:', response);
        
        if (response.statusCode === 200 && response.data && response.data.result) {
          // 更新消息显示
          const aiMessage = {
            type: 'doctor',
            content: response.data.result,
            timestamp: Date.now(),
            userId: this.userId,
            sessionId: this.sessionId
          };
          this.messageList[loadingMessageIndex] = aiMessage;

          // 保存到数据库
          try {
            const collection = db.collection('chat_messages');
            
            // 保存用户消息
            await collection.add(userMessage);
            
            // 保存 AI 回复
            await collection.add(aiMessage);
            
            console.log('消息已保存到数据库');
          } catch (dbError) {
            console.error('保存到数据库失败:', dbError);
          }
        } else {
          throw new Error(response.data?.message || '未知错误');
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
    },

    // 导出聊天数据
    /*async exportChatData() {
      try {
        const { result } = await db.collection('chat_messages')
          .where({
            userId: this.userId
          })
          .orderBy('timestamp', 'asc')
          .get();

        if (!result || !result.data || result.data.length === 0) {
          uni.showToast({
            title: '没有可导出的数据',
            icon: 'none'
          });
          return;
        }

        // 格式化数据
        const exportData = result.data.map(msg => ({
          类型: msg.type === 'doctor' ? 'AI助手' : '用户',
          内容: msg.content,
          时间: new Date(msg.timestamp).toLocaleString()
        }));

        // 转换为CSV格式
        const headers = ['类型', '内容', '时间'];
        const csv = [
          headers.join(','),
          ...exportData.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\n');

        // 保存文件
        const fileName = `chat_history_${new Date().toISOString().split('T')[0]}.csv`;
        
        // 使用uni.saveFile保存文件
        const tempFilePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
        const fs = wx.getFileSystemManager();
        fs.writeFileSync(tempFilePath, csv, 'utf8');
        
        // 保存文件到本地
        uni.saveFile({
          tempFilePath,
          success: (res) => {
            uni.showModal({
              title: '导出成功',
              content: `文件已保存到: ${res.savedFilePath}`,
              showCancel: false
            });
          },
          fail: (error) => {
            console.error('保存文件失败:', error);
            uni.showToast({
              title: '导出失败',
              icon: 'none'
            });
          }
        });
      } catch (error) {
        console.error('导出数据失败:', error);
        uni.showToast({
          title: '导出失败',
          icon: 'none'
        });
      }
    }*/
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

.export-btn {
  font-size: 24rpx;
  padding: 10rpx 20rpx;
  background-color: #007AFF;
  color: #fff;
  border-radius: 30rpx;
  margin-left: auto;
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