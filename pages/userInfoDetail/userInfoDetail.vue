<template>
	<view class="page">
		<view class="user-info-detail">
            <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="getAvatar">
                <image :src="avatar || '../../static/images/index/touxiang.jpg'" mode="widthFix" />
            </button>
            <view class="tip">{{show?'欢迎使用':'当前未登录，请登录！'}}</view>
        </view>

        <view class="user-info-detail">
            <view class="user-info-item">
                <image src="../../static/images/mine/user.png" alt=""></image>
                <view class="user-info-item-title">昵称</view>
                <input type="nickname" class="username" @blur="getName" :placeholder="nickName || '设置你的昵称'" />
            </view>
            <view class="user-info-item">
                <image src="../../static/images/mine/name.png" alt=""></image>

                <view class="user-info-item-title">真实姓名</view>
                <input type="text" class="username" placeholder="设置你的真实姓名" v-model="realName" />
            </view>
            <view class="user-info-item">
                <image src="../../static/images/mine/phone.png" alt=""></image>
                <view class="user-info-item-title">手机号</view>
                <input type="text" class="username" placeholder="请输入你的手机号"  v-model="phone" />
                <button class="get-code" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">获取</button>
            </view>

        </view>
<view class="submit">
   <image src="../../static/images/mine/submit.png" alt=""></image>
    <button class="submit-btn" @click="submitUserInfo">提交</button>
	</view>
</view>
</template>


<script>
import WXBizDataCrypt from "../userInfoDetail/aes-sample.eae1f364/Node/WXBizDataCrypt" ;
export default {
    data() {
        return {
            
                avatar: '',
                show: false,
                nickName: '',
                phone: "",
				phone_iv: "",
				js_code: "",
				session_key: "",
                realName: '',
                ID: '',
                fromPage: '',
        };
    }
    /**

     * 生命周期函数--监听页面加载
     */,
    onLoad(options) {
         // 获取来源页面参数
         this.fromPage = options.from || 'mine';
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {},
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        this.go();
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {},
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {},
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {},
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {},
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {},
    methods: {
        // 获取头像
        getAvatar(e) {
            console.log(e);
            this.avatar = e.detail.avatarUrl;
            this.show = true;

        },
        getName(e) {
            this.nickName = e.detail.value;
        },


        go() {
				uni.login({
					provider: 'weixin',
					success: res => {
						console.log(res)
						this.js_code = res.code
						uni.request({
							url: 'https://api.weixin.qq.com/sns/jscode2session', // 请求微信服务器
							method: 'GET',
							data: {
								appid: 'wx73ff71f0487b4e8a', //你的小程序的APPID
								secret: '5126ad6f18ba8a6bbdbee0eac4615b17', //你的小程序秘钥secret,  
								js_code: this.js_code, //uni.login 登录成功后的code
								grant_type: 'authorization_code' //此处为固定值
							},
							success: (res) => {
								console.log('获取信息', res.data);
                                this.ID = res.data.openid
								this.session_key = res.data.session_key
 
							}
						});
					}
				});
			},
        // 获取手机号
        getPhoneNumber(res) { // 获取手机号
				this.phone_encryptedData = res.detail.encryptedData //用于解密
				this.phone_iv = res.detail.iv // 用于解密
                console.log(this.phone_encryptedData,this.phone_iv);
				console.log(res, "获取手机号需要的参数");
				let pc = new WXBizDataCrypt('wx73ff71f0487b4e8a', this.session_key);
				let data = pc.decryptData(this.phone_encryptedData, this.phone_iv);
				console.log(data);
				if (data.phoneNumber != '') {
					this.phone = data.phoneNumber
				}
			},
        submitUserInfo() {
            // 保存用户信息到本地存储
            const userInfo = {
                avatarUrl: this.avatar,
                realName: this.realName,
                ID: this.ID,
            };
             // 根据来源页面存储不同的信息
             if (this.fromPage === 'doctorlogin') {
                uni.setStorageSync('doctorInfo', userInfo);
            } else {
                uni.setStorageSync('userInfo', userInfo);
            }
            


            // 返回上一页
            uni.navigateBack({
                delta: 1
            });
        }
    }
};
</script>

<style>
.page {
    min-height: 100vh;
    background: linear-gradient(to bottom, #54c69a, #fffcf9);
    padding-top: 0;
    margin-top: -1px; /* 消除可能的间隙 */
}
.user-info-detail {
    width: 100%;
    height: 100%;
    margin-top: 80rpx;
}
.user-info-detail image {
    width: 150rpx;
    height: 150rpx;
    border-radius: 50%;
    overflow: hidden;
    margin-top: 50rpx;
}

.avatar-btn {
    padding: 0;
    width: auto !important;
    background: none;
    border: none;
    line-height: 1;
}

.avatar-btn::after {
    border: none;
}
.tip {
    font-size: 30rpx;
    color: #fff;
    text-align: center;
    margin-top: 20rpx;
}
.user-info-item {
    display: flex;
  align-items: center;
  padding: 25rpx;
  font-size: 30rpx;
  font-weight: inherit;
  background-color: rgba(255, 255, 255, 1);
  border-radius: 10rpx;
  border: 1rpx solid #5352528a;
}
.user-info-item image {
    width: 45rpx;
    height: 45rpx;
    margin:0  0 0 0;
}


.user-info-item-title {
    width: 150rpx;
    text-align: left;
    margin-left: 20rpx;
}

.username {
    flex: 1;
    text-align: right;
    margin-right: 20rpx;
}
.get-code {
    margin-left: 20rpx;
    background-color: #54c69a;
    color: #fff;
    border-radius: 10rpx;
    width: 150rpx;
    height: 60rpx;
    font-size: 28rpx;
    line-height: 60rpx;
}
.submit {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 80rpx;
}
.submit-btn { width: 400rpx;
    height: 80rpx;
    background-color: #54c69a;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-left: 50rpx; 
}
.submit image {
    width: 60rpx;
    height: 60rpx;
    position: absolute;  /* 使用绝对定位 */
    left: calc(50% - 120rpx);  /* 调整图标位置 */
    z-index: 1;
}

</style>


