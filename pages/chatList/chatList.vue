<template>
  <view class="container">
    <custom-nav title="聊天列表" :isHomePage="false">
      <view class="back-btn" @click="goBack" slot="left">
        <image src="/static/images/icons/back2.png" class="back-icon"></image>
      </view>
    </custom-nav>
    
    <scroll-view class="chat-list" scroll-y>
      <view v-if="chatPartners.length === 0" class="empty-tip">
        <text>暂无聊天对象</text>
      </view>
      
      <view v-else class="partner-list">
        <view 
          v-for="(partner, index) in chatPartners" 
          :key="index" 
          class="partner-item"
          @click="startChat(partner)"
        >
          <image class="avatar" :src="partner.avatar"></image>
          <view class="info">
            <text class="name">{{partner.name}}</text>
            <text class="type">{{partner.type}}</text>
          </view>
          <view class="right-arrow">
            <text class="iconfont">></text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import customNav from '@/components/custom-nav/custom-nav.vue'

export default {
  components: {
    customNav
  },
  data() {
    return {
      chatPartners: [],
      currentUser: null
    }
  },
  
  onLoad() {
    this.initData();
  },
  
  methods: {
    async initData() {
      try {
        console.log('chatList');
        // 获取当前用户信息
        const currentUserInfo = uni.getStorageSync('userInfo');
        console.log('获取到的用户信息：', currentUserInfo);
        if (!currentUserInfo) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
          return;
        }
        
        this.currentUser = currentUserInfo;
        await this.getChatPartners();
      } catch (e) {
        console.error('初始化数据失败:', e);
        uni.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      }
    },

    async getChatPartners() {
      try {
        const { result } = await uniCloud.callFunction({
          name: 'getChatList',
          data: {
            currentUser: this.currentUser
          }
        });

        if (result.code === 200) {
          this.chatPartners = result.data;
          console.log('聊天对象列表:', this.chatPartners);
        } else {
          uni.showToast({
            title: result.msg || '获取聊天对象失败',
            icon: 'none'
          });
        }
      } catch (e) {
        console.error('获取聊天对象失败:', e);
        uni.showToast({
          title: '获取聊天对象失败',
          icon: 'none'
        });
      }
    },
    
    startChat(partner) {
      // 存储聊天对象信息
      uni.setStorageSync('currentUserInfo', {
        user_id: this.currentUser.user_id,
        type: this.currentUser.type,
        nickName: this.currentUser.nickName,
        avatar: this.currentUser.avatar,
        partner_id: partner.user_id
      });
      
      // 跳转到聊天页面
      uni.navigateTo({
        url: '/pages/consult/consult',
        fail: (err) => {
          console.error('页面跳转失败:', err);
          uni.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      });
    },
    
    goBack() {
      uni.navigateBack({
        delta: 1,
        fail: () => {
          // 如果返回失败，则跳转到首页
          uni.switchTab({
            url: '/pages/mine/mine'
          });
        }
      });
    }
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  /* background: linear-gradient(to bottom, #1cd6c7, #99efe9,rgb(239, 239, 239),rgb(239, 239, 239),rgb(239, 239, 239),rgb(239, 239, 239)); */
  position: relative;
  padding: 0;
  padding-top:180rpx ;/* 添加顶部内边距，避免被导航栏遮挡 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-self: center;
  flex: 1;  
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx;
}

.back-icon {
  width: 48rpx;
  height: 48rpx;
}

.chat-list {
  flex: 1;
  padding: 20rpx;
  margin-top: 20rpx; /* 添加顶部外边距 */
}

.empty-tip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #999;
  font-size: 28rpx;
  text-align: center;
}

.partner-list {
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  margin-top: 20rpx; /* 添加顶部外边距 */
}

.partner-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.partner-item:last-child {
  border-bottom: none;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.info {
  flex: 1;
}

.name {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.type {
  font-size: 24rpx;
  color: #999;
}

.right-arrow {
  color: #999;
  font-size: 32rpx;
}
</style> 