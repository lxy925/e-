<template>
  <view class="page-container">
    <custom-nav :title="pageTitle" :isHomePage="false" :scrollTop="scrollTop" ref="customNav" />
    
    <scroll-view 
      scroll-y 
      class="main-scroll" 
      @scroll="handleScroll" 
      :style="{ 
        paddingTop: navHeight + 'px',
        height: 'calc(100vh - ' + navHeight + 'px)'
      }" 
      :scroll-top="scrollTop" 
      :show-scrollbar="false"
    >
 
      
      <!-- 主要内容区域 -->
      <view class="content-container">
        <!-- 数据列表 -->
        <view v-if="patients.length > 0" class="patients-list">
          <view 
            v-for="(patient, index) in patients" 
            :key="index" 
            class="patient-card"
            @click="selectPatient(patient)"
            @touchstart="touchStart(index)"
            @touchend="touchEnd(index)"
            :class="{ 'touched': activeIndex === index }"
          >
            <view class="card-header">
              <image 
                v-if="patient.photo" 
                :src="patient.photo" 
                mode="aspectFill" 
                class="patient-avatar" 
              />
              <image 
                v-else
                src="../../static/images/default-avatar.png" 
                mode="aspectFill" 
                class="patient-avatar" 
              />
              
              <view class="patient-basic-info">
                <text class="patient-name">{{ patient.name }}</text>
                <view class="patient-tags">
                  <text class="tag age">{{ patient.age }}岁</text>
                  <text class="tag gender">{{ patient.gender }}</text>
                  <text class="tag relationship">{{ patient.relationship }}</text>
                </view>
              </view>
              
              <view class="contact-btn" @click.stop="callPatient(patient.phone)">
                <uni-icons type="phone" size="20" color="#5A7BFF"></uni-icons>
              </view>
            </view>
            
            <view class="card-body">
              <view class="info-row">
                <uni-icons type="phone" size="16" color="#999"></uni-icons>
                <text class="info-text">{{ patient.phone || '未填写电话' }}</text>
              </view>
              
              <view class="info-row" v-if="patient.medicalInfo">
                <uni-icons type="info" size="16" color="#999"></uni-icons>
                <text class="info-text">{{ patient.medicalInfo }}</text>
              </view>
              
              <view v-if="patient.uploadedImages.length > 0" class="image-section">
                <text class="section-title">相关图片</text>
                <scroll-view scroll-x class="image-scroll">
                  <view 
                    v-for="(image, imgIndex) in patient.uploadedImages" 
                    :key="imgIndex"
                    class="image-wrapper"
                    @click.stop="previewImage(patient.uploadedImages, imgIndex)"
                  >
                    <image :src="image" mode="aspectFill" class="thumbnail" />
                    <view class="image-overlay"></view>
                  </view>
                </scroll-view>
              </view>
            </view>
            
            <view class="card-footer">
              <view class="action-btns">
                <view class="edit-btn" @click.stop="editPatient(patient)">
                  <uni-icons type="compose" size="18" color="#999"></uni-icons>
                  <text>编辑</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 空状态 -->
        <view v-else class="empty-state">
          <image src="../../static/images/empty-patient.png" class="empty-image" />
          <text class="empty-title">暂无就诊人信息</text>
          <text class="empty-desc">点击下方按钮添加您的就诊人</text>
        </view>
      </view>
      
      <!-- 底部安全间距 -->
      <view class="bottom-safe-area"></view>
    </scroll-view>
    
    <!-- 添加按钮 -->
    <view class="floating-btn-container" @click="goToAddPatient">
      <view class="floating-btn">
        <uni-icons type="plusempty" size="24" color="#fff"></uni-icons>
        <text class="btn-text">添加就诊人</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      navHeight: 0,
      pageTitle: '我的就诊人',
      scrollTop: 0,
      patients: [],
      activeIndex: -1,
      scrollHeight: 0
    };
  },
  onShow() {
    this.getOpenId();
  },
  onLoad() {
    const systemInfo = uni.getSystemInfoSync();
    this.navHeight = systemInfo.statusBarHeight + 44;
    this.calculateScrollHeight();
    this.getOpenId();
  },
  methods: {
    handleScroll(e) {
      if (this.scrollTimer) clearTimeout(this.scrollTimer);
      this.scrollTimer = setTimeout(() => {
        this.scrollTop = e.detail.scrollTop;
      }, 16);
    },
    
    touchStart(index) {
      this.activeIndex = index;
    },
    
    touchEnd() {
      this.activeIndex = -1;
    },
    
    calculateScrollHeight() {
      const systemInfo = uni.getSystemInfoSync();
      this.scrollHeight = systemInfo.windowHeight - this.navHeight;
    },
    
    goToAddPatient() {
      uni.navigateTo({
        url: '/subPackageA/pages/object/object'
      });
    },
    
    getOpenId() {
      const user_id = uni.getStorageSync("userInfo").user_id;
      this.fetchPatients(user_id);
    },
    
    fetchPatients(openid) {
      uni.showLoading({ title: '加载中...' });
      
      uniCloud.callFunction({
        name: 'getPatients',
        data: { userid: openid },
        success: (res) => {
          uni.hideLoading();
          if (res.result.code === 0) {
            this.patients = res.result.data || [];
          } else {
            uni.showToast({
              title: res.result.msg || '数据查询失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          uni.hideLoading();
          uni.showToast({
            title: '数据查询失败',
            icon: 'none'
          });
        }
      });
    },
    
    selectPatient(patient) {
      uni.setStorageSync('selectedPatient', patient);
      uni.navigateBack();
    },
    
    editPatient(patient) {
      uni.navigateTo({
        url: `/pages/object/object?editMode=true&patientId=${patient._id}`
      });
    },
    
    callPatient(phone) {
      if (!phone) {
        uni.showToast({ title: '该就诊人未填写电话', icon: 'none' });
        return;
      }
      uni.makePhoneCall({ phoneNumber: phone });
    },
    
    previewImage(images, currentIndex) {
      uni.previewImage({
        current: images[currentIndex],
        urls: images
      });
    },
    
    formatDate(timestamp) {
      if (!timestamp) return '未知时间';
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }
  }
};
</script>

<style lang="scss">
.page-container {
  height: 100vh;
  width: 100vw;
  position: relative;
}

.main-scroll {
  width: 100%;
}

.decorative-header {
  position: relative;
  height: 160rpx;
  overflow: hidden;
}

.decorative-wave {
  position: absolute;
  top: -100rpx;
  left: -50%;
  width: 200%;
  height: 300rpx;
  
  border-radius: 0 0 50% 50%;
}

.content-container {
  padding: 30rpx;
  
  position: relative;
  z-index: 2;
}

.patients-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.patient-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 6rpx 20rpx rgba(92, 123, 255, 0.08);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  
  &.touched {
    transform: scale(0.98);
    opacity: 0.9;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 8rpx;
    height: 100%;
    background: linear-gradient(to bottom, #5A7BFF, #8E54FF);
  }
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  position: relative;
}

.patient-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(90, 123, 255, 0.2);
  margin-right: 20rpx;
}

.patient-basic-info {
  flex: 1;
}

.patient-name {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.patient-tags {
  display: flex;
  gap: 15rpx;
}

.tag {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  
  &.age {
    background-color: rgba(90, 123, 255, 0.1);
    color: #5A7BFF;
  }
  
  &.gender {
    background-color: rgba(255, 76, 158, 0.1);
    color: #FF4C9E;
  }
  
  &.relationship {
    background-color: rgba(0, 200, 150, 0.1);
    color: #00C896;
  }
}

.contact-btn {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  background-color: rgba(90, 123, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-body {
  padding-left: 120rpx;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.info-text {
  font-size: 28rpx;
  color: #666;
  margin-left: 10rpx;
}

.image-section {
  margin-top: 30rpx;
  padding-top: 30rpx;
  border-top: 1rpx dashed #eee;
}

.section-title {
  font-size: 26rpx;
  color: #999;
  display: block;
  margin-bottom: 20rpx;
}

.image-scroll {
  white-space: nowrap;
  width: 100%;
}

.image-wrapper {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  overflow: hidden;
  display: inline-block;
  margin-right: 20rpx;
  position: relative;
}

.thumbnail {
  width: 100%;
  height: 100%;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
}

.image-wrapper:active .image-overlay {
  background-color: rgba(0, 0, 0, 0.4);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f5f5f5;
}

.last-update {
  font-size: 24rpx;
  color: #999;
}

.action-btns {
  display: flex;
  gap: 30rpx;
}

.edit-btn {
  display: flex;
  align-items: center;
  color: #999;
  font-size: 26rpx;
  
  text {
    margin-left: 6rpx;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-image {
  width: 300rpx;
  height: 300rpx;
  opacity: 0.6;
  margin-bottom: 40rpx;
}

.empty-title {
  font-size: 32rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: #ccc;
}

.bottom-safe-area {
  height: 150rpx;
}

.floating-btn-container {
  position: fixed;
  bottom: 60rpx;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 100;
}

.floating-btn {
  background: linear-gradient(135deg, #5A7BFF, #8E54FF);
  color: white;
  border-radius: 50rpx;
  height: 90rpx;
  padding: 0 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 30rpx rgba(90, 123, 255, 0.3);
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.95);
    opacity: 0.9;
  }
}

.btn-text {
  font-size: 32rpx;
  font-weight: 500;
  margin-left: 10rpx;
}
</style>