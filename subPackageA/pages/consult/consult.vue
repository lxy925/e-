<template>
  <view class="container">
    <!-- 聊天头部 - 显示聊天对象信息 -->
    <view class="chat-header fixed">
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
              <image 
                :src="item.content" 
                mode="widthFix" 
                class="msg-image"
                @click="previewImage(item.content)"
                :style="{ maxWidth: '400rpx' }"
              ></image>
            </template>
            <template v-else-if="item.message_type === 'video'">
              <view class="video-message">
                <view class="video-container" @click="playVideo(item.content)">
                  <video 
                    :id="'video-' + index"
                    :src="item.content"
                    class="msg-video"
                    :controls="false"
                    :show-fullscreen-btn="false"
                    :show-play-btn="false"
                    :show-center-play-btn="true"
                    :enable-progress-gesture="false"
                    :style="{ maxWidth: '400rpx' }"
                    @error="handleVideoError"
                  ></video>
                  <view class="video-play-icon">
                    <!-- <image src="/static/images/icons/play.png" class="play-icon"></image> -->
                  </view>
                </view>
              </view>
            </template>
            <template v-else-if="item.message_type === 'file'">
              <view class="file-message" @click="downloadFile(item.content)">
                <view class="file-icon">
                  <image src="/static/images/icons/file.png" class="file-type-icon"></image>
                </view>
                <view class="file-info">
                  <text class="file-name">{{JSON.parse(item.content).name}}</text>
                  <text class="file-size">{{formatFileSize(JSON.parse(item.content).size)}}</text>
                </view>
              </view>
            </template>
            <template v-else-if="item.message_type === 'location'">
              <view class="location-message" @click="openLocation(item.content)">
                <view class="location-content">
                  <view class="location-info">
                    <text class="location-name">{{JSON.parse(item.content).name || JSON.parse(item.content).address}}</text>
                    <text class="location-address">{{JSON.parse(item.content).address}}</text>
                  </view>
                </view>
                <view class="location-map">
                  <map
                    :latitude="JSON.parse(item.content).latitude"
                    :longitude="JSON.parse(item.content).longitude"
                    :markers="[{
                      latitude: JSON.parse(item.content).latitude,
                      longitude: JSON.parse(item.content).longitude,
                      iconPath: '/static/images/icons/marker.png',
                      width: 32,
                      height: 32
                    }]"
                    scale="16"
                    style="width: 100%; height: 200rpx;"
                  ></map>
                </view>
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

    <!-- 全屏视频播放器 -->
    <view class="video-fullscreen" v-if="isFullscreen">
      <video 
        :id="'fullscreen-video'"
        :src="currentVideoUrl"
        class="fullscreen-video"
        controls
        autoplay
        :show-fullscreen-btn="false"
        :show-center-play-btn="false"
        :enable-progress-gesture="true"
        @ended="exitFullscreen"
      ></video>
      <view class="fullscreen-close" @click="exitFullscreen">
        <image src="/static/images/icons/close.png" class="close-icon"></image>
      </view>
    </view>

    <!-- 评价弹窗 -->
    <view class="review-modal" v-if="showReviewModal">
      <view class="review-content">
        <view class="review-header">
          <text class="review-title">服务评价</text>
          <view class="close-btn" @click="closeReviewModal">×</view>
        </view>
        <view class="rating-section">
          <text class="rating-label">评分</text>
          <view class="stars">
            <text 
              v-for="i in 5" 
              :key="i" 
              class="star" 
              :class="{ active: i <= reviewRating }"
              @click="setRating(i)"
            >★</text>
          </view>
        </view>
        <view class="content-section">
          <textarea 
            v-model="reviewContent" 
            placeholder="请输入您的评价内容" 
            class="review-textarea"
          ></textarea>
        </view>
        <view class="image-upload-section">
          <view class="image-list">
            <view 
              v-for="(image, index) in reviewImages" 
              :key="index" 
              class="image-item"
            >
              <image :src="image" mode="aspectFill"></image>
              <view class="delete-btn" @click="deleteReviewImage(index)">×</view>
            </view>
            <view class="upload-btn" @click="chooseReviewImage" v-if="reviewImages.length < 9">
              <text class="upload-icon">+</text>
            </view>
          </view>
        </view>
        <button class="submit-btn" @click="submitReview">提交评价</button>
      </view>
    </view>

    <!-- 就诊总结弹窗 -->
    <view class="summary-modal" v-if="showSummaryModal">
      <view class="summary-content">
        <view class="summary-header">
          <text class="summary-title">就诊总结</text>
          <view class="close-btn" @click="closeSummaryModal">×</view>
        </view>
        <view class="content-section">
          <textarea 
            v-model="summaryContent" 
            placeholder="请输入就诊总结内容" 
            class="summary-textarea"
          ></textarea>
        </view>
        <view class="image-upload-section">
          <view class="image-list">
            <view 
              v-for="(image, index) in summaryImages" 
              :key="index" 
              class="image-item"
            >
              <image :src="image" mode="aspectFill"></image>
              <view class="delete-btn" @click="deleteSummaryImage(index)">×</view>
            </view>
            <view class="upload-btn" @click="chooseSummaryImage" v-if="summaryImages.length < 9">
              <text class="upload-icon">+</text>
            </view>
          </view>
        </view>
        <button class="submit-btn" @click="submitSummary">提交总结</button>
      </view>
    </view>

    <!-- 隐藏 custom-nav，仅用于调用定位方法 -->
    <custom-nav
      ref="navRef"
      v-show="false"
    />
    <!-- 打卡弹窗 -->
    <view class="check-in-modal" v-if="showCheckInModal">
      <view class="check-in-content">
        <view class="check-in-header">
          <text class="check-in-title">打卡任务</text>
          <view class="close-btn" @click="closeCheckInModal">×</view>
        </view>
        <view class="check-in-body">
          <view class="location-section">
            <text class="section-title">当前位置</text>
            <view class="location-info" v-if="currentLocation">
              <text class="location-text">{{currentLocation.address}}</text>
              <button class="refresh-btn" @click="refreshLocation">刷新</button>
            </view>
			
            <button class="get-location-btn" @click="getLocation" v-else>获取位置</button>
          </view>
          <view class="image-section">
            <text class="section-title">现场照片</text>
            <view class="image-list">
              <view 
                v-for="(image, index) in checkInImages" 
                :key="index" 
                class="image-item"
              >
                <image :src="image" mode="aspectFill"></image>
                <view class="delete-btn" @click="deleteCheckInImage(index)">×</view>
              </view>
              <view class="upload-btn" @click="chooseCheckInImage" v-if="checkInImages.length < 9">
                <text class="upload-icon">+</text>
              </view>
            </view>
          </view>
          <!-- <view class="description-section">
            <text class="section-title">备注说明（选填）</text>
            <textarea 
              v-model="checkInDescription" 
              placeholder="请输入备注说明" 
              class="description-textarea"
            ></textarea>
          </view> -->
        </view>
        <button class="submit-btn" @click="submitCheckIn" :disabled="!canSubmitCheckIn">提交打卡</button>
      </view>
    </view>
  </view>
