<template>
  <view class="page">
    <custom-nav :title="'报名'" :isHomePage="false" />
    <view class="signup-page">
      <view class="container">
        <view class="userinfo">
          <view class="appointment-info">
            <image src="../../static/images/order/icon_1.png" class="icon" />
            <text class="title">报名信息</text>
          </view>
          
          <view class="input-group">
            <text class="label">姓名<span class="required">*</span></text>
            <input class="input" v-model="form.name" placeholder="请输入姓名" />
          </view>
          
          <view class="input-group">
            <text class="label">证件号<span class="required">*</span></text>
            <input class="input" v-model="form.idNumber" placeholder="请输入证件号" />
          </view>
          
          <view class="input-group">
            <text class="label">报考类型<span class="required">*</span></text>
            <picker :range="examTypes" :value="form.examTypeIndex" @change="onPickerChange('examTypeIndex', $event)">
              <view class="picker-input">{{ examTypes[form.examTypeIndex] || '请选择报考类型' }}</view>
            </picker>
          </view>
          
          <view class="input-group">
            <text class="label">报考工种<span class="required">*</span></text>
            <picker :range="jobTypes" :value="form.jobTypeIndex" @change="onPickerChange('jobTypeIndex', $event)">
              <view class="picker-input">{{ jobTypes[form.jobTypeIndex] || '请选择工种' }}</view>
            </picker>
          </view>
          
          <view class="input-group">
            <text class="label">考试级别<span class="required">*</span></text>
            <picker :range="availableLevels" :value="form.examLevelIndex" @change="onPickerChange('examLevelIndex', $event)">
              <view class="picker-input">{{ availableLevels[form.examLevelIndex] || '请选择考试级别' }}</view>
            </picker>
          </view>
        </view>
        
        <view class="submit">
          <button class="notice-btn" @click="showNotice" :disabled="!canShowNotice">查看报考须知</button>
          <button class="submit-btn" @click="handleSubmit">提交报名</button>
        </view>
      </view>
    </view>

    <!-- 报考须知弹窗 -->
    <view class="notice-modal" v-if="showNoticeModal" @click="hideNotice">
      <view class="notice-content" @click.stop>
        <view class="notice-header">
          <text class="notice-title">报考须知</text>
          <view class="close-btn" @click="hideNotice">×</view>
        </view>
        <view class="notice-body" v-if="selectedJobInfo">
          <view class="notice-item">
            <text class="notice-label">工种名称：</text>
            <text class="notice-value">{{ selectedJobInfo.jobName }}</text>
          </view>
          <view class="notice-item">
            <text class="notice-label">考试方式：</text>
            <text class="notice-value">{{ selectedJobInfo.examMethod }}</text>
          </view>
          <view class="notice-item">
            <text class="notice-label">理论考试时长：</text>
            <text class="notice-value">{{ selectedJobInfo.theoryDuration }}</text>
          </view>
          <view class="notice-item">
            <text class="notice-label">实操考试时长：</text>
            <text class="notice-value">{{ selectedJobInfo.practicalDuration }}</text>
          </view>
          <view class="notice-item" v-if="selectedJobInfo.description">
            <text class="notice-label">工种描述：</text>
            <text class="notice-value">{{ selectedJobInfo.description }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  onLoad(options) {
    if (options && options.user_id) {
      this.user_id = options.user_id;
    }
    this.loadJobTypes();
  },
  data() {
    return {
      examTypes: ['专业报考', '职业报考'],
      jobTypes: [],
      availableLevels: [],
      jobTypesData: [], // 存储从数据库获取的工种数据
      form: {
        name: '',
        idNumber: '',
        examTypeIndex: null,
        jobTypeIndex: null,
        examLevelIndex: null
      },
      user_id: '',
      showNoticeModal: false
    }
  },
  computed: {
    selectedJobInfo() {
      if (this.form.jobTypeIndex !== null && this.jobTypesData.length > 0) {
        return this.jobTypesData[this.form.jobTypeIndex];
      }
      return null;
    },
    canShowNotice() {
      return this.form.jobTypeIndex !== null;
    }
  },
  methods: {
    async loadJobTypes() {
      try {
        const res = await uniCloud.callFunction({
          name: 'getJobTypes'
        });
        if (res.result && res.result.code === 0) {
          this.jobTypesData = res.result.data;
          this.jobTypes = this.jobTypesData.map(item => item.jobName);
        } else {
          console.error('获取工种信息失败:', res.result.msg);
          // 如果获取失败，使用默认数据
        }
      } catch (e) {
        console.error('加载工种信息异常:', e);
      }
    },
    onPickerChange(field, e) {
      this.form[field] = e.detail.value;
      
      // 当工种改变时，更新可选的考试级别
      if (field === 'jobTypeIndex') {
        this.updateAvailableLevels();
        this.form.examLevelIndex = null; // 重置考试级别选择
      }
    },
    updateAvailableLevels() {
      if (this.form.jobTypeIndex !== null && this.jobTypesData.length > 0) {
        const selectedJob = this.jobTypesData[this.form.jobTypeIndex];
        this.availableLevels = selectedJob.examLevels || [];
      } else {
        this.availableLevels = [];
      }
    },
    showNotice() {
      if (this.canShowNotice) {
        this.showNoticeModal = true;
      }
    },
    hideNotice() {
      this.showNoticeModal = false;
    },
    async handleSubmit() {
      // 校验
      if (!this.form.name || !this.form.idNumber || this.form.examTypeIndex === null || this.form.jobTypeIndex === null || this.form.examLevelIndex === null) {
        uni.showToast({ title: '请完整填写表单', icon: 'none' });
        return;
      }
      
      uni.showLoading({ title: '提交中' });
      try {
        const submitData = {
          user_id: this.user_id,
          name: this.form.name,
          idNumber: this.form.idNumber,
          examType: this.examTypes[this.form.examTypeIndex],
          jobType: this.jobTypes[this.form.jobTypeIndex],
          examLevel: this.availableLevels[this.form.examLevelIndex]
        };
        
        console.log('提交云函数数据:', JSON.stringify(submitData));
        const res = await uniCloud.callFunction({
          name: 'addSignup',
          data: submitData
        });
        
        console.log('云函数返回:', res);
        if (res.result && res.result.code === 0) {
          uni.showToast({ title: '报名成功', icon: 'success' });
          uni.navigateBack();
        } else {
          uni.showToast({ title: res.result && res.result.msg ? res.result.msg : '提交失败', icon: 'none' });
        }
      } catch (e) {
        console.error('提交异常:', e);
        uni.showToast({ title: '提交失败:' + (e.message || e), icon: 'none' });
      } finally {
        uni.hideLoading();
      }
    }
  }
}
</script>

