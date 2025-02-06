<template>
  <view class="page">
    <custom-nav title="陪诊师入驻" :isHomePage="false"></custom-nav>
    <view class="container">
        <van-cell-group>
  <van-field
    value="{{ value }}"
    placeholder="请输入用户名"
    border="{{ false }}"
    bind:change="onChange"
  />
</van-cell-group>

      <form @submit.prevent="submitForm">
        <view class="form-item">
          <text class="label">头像</text>
          <view class="avatar-upload" @click="uploadAvatar">
            <image v-if="form.avatar" :src="form.avatar" class="avatar"></image>
            <text v-else class="upload-text">点击上传</text>
          </view>
        </view>
        <view class="form-item">
          <text class="label">真实姓名</text>
          <input v-model="form.realName" placeholder="请输入真实姓名" />
        </view>
        <view class="form-item">
          <text class="label">性别</text>
          <picker mode="selector" :range="genders" v-model="form.genderIndex">
            <view class="picker">{{ genders[form.genderIndex] }}</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="label">年龄</text>
          <input v-model="form.age" type="number" placeholder="请输入年龄" />
        </view>
        <view class="form-item">
          <text class="label">手机号</text>
          <input
            v-model="form.phone"
            type="number"
            placeholder="请输入手机号"
          />
        </view>
        <view class="form-item">
          <text class="label">所在城市</text>
          <input v-model="form.city" placeholder="请输入所在城市" />
        </view>
        <view class="form-item">
          <text class="label">资格证号</text>
          <input
            v-model="form.qualificationNumber"
            placeholder="请输入资格证号"
          />
        </view>
        <view class="form-item">
          <text class="label">证书图片</text>
          <view class="certificate-upload" @click="uploadCertificate">
            <image
              v-if="form.certificate"
              :src="form.certificate"
              class="certificate"
            ></image>
            <text v-else class="upload-text">点击上传</text>
          </view>
        </view>
        <view class="form-item">
          <text class="label">身份证号码</text>
          <input v-model="form.idNumber" placeholder="请输入身份证号码" />
        </view>
        <view class="form-item">
          <text class="label">身份证正面</text>
          <view class="id-upload" @click="uploadIdFront">
            <image
              v-if="form.idFront"
              :src="form.idFront"
              class="id-photo"
            ></image>
            <text v-else class="upload-text">点击上传</text>
          </view>
        </view>
        <view class="form-item">
          <text class="label">身份证反面</text>
          <view class="id-upload" @click="uploadIdBack">
            <image
              v-if="form.idBack"
              :src="form.idBack"
              class="id-photo"
            ></image>
            <text v-else class="upload-text">点击上传</text>
          </view>
        </view>
        <view class="agreement">
          <checkbox v-model="form.agreed" />
          <text>我已阅读并同意</text>
          <text class="link" @click="openUserAgreement">用户协议</text>
          <text>和</text>
          <text class="link" @click="openServiceAgreement">服务协议</text>
        </view>
        <button
          class="submit-button"
          :disabled="!canSubmit"
          @click="submitForm"
        >
          注册成为陪诊师
        </button>
      </form>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      form: {
        avatar: "",
        realName: "",
        genderIndex: 0,
        age: "",
        phone: "",
        city: "",
        qualificationNumber: "",
        certificate: "",
        idNumber: "",
        idFront: "",
        idBack: "",
        agreed: false,
      },
      genders: ["男", "女"],
    };
  },
  computed: {
    canSubmit() {
      return (
        this.form.avatar &&
        this.form.realName &&
        this.form.age &&
        this.form.phone &&
        this.form.city &&
        this.form.qualificationNumber &&
        this.form.certificate &&
        this.form.idNumber &&
        this.form.idFront &&
        this.form.idBack &&
        this.form.agreed &&
        this.validatePhone(this.form.phone) &&
        this.validateIdNumber(this.form.idNumber)
      );
    },
  },
  
  methods: {
    uploadAvatar() {
      // 上传头像逻辑
    },
    uploadCertificate() {
      // 上传证书图片逻辑
    },
    uploadIdFront() {
      // 上传身份证正面逻辑
    },
    uploadIdBack() {
      // 上传身份证反面逻辑
    },
    validatePhone(phone) {
      // 简单手机号验证
      return /^1[3-9]\d{9}$/.test(phone);
    },
    validateIdNumber(idNumber) {
      // 简单身份证号码验证
      return /^\d{15}|\d{18}$/.test(idNumber);
    },
    openUserAgreement() {
      // 打开用户协议
    },
    openServiceAgreement() {
      // 打开服务协议
    },
    submitForm() {
      if (this.canSubmit) {
        // 提交表单逻辑
        console.log("表单提交成功:", this.form);
        uni.showToast({
          title: "注册成功",
          icon: "success",
        });
      } else {
        uni.showToast({
          title: "请完整填写信息",
          icon: "none",
        });
      }
    },
  },
};
</script>

<style>
.page {
  padding-top: 190rpx;
}
.container {
  background-color: #fff;
  margin: 25rpx;
  margin-top: 0rpx;
  padding: 20rpx;
  border-radius: 50rpx;
}
.form-item {
  margin-bottom: 20rpx;
}

.label {
  font-size: 24rpx;
  color: #333;
  margin-bottom: 5rpx;
}

input {
  width: 100%;
  padding: 10rpx;
  border: 1rpx solid #ccc;
  border-radius: 5rpx;

  font-size: 20rpx;
}

.avatar-upload,
.certificate-upload,
.id-upload {
  width: 150rpx;
  height: 150rpx;
  border: 1rpx dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10rpx;
}

.upload-text {
  font-size: 18rpx;
  color: #999;
}

.avatar,
.certificate,
.id-photo {
  width: 100%;
  height: 100%;
}

.agreement {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
}

.link {
  color: #007aff;
  margin: 0 5rpx;
  text-decoration: underline;
}

.submit-button {
  width: 100%;
  padding: 15rpx;
  background-color: #007aff;
  color: #fff;
  border: none;
  border-radius: 10rpx;
  font-size: 24rpx;
  margin-top: 30rpx;
  cursor: pointer;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>