</template>

<script>
const db = uniCloud.database();
const messageCollection = db.collection('messages');
import customNav from '@/components/custom-nav/custom-nav.vue';

export default {
  components: {
    customNav
  },
  data() {
    return {
      messageText: '',
      messageList: [],
      sessionId: '',
      userId: '',
      userUserId: '',
      showMediaOptions: false,
      chatPartner: null,
      userType: '',
      orderInfo: null,
      scrollTop: 0,
      messageListener: null,
      pageSize: 20,
      hasMore: true,
      currentVideoId: null,
      isFullscreen: false,
      currentVideoUrl: '',
      videoContext: null,
      showReviewModal: false,
      reviewRating: 5,
      reviewContent: '',
      reviewImages: [],
      currentOrderId: '',
      showSummaryModal: false,
      summaryContent: '',
      summaryImages: [],
      showCheckInModal: false,
      currentCheckIn: null,
      currentLocation: null,
      checkInImages: [],
      //checkInDescription: '',
      checkInTimer: null
    }
  },
  
  computed: {
    canSubmitCheckIn() {
      return this.currentLocation && this.checkInImages.length > 0;
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

      if (!currentUserInfo.user_id) {
        throw new Error('用户ID不存在');
      }

      if (!currentUserInfo.type) {
        throw new Error('用户类型不存在');
      }

      if (!currentUserInfo.partner_id) {
        throw new Error('聊天对象ID不存在');
      }

      this.userId = currentUserInfo.user_id;
      this.userType = currentUserInfo.type;
      //this.userUserId = currentUserInfo.user_id;
      
      console.log('初始化用户信息：', {
        userId: this.userId,
        userType: this.userType
      });

      await this.getChatPartner();
      await this.loadMessages();
      this.startMessageListener();
      
      if (this.userType === '普通用户') {
        await this.checkOrderAndReview();
      }

      if (this.userType === '陪诊师') {
        await this.checkOrderAndSummary();
      }

      // 如果是陪诊师，启动打卡检查
      if (this.userType === '陪诊师') {
        this.startCheckInCheck();
      }
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
    if (this.messageListener) {
      this.messageListener.close();
    }
    if (this.checkInTimer) {
      clearInterval(this.checkInTimer);
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
        // 直接查users表
        const { result } = await uniCloud.database().collection('users').where({user_id: partnerId}).get();
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

    // 加载历史消息
    async loadMessages() {
      try {
        if (!this.userId || !this.chatPartner || !this.chatPartner.user_id) {
          throw new Error('用户信息不完整');
        }
        const { result } = await uniCloud.callFunction({
          name: 'chatMessage',
          data: {
            action: 'getMessages',
            data: {
              userId: this.userId,
              chatPartnerId: this.chatPartner.user_id,
              pageSize: this.pageSize,
              sender_type: this.userType
            }
          }
        });
        if (result.code === 200) {
          this.messageList = result.data;
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        } else {
          throw new Error(result.msg || '加载消息失败');
        }
      } catch (e) {
        console.error('加载消息失败:', e);
        uni.showToast({
          title: e.message || '加载消息失败',
          icon: 'none'
        });
      }
    },
    
    // 加载更多历史消息
    async loadMoreMessages() {
      if (!this.hasMore) return;
      
      try {
        const lastMessage = this.messageList[0];
        const { result } = await uniCloud.callFunction({
          name: 'chatMessage',
          data: {
            action: 'loadMoreMessages',
            data: {
              userId: this.userId,
              chatPartnerId: this.chatPartner._id,
              lastMessageTime: lastMessage.time,
              pageSize: this.pageSize,
              sender_type: this.userType
            }
          }
        });
        
        if (result.code === 200) {
          if (result.data && result.data.length > 0) {
            this.messageList = [...result.data, ...this.messageList];
            this.hasMore = result.data.length === this.pageSize;
          } else {
            this.hasMore = false;
          }
        } else {
          throw new Error(result.msg || '加载更多消息失败');
        }
      } catch (e) {
        console.error('加载更多消息失败:', e);
      }
    },
    
    // 开始监听新消息
    async startMessageListener() {
      try {
        if (this.messageListener) {
          this.messageListener.close();
        }
        
        // 使用云函数获取最新消息
        const { result } = await uniCloud.callFunction({
          name: 'chatMessage',
          data: {
            action: 'startMessageListener',
            data: {
              userId: this.userId,
              chatPartnerId: this.chatPartner.user_id,
              sender_type: this.userType
            }
          }
        });
        
        if (result.code === 200) {
          // 设置定时器定期检查新消息
          this.messageListener = setInterval(async () => {
            try {
              const { result } = await uniCloud.callFunction({
                name: 'chatMessage',
                data: {
                  action: 'startMessageListener',
                  data: {
                    userId: this.userId,
                    chatPartnerId: this.chatPartner.user_id,
                    lastMessageTime: this.messageList.length > 0 ? this.messageList[this.messageList.length - 1].time : '0',
                    sender_type: this.userType
                  }
                }
              });
              
              if (result.code === 200 && result.data && result.data.length > 0) {
                // 过滤掉已经存在的消息
                const newMessages = result.data.filter(newMsg =>
                  !this.messageList.some(existingMsg =>
                    existingMsg._id === newMsg._id || 
                    (existingMsg.status === 'sending' && existingMsg.time === newMsg.time)
                  )
                );
                
                if (newMessages.length > 0) {
                  this.messageList = [...this.messageList, ...newMessages];
                  this.scrollToBottom();
                }
              }
            } catch (e) {
              console.error('获取新消息失败:', e);
            }
          }, 3000); // 每3秒检查一次新消息
        } else {
          throw new Error(result.msg || '启动消息监听失败');
        }
      } catch (e) {
        console.error('启动消息监听失败:', e);
      }
    },
    
    // 发送消息
    async sendMessage() {
      if (!this.messageText.trim()) return;
      try {
        if (!this.userId || !this.chatPartner || !this.chatPartner.user_id) {
          throw new Error('用户信息不完整');
        }
        const message = {
          content: this.messageText,
          message_type: 'text',
          sender_type: this.userType,
          receiver_type: this.userType === '普通用户' ? '陪诊师' : '普通用户',
          userId: this.userId,
          chatPartnerId: this.chatPartner.user_id
        };
        // 先显示消息
        this.messageList.push({
          ...message,
          user_id: this.userId,
          escort_id: this.chatPartner.user_id,
          time: Date.now().toString(),
          status: 'sending'
        });
        this.scrollToBottom();
        const { result } = await uniCloud.callFunction({
          name: 'chatMessage',
          data: {
            action: 'sendMessage',
            data: message
          }
        });
        if (result.code === 200) {
          const index = this.messageList.findIndex(msg => msg.status === 'sending');
          if (index !== -1) {
            this.messageList[index].status = 'sent';
            this.messageList[index]._id = result.data.id;
          }
        } else {
          throw new Error(result.msg || '发送消息失败');
        }
        this.messageText = '';
        this.showMediaOptions = false;
      } catch (e) {
        console.error('发送消息失败:', e);
        uni.showToast({
          title: e.message || '发送消息失败',
          icon: 'none'
        });
      }
    },
    
    // 检查订单状态和评价
    async checkOrderAndReview() {
      try {
        const { result } = await uniCloud.callFunction({
          name: 'chatReview',
          data: {
            action: 'checkOrderAndReview',
            data: {
              userId: this.userId,
              escortId: this.chatPartner._id
            }
          }
        });
        
        if (result.code === 200) {
          if (result.data.hasOrder && !result.data.hasReview) {
            this.currentOrderId = result.data.orderId;
            this.showReviewModal = true;
          }
        } else {
          throw new Error(result.msg || '检查订单和评价失败');
        }
      } catch (e) {
        console.error('检查订单和评价失败:', e);
      }
    },
    
    // 检查订单状态和总结
    async checkOrderAndSummary() {
      try {
        const { result } = await uniCloud.callFunction({
          name: 'chatReview',
          data: {
            action: 'checkOrderAndSummary',
            data: {
              userId: this.userId,
              escortId: this.chatPartner._id
            }
          }
        });
        
        if (result.code === 200) {
          if (result.data.hasOrder && !result.data.hasSummary) {
            this.currentOrderId = result.data.orderId;
            this.showSummaryModal = true;
          }
        } else {
          throw new Error(result.msg || '检查订单和总结失败');
        }
      } catch (e) {
        console.error('检查订单和总结失败:', e);
      }
    },
    
    // 提交评价
    async submitReview() {
      try {
        if (!this.reviewContent.trim()) {
          uni.showToast({
            title: '请输入评价内容',
            icon: 'none'
          });
          return;
        }
        
        uni.showLoading({
          title: '提交中...'
        });
        
        // 上传图片
        const uploadedImages = [];
        for (const image of this.reviewImages) {
          const uploadRes = await uniCloud.uploadFile({
            filePath: image,
            cloudPath: `reviews/${Date.now()}_${Math.random().toString(36).slice(-6)}.${image.split('.').pop()}`
          });
          
          if (uploadRes && uploadRes.fileID) {
            uploadedImages.push(uploadRes.fileID);
          }
        }
        
        const reviewData = {
          order_id: this.currentOrderId,
          user_id: this.userId,
          escort_id: this.chatPartner._id,
          rating: this.reviewRating,
          content: this.reviewContent,
          images: uploadedImages,
          create_time: Date.now()
        };
        
        const { result } = await uniCloud.callFunction({
          name: 'chatReview',
          data: {
            action: 'submitReview',
            data: reviewData
          }
        });
        
        if (result.code === 200) {
          uni.showToast({
            title: '评价成功',
            icon: 'success'
          });
          this.closeReviewModal();
        } else {
          throw new Error(result.msg || '提交评价失败');
        }
      } catch (e) {
        console.error('提交评价失败:', e);
        uni.showToast({
          title: e.message || '提交评价失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
    
    // 提交总结
    async submitSummary() {
      try {
        if (!this.summaryContent.trim()) {
          uni.showToast({
            title: '请输入总结内容',
            icon: 'none'
          });
          return;
        }
        
        uni.showLoading({
          title: '提交中...'
        });
        
        // 上传图片
        const uploadedImages = [];
        for (const image of this.summaryImages) {
          const uploadRes = await uni.uploadFile({
            filePath: image,
            cloudPath: `summaries/${Date.now()}_${Math.random().toString(36).slice(-6)}.${image.split('.').pop()}`
          });
          
          if (uploadRes && uploadRes.fileID) {
            uploadedImages.push(uploadRes.fileID);
          }
        }
        
        const summaryData = {
          order_id: this.currentOrderId,
          user_id: this.chatPartner._id,
          escort_id: this.userId,
          content: this.summaryContent,
          images: uploadedImages,
          create_time: Date.now()
        };
        
        const { result } = await uni.callFunction({
          name: 'chatReview',
          data: {
            action: 'submitSummary',
            data: summaryData
          }
        });
        
        if (result.code === 200) {
          uni.showToast({
            title: '提交成功',
            icon: 'success'
          });
          this.closeSummaryModal();
        } else {
          throw new Error(result.msg || '提交总结失败');
        }
      } catch (e) {
        console.error('提交总结失败:', e);
        uni.showToast({
          title: e.message || '提交总结失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
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
			return message.sender_type === this.userType;
      
    },
    
    // 获取自己的头像
    getSelfAvatar() {
      const currentUserInfo = uni.getStorageSync('currentUserInfo');
      return currentUserInfo.avatar || '/static/service-default.png';
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
        const [err, res] = await uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera']
        });
        if (err) {
          throw new Error('选择图片失败');
        }
        if (!res || !res.tempFilePaths || res.tempFilePaths.length === 0) {
          throw new Error('未选择图片');
        }
        const tempFilePath = res.tempFilePaths[0];
        // 上传图片到云存储
        const uploadRes = await uniCloud.uploadFile({
          filePath: tempFilePath,
          cloudPath: `chat/images/${Date.now()}_${Math.random().toString(36).slice(-6)}.${tempFilePath.split('.').pop()}`
        });
        if (!uploadRes || !uploadRes.fileID) {
          throw new Error('上传图片失败：未获取到文件ID');
        }
        // 通过云函数发送消息
        const message = {
          content: uploadRes.fileID,
          message_type: 'image',
          sender_type: this.userType,
          receiver_type: this.userType === '普通用户' ? '陪诊师' : '普通用户',
          userId: this.userId,
          chatPartnerId: this.chatPartner.user_id
        };
        const { result } = await uniCloud.callFunction({
          name: 'chatMessage',
          data: {
            action: 'sendMessage',
            data: message
          }
        });
        if (result.code === 200) {
          // 可选：立即插入本地消息列表
          this.messageList.push({
            ...message,
            user_id: this.userId,
            escort_id: this.chatPartner.user_id,
            time: Date.now().toString(),
            status: 'sent',
            _id: result.data.id
          });
          this.scrollToBottom();
        } else {
          throw new Error(result.msg || '发送图片失败');
        }
        this.showMediaOptions = false;
      } catch (e) {
        console.error('发送图片失败:', e);
        uni.showToast({
          title: e.message || '发送图片失败',
          icon: 'none'
        });
      }
    },
    // 选择视频
    async chooseVideo() {
      try {
        const [err, res] = await uni.chooseVideo({
          sourceType: ['album', 'camera'],
          maxDuration: 60,
          camera: 'back'
        });
        if (err) {
          throw new Error('选择视频失败');
        }
        if (!res || !res.tempFilePath) {
          throw new Error('未选择视频');
        }
        const tempFilePath = res.tempFilePath;
        const fileExt = tempFilePath.substring(tempFilePath.lastIndexOf('.') + 1);
        // 上传视频到云存储
        const uploadRes = await uniCloud.uploadFile({
          filePath: tempFilePath,
          cloudPath: `chat/videos/${Date.now()}_${Math.random().toString(36).slice(-6)}.${fileExt}`
        });
        if (!uploadRes || !uploadRes.fileID) {
          throw new Error('上传视频失败：未获取到文件ID');
        }
        // 通过云函数发送消息
        const message = {
          content: uploadRes.fileID,
          message_type: 'video',
          sender_type: this.userType,
          receiver_type: this.userType === '普通用户' ? '陪诊师' : '普通用户',
          userId: this.userId,
          chatPartnerId: this.chatPartner.user_id
        };
        const { result } = await uniCloud.callFunction({
          name: 'chatMessage',
          data: {
            action: 'sendMessage',
            data: message
          }
        });
        if (result.code === 200) {
          this.messageList.push({
            ...message,
            user_id: this.userId,
            escort_id: this.chatPartner.user_id,
            time: Date.now().toString(),
            status: 'sent',
            _id: result.data.id
          });
          this.scrollToBottom();
        } else {
          throw new Error(result.msg || '发送视频失败');
        }
        this.showMediaOptions = false;
      } catch (e) {
        console.error('发送视频失败:', e);
        uni.showToast({
          title: e.message || '发送视频失败',
          icon: 'none'
        });
      }
    },
    // 选择文件
    async chooseFile() {
      try {
        const [err, res] = await uni.chooseMessageFile({
          count: 1,
          type: 'all',
          extension: ['.doc', '.docx', '.pdf', '.xls', '.xlsx', '.ppt', '.pptx', '.txt']
        });
        if (err) {
          throw new Error('选择文件失败');
        }
        if (!res || !res.tempFiles || res.tempFiles.length === 0) {
          throw new Error('未选择文件');
        }
        const file = res.tempFiles[0];
        // 上传文件到云存储
        const uploadRes = await uniCloud.uploadFile({
          filePath: file.path,
          cloudPath: `chat/files/${Date.now()}_${file.name}`
        });
        if (!uploadRes || !uploadRes.fileID) {
          throw new Error('上传文件失败：未获取到文件ID');
        }
        // 通过云函数发送消息
        const message = {
          content: JSON.stringify({
            name: file.name,
            size: file.size,
            fileID: uploadRes.fileID
          }),
          message_type: 'file',
          sender_type: this.userType,
          receiver_type: this.userType === '普通用户' ? '陪诊师' : '普通用户',
          userId: this.userId,
          chatPartnerId: this.chatPartner.user_id
        };
        const { result } = await uniCloud.callFunction({
          name: 'chatMessage',
          data: {
            action: 'sendMessage',
            data: message
          }
        });
        if (result.code === 200) {
          this.messageList.push({
            ...message,
            user_id: this.userId,
            escort_id: this.chatPartner.user_id,
            time: Date.now().toString(),
            status: 'sent',
            _id: result.data.id
          });
          this.scrollToBottom();
        } else {
          throw new Error(result.msg || '发送文件失败');
        }
        this.showMediaOptions = false;
      } catch (e) {
        console.error('发送文件失败:', e);
        uni.showToast({
          title: e.message || '发送文件失败',
          icon: 'none'
        });
      }
    },
    // 选择位置（用于发送位置消息）
    async chooseLocation() {
      try {
        const [err, res] = await uni.chooseLocation({
          latitude: 23.12463,  // 默认纬度
          longitude: 113.36199, // 默认经度
        });
        if (err) {
          throw new Error('选择位置失败');
        }
        if (!res) {
          throw new Error('未选择位置');
        }
        // 通过云函数发送消息
        const message = {
          content: JSON.stringify({
            latitude: res.latitude,
            longitude: res.longitude,
            address: res.address,
            name: res.name
          }),
          message_type: 'location',
          sender_type: this.userType,
          receiver_type: this.userType === '普通用户' ? '陪诊师' : '普通用户',
          userId: this.userId,
          chatPartnerId: this.chatPartner.user_id
        };
        const { result } = await uniCloud.callFunction({
          name: 'chatMessage',
          data: {
            action: 'sendMessage',
            data: message
          }
        });
        if (result.code === 200) {
          this.messageList.push({
            ...message,
            user_id: this.userId,
            escort_id: this.chatPartner.user_id,
            time: Date.now().toString(),
            status: 'sent',
            _id: result.data.id
          });
          this.scrollToBottom();
        } else {
          throw new Error(result.msg || '发送位置失败');
        }
        this.showMediaOptions = false;
      } catch (e) {
        console.error('发送位置失败:', e);
        uni.showToast({
          title: e.message || '发送位置失败',
          icon: 'none'
        });
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
      return this.chatPartner.avatar || '/static/service-default.png';
    },
    
    // 获取聊天对象名称
    getPartnerName() {
      if (!this.chatPartner) return '未知用户';
      return this.chatPartner.realName || this.chatPartner.nickName || '未知用户';
    },

    // 预览图片
    previewImage(src) {
      uni.previewImage({
        urls: [src],
        current: src
      });
    },

    // 下载文件
    async downloadFile(content) {
      try {
        const fileInfo = JSON.parse(content);
        if (!fileInfo.fileID) {
          throw new Error('文件信息不完整');
        }

        uni.showLoading({
          title: '下载中...'
        });
        
        // 获取文件的临时访问链接
        const res = await uniCloud.getTempFileURL({
          fileList: [fileInfo.fileID]
        });
        
        if (!res.fileList || !res.fileList[0] || !res.fileList[0].tempFileURL) {
          throw new Error('获取文件链接失败');
        }
        
        // 下载文件
        const downloadRes = await uni.downloadFile({
          url: res.fileList[0].tempFileURL,
          success: (res) => {
            if (res.statusCode === 200) {
              // 保存文件到本地
              uni.saveFile({
                tempFilePath: res.tempFilePath,
                success: (saveRes) => {
                  uni.showToast({
                    title: '下载成功',
                    icon: 'success'
                  });
                  
                  // 打开文件
                  uni.openDocument({
                    filePath: saveRes.savedFilePath,
                    success: () => {
                      console.log('打开文件成功');
                    },
                    fail: (err) => {
                      console.error('打开文件失败:', err);
                      uni.showToast({
                        title: '打开文件失败',
                        icon: 'none'
                      });
                    }
                  });
                },
                fail: (err) => {
                  console.error('保存文件失败:', err);
                  uni.showToast({
                    title: '保存文件失败',
                    icon: 'none'
                  });
                }
              });
            } else {
              throw new Error('下载文件失败');
            }
          },
          fail: (err) => {
            console.error('下载文件失败:', err);
            throw new Error('下载文件失败');
          }
        });
      } catch (e) {
        console.error('下载文件失败:', e);
        uni.showToast({
          title: e.message || '下载文件失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
	// 获取当前位置（自动获取并逆地理编码详细地址）
	async getLocation() {
	  try {
	    // 1. 获取经纬度
	    const [err, loc] = await uni.getLocation({ type: 'gcj02' });
	    if (err) throw new Error('获取位置失败');
	    const { latitude, longitude } = loc;
	
	    // 2. 调高德逆地理编码
	    const [reqErr, geoRes] = await uni.request({
	      url: 'https://restapi.amap.com/v3/geocode/regeo',
	      data: {
	        location: `${longitude},${latitude}`,
	        key: '588c83165bf098b125e621655239f1af',
	        extensions: 'base'
	      }
	    });
	    if (reqErr) throw new Error('网络异常');
	
	    const data = geoRes?.data;
	    if (!data || data.status !== '1') throw new Error('逆地理编码失败');
	
	    // 3. 拼装完整地址
	    const c = data.regeocode.addressComponent;
	    const city    = c.city || c.province || '';
	    const district = c.district || '';
	    const township = c.township || '';
	    const street   = (c.streetNumber?.street || '') + (c.streetNumber?.number || '');
	    const fullAddress = `${city}${district}${township}${street}`.trim();
	
	    // 4. 保存
	    this.currentLocation = { latitude, longitude, address: fullAddress, name: '' };
	    console.log('完整地址:', fullAddress);
	  } catch (e) {
	    console.error(e);
	    uni.showToast({ title: e.message || '获取位置失败', icon: 'none' });
	  }
	},

    //  getLocation() 方法2
    /*async getLocation() {
      try {
        // 调用 custom-nav 的 getLocationInfo 方法
        await this.$refs.navRef.getLocationInfo();
    
        // 从 custom-nav 中读取定位结果
        const { locationName, location } = this.$refs.navRef;
    
        if (!locationName || !location.latitude || !location.longitude) {
          throw new Error('未能获取到详细地址');
        }
    
        this.currentLocation = {
          latitude: location.latitude,
          longitude: location.longitude,
          address: locationName, // 使用 custom-nav 的城市名
          name: ''
        };
    
        console.log('custom-nav 获取到的位置信息:', this.currentLocation);
      } catch (e) {
        console.error('custom-nav 获取位置失败:', e);
        uni.showToast({
          title: e.message || '获取位置失败',
          icon: 'none'
        });
      }
    },*/

    // 打开位置
    openLocation(location) {
      try {
        const locationData = typeof location === 'string' ? JSON.parse(location) : location;
        uni.openLocation({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          name: locationData.name || locationData.address,
          scale: 18
        });
      } catch (e) {
        console.error('打开位置失败:', e);
        uni.showToast({
          title: '打开位置失败',
          icon: 'none'
        });
      }
    },

    // 格式化文件大小
    formatFileSize(size) {
      if (size < 1024) {
        return size + 'B';
      } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(2) + 'KB';
      } else if (size < 1024 * 1024 * 1024) {
        return (size / (1024 * 1024)).toFixed(2) + 'MB';
      } else {
        return (size / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
      }
    },

    // 播放视频
    async playVideo(fileID) {
      if (!fileID) return;
      
      try {
        let videoUrl = fileID;
        
        // 如果是云存储文件ID，获取临时访问链接
        if (!fileID.startsWith('http') && !fileID.startsWith('/')) {
          const res = await uniCloud.getTempFileURL({
            fileList: [fileID]
          });
          
          if (res.fileList && res.fileList[0] && res.fileList[0].tempFileURL) {
            videoUrl = res.fileList[0].tempFileURL;
          } else {
            throw new Error('获取视频链接失败');
          }
        }
        
        // 设置当前视频URL并显示全屏播放器
        this.currentVideoUrl = videoUrl;
        this.isFullscreen = true;
        
        // 等待DOM更新后获取视频上下文
        this.$nextTick(() => {
          this.videoContext = uni.createVideoContext('fullscreen-video', this);
          if (this.videoContext) {
            this.videoContext.play();
          }
        });
      } catch (e) {
        console.error('播放视频失败:', e);
        uni.showToast({
          title: '播放视频失败',
          icon: 'none'
        });
      }
    },
    
    // 退出全屏
    exitFullscreen() {
      if (this.videoContext) {
        this.videoContext.stop();
      }
      this.isFullscreen = false;
      this.currentVideoUrl = '';
      this.videoContext = null;
    },
    
    // 处理视频错误
    handleVideoError(e) {
      console.error('视频加载失败:', e);
      uni.showToast({
        title: '视频加载失败',
        icon: 'none'
      });
    },
    
    // 获取视频缩略图
    async getVideoThumbnail(fileID) {
      if (!fileID) return '';
      
      try {
        // 如果是临时路径，直接返回
        if (fileID.startsWith('http') || fileID.startsWith('/')) {
          return fileID;
        }
        
        // 如果是云存储文件ID，获取临时访问链接
        const res = await uniCloud.getTempFileURL({
          fileList: [fileID]
        });
        
        if (res.fileList && res.fileList[0] && res.fileList[0].tempFileURL) {
          return res.fileList[0].tempFileURL;
        }
        return fileID;
      } catch (e) {
        console.error('获取视频缩略图失败:', e);
        return fileID;
      }
    },

    // 关闭评价弹窗
    closeReviewModal() {
      this.showReviewModal = false;
      this.reviewRating = 5;
      this.reviewContent = '';
      this.reviewImages = [];
    },
    
    // 设置评分
    setRating(rating) {
      this.reviewRating = rating;
    },
    
    // 选择评价图片
    async chooseReviewImage() {
      try {
        const [err, res] = await uni.chooseImage({
          count: 9 - this.reviewImages.length,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera']
        });
        
        if (err) {
          throw new Error('选择图片失败');
        }
        
        if (res && res.tempFilePaths) {
          this.reviewImages = [...this.reviewImages, ...res.tempFilePaths];
        }
      } catch (e) {
        console.error('选择图片失败:', e);
        uni.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    },
    
    // 删除评价图片
    deleteReviewImage(index) {
      this.reviewImages.splice(index, 1);
    },

    // 关闭总结弹窗
    closeSummaryModal() {
      this.showSummaryModal = false;
      this.summaryContent = '';
      this.summaryImages = [];
    },
    
    // 选择总结图片
    async chooseSummaryImage() {
      try {
        const [err, res] = await uni.chooseImage({
          count: 9 - this.summaryImages.length,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera']
        });
        
        if (err) {
          throw new Error('选择图片失败');
        }
        
        if (res && res.tempFilePaths) {
          this.summaryImages = [...this.summaryImages, ...res.tempFilePaths];
        }
      } catch (e) {
        console.error('选择图片失败:', e);
        uni.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    },
    
    // 删除总结图片
    deleteSummaryImage(index) {
      this.summaryImages.splice(index, 1);
    },

    // 开始检查打卡任务
    startCheckInCheck() {
      // 立即执行一次检查
      this.checkPendingCheckIns();
      // 每10秒检查一次是否有待打卡任务
      this.checkInTimer = setInterval(() => {
        this.checkPendingCheckIns();
      }, 10000);
    },
    // 检查待打卡任务
    async checkPendingCheckIns() {
      try {
        console.log('开始检查打卡任务，当前用户ID:', this.userId);
        // 直接请求后端，传doctor_id为当前用户
        const { result } = await uniCloud.callFunction({
          name: 'checkIn',
          data: {
            action: 'getPendingCheckIns',
            data: {
              doctor_id: this.userId
            }
          }
        });
        console.log('云函数返回结果:', result);
        if (result.code === 200) {
          if (result.data && result.data.length > 0) {
            // 有待打卡任务且未打卡成功，弹窗
            if (!this.showCheckInModal) {
              this.currentCheckIn = result.data[0];
              this.showCheckInModal = true;
              await this.getLocation();
              uni.showToast({
                title: '请及时完成打卡',
                icon: 'none',
                duration: 2000
              });
            }
          } else {
            // 没有待打卡任务，关闭弹窗
            if (this.showCheckInModal) {
              this.closeCheckInModal();
            }
            // 停止定时器
            if (this.checkInTimer) {
              clearInterval(this.checkInTimer);
              this.checkInTimer = null;
            }
          }
        } else {
          console.error('检查打卡任务失败:', result.msg);
        }
      } catch (e) {
        console.error('检查打卡任务失败:', e);
      }
    },
    
    // 刷新位置
    refreshLocation() {
      this.currentLocation = null;
      this.getLocation();
    },
    
    // 选择打卡图片
    async chooseCheckInImage() {
      try {
        const [err, res] = await uni.chooseImage({
          count: 9 - this.checkInImages.length,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera']
        });
        
        if (err) {
          throw new Error('选择图片失败');
        }
        
        if (res && res.tempFilePaths) {
          this.checkInImages = [...this.checkInImages, ...res.tempFilePaths];
        }
      } catch (e) {
        console.error('选择图片失败:', e);
        uni.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    },
    
    // 删除打卡图片
    deleteCheckInImage(index) {
      this.checkInImages.splice(index, 1);
    },
    
    // 提交打卡
    async submitCheckIn() {
      if (!this.canSubmitCheckIn) return;
      
      try {
        uni.showLoading({
          title: '提交中...'
        });
        
        // 上传图片
        const uploadedImages = [];
        for (const image of this.checkInImages) {
          const uploadRes = await uniCloud.uploadFile({
            filePath: image,
            cloudPath: `check-ins/${Date.now()}_${Math.random().toString(36).slice(-6)}.${image.split('.').pop()}`
          });
          
          if (uploadRes && uploadRes.fileID) {
            uploadedImages.push(uploadRes.fileID);
          }
        }
        
        // 确保位置信息包含详细地址
        if (!this.currentLocation.address || this.currentLocation.address.includes('经度')) {
          // 如果地址不完整，重新获取一次
          await this.getLocation();
        }
        
        const { result } = await uniCloud.callFunction({
          name: 'checkIn',
          data: {
            action: 'submitCheckIn',
            data: {
              check_in_id: this.currentCheckIn._id,
              location: {
                latitude: this.currentLocation.latitude,
                longitude: this.currentLocation.longitude,
                address: this.currentLocation.address,
                name: this.currentLocation.name
              },
              images: uploadedImages,
              //description: this.checkInDescription
            }
          }
        });
        
        if (result.code === 200) {
          uni.showToast({
            title: '打卡成功',
            icon: 'success'
          });
          
          // 关闭打卡弹窗
          this.closeCheckInModal();
          
          // 停止检查打卡任务
          if (this.checkInTimer) {
            clearInterval(this.checkInTimer);
            this.checkInTimer = null;
          }
        } else {
          throw new Error(result.msg || '提交打卡失败');
        }
      } catch (e) {
        console.error('提交打卡失败:', e);
        uni.showToast({
          title: e.message || '提交打卡失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
    
    // 关闭打卡弹窗
    closeCheckInModal() {
      this.showCheckInModal = false;
      this.currentCheckIn = null;
      this.currentLocation = null;
      this.checkInImages = [];
      //this.checkInDescription = '';
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
  position: relative;
}

.chat-header {
  background-color: #ffffff;
  border-bottom: 1rpx solid #eee;
  width: 100%;
  padding-top: 20rpx;
  z-index: 100;
}

.chat-header.fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
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
  margin-top: 120rpx; /* 为固定头部留出空间 */
  margin-bottom: 120rpx; /* 为底部输入框留出空间 */
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
	position: fixed;
	bottom: 0;
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
  background: transparent;
  border-radius: 8rpx;
  overflow: hidden;
  width: 100%;
  max-width: 400rpx;
}

.location-content {
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
  background: transparent;
}

.location-info {
  display: flex;
  flex-direction: column;
}

.location-name {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 4rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.location-address {
  font-size: 24rpx;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.location-map {
  width: 100%;
  height: 200rpx;
}

.self .location-message {
  background: transparent;
}

.self .location-content {
  border-bottom-color: rgba(0, 0, 0, 0.1);
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

.video-message {
  max-width: 400rpx;
  border-radius: 8rpx;
}

.msg-video {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
}

.file-message {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
}

.file-type-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
}

.file-info {
  display: flex;
  flex-direction: column;
}

.file-name {
  font-size: 28rpx;
  color: #333;
}

.file-size {
  font-size: 24rpx;
  color: #999;
}

.video-container {
  position: relative;
  width: 400rpx;
  height: 300rpx;
  border-radius: 8rpx;
  overflow: hidden;
}

.msg-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80rpx;
  height: 80rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-icon {
  width: 40rpx;
  height: 40rpx;
}

.video-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-video {
  width: 100%;
  height: 100%;
}

.fullscreen-close {
  position: absolute;
  top: 40rpx;
  right: 40rpx;
  width: 60rpx;
  height: 60rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.close-icon {
  width: 30rpx;
  height: 30rpx;
}

/* 评价弹窗样式 */
.review-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.review-content {
  width: 90%;
  max-height: 80vh;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  overflow-y: auto;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.review-title {
  font-size: 32rpx;
  font-weight: bold;
}

.close-btn {
  font-size: 40rpx;
  color: #999;
  padding: 10rpx;
}

.rating-section {
  margin-bottom: 30rpx;
}

.rating-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
  display: block;
}

.stars {
  display: flex;
  gap: 20rpx;
}

.star {
  font-size: 50rpx;
  color: #ddd;
  cursor: pointer;
}

.star.active {
  color: #ffd700;
}

.content-section {
  margin-bottom: 30rpx;
}

.review-textarea {
  width: 100%;
  height: 200rpx;
  background: #f5f5f5;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
}

.image-upload-section {
  margin-bottom: 30rpx;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.image-item {
  width: 160rpx;
  height: 160rpx;
  position: relative;
}

.image-item image {
  width: 100%;
  height: 100%;
  border-radius: 10rpx;
}

.delete-btn {
  position: absolute;
  top: -20rpx;
  right: -20rpx;
  width: 40rpx;
  height: 40rpx;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

.upload-btn {
  width: 160rpx;
  height: 160rpx;
  background: #f5f5f5;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 60rpx;
  color: #999;
}

.submit-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background: #02D4C6;
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
}

/* 打卡弹窗样式 */
.check-in-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-in-content {
  width: 90%;
  max-height: 80vh;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  overflow-y: auto;
}

.check-in-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.check-in-title {
  font-size: 32rpx;
  font-weight: bold;
}

.check-in-body {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
  display: block;
}

.location-section {
  margin-bottom: 30rpx;
}

.location-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f5f5f5;
  padding: 20rpx;
  border-radius: 10rpx;
}

.location-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.refresh-btn {
  margin-left: 20rpx;
  font-size: 24rpx;
  color: #02D4C6;
  background: none;
  border: none;
  padding: 0;
}

.get-location-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background: #02D4C6;
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.image-section {
  margin-bottom: 30rpx;
}

/* .description-textarea {
  width: 100%;
  height: 200rpx;
  background: #f5f5f5;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
} */

.submit-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background: #02D4C6;
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.submit-btn[disabled] {
  background: #ccc;
  color: #fff;
}
</style>