<style>
.page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.signup-page {
  padding: 20rpx;
  padding-top: 120rpx;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  height: auto;
  margin: 0 20rpx;
  padding: 20rpx;
  padding-bottom: 200rpx;
  margin-bottom: 40rpx;
  border-radius: 30rpx;
  background-color: #ffffff;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  width: calc(100% - 10rpx);
  max-width: 700rpx;
}

.userinfo {
  width: 100%;
}

.title {
  font-size: 23px;
  font-weight: normal;
  margin-bottom: 15rpx;
  color: #000000;
}

.input-group {
  display: flex;
  width: 100%;
  margin-bottom: 15rpx;
  border-bottom: 0.5px solid rgba(224, 224, 224, 0.5);
  padding-bottom: 10rpx;
}

.label {
  width: 100px;
  color: #646464;
  font-weight: 500;
}

.required {
  color: #FF4D4F;
  margin-left: 4rpx;
}

.input {
  position: relative;
  font-size: 15px;
  color: #b3b3b3;
  flex: 1;
  border: none;
  border-radius: 4px;
  padding: 10rpx;
  z-index: 1;
}

.picker-input {
  position: relative;
  font-size: 15px;
  color: #b3b3b3;
  flex: 1;
  border: none;
  border-radius: 4px;
  padding: 10rpx;
  z-index: 1;
}

.icon {
  width: 45rpx;
  height: 45rpx;
  margin-right: 20rpx;
}

.appointment-info {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.submit {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40rpx;
  gap: 20rpx;
}

.notice-btn {
  width: 90%;
  height: 60rpx;
  line-height: 60rpx;
  background: #f0f0f0;
  color: #666;
  border-radius: 30rpx;
  font-size: 26rpx;
  border: none;
}

.notice-btn:disabled {
  background: #e0e0e0;
  color: #999;
}

.submit-btn {
  width: 90%;
  height: 80rpx;
  line-height: 80rpx;
  background: #18d1c2;
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
}

/* 弹窗样式 */
.notice-modal {
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

.notice-content {
  width: 90%;
  max-width: 600rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  max-height: 80vh;
  overflow-y: auto;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  border-bottom: 1px solid #eee;
  padding-bottom: 20rpx;
}

.notice-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  font-size: 40rpx;
  color: #999;
  padding: 10rpx;
  cursor: pointer;
}

.notice-body {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.notice-item {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.notice-label {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.notice-value {
  font-size: 30rpx;
  color: #333;
  padding: 15rpx;
  background: #f8f8f8;
  border-radius: 10rpx;
  line-height: 1.5;
}
</style> 