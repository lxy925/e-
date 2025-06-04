<template>
	
  <view class="container">
	  	<custom-nav title="e陪无忧" :isHomePage="false"></custom-nav>
    <!-- 二维码图片 -->
    <image :src="modalImage" mode="widthFix" class="qr-code"></image>

    <!-- 扫一扫按钮 -->
    <button @click="saveQRCodeToAlbum" class="action-button">保存图片</button>

    <!-- 保存图片按钮 -->
    <button @click="shareQRCode" class="action-button">分享图片</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      modalImage: '', // 小程序码的临时文件路径// 弹窗图片路径
	  user_id:''
    };
  },
  onLoad(options) {
      // 从 options 中获取传递的数据
      this.user_id = options.user_id; // 123
      
    },
  methods: {
 //扫描二维码功能
 //生成二维码方法
 async generateQRCode() {
 	const user_id = this.user_id; // 陪诊师的 user_id
 	//若没有网络则调用之前生成的二维码
 	this.modalImage=uni.getStorageSync("modalImage")
 	try {
 		const res = await uniCloud.callFunction({
 			name: 'generateQRCode', // 云函数名称
 			data: {
 				user_id: user_id, // 传递参数
 			},
 		});
 
 		if (res.result.code === 200) {
 			this.modalImage = res.result.data; // 显示二维码
 			uni.setStorageSync("modalImage");
 			uni.showToast({
 				title: '生成成功',
 				icon: 'success',
 			});
 		} else {
 			uni.showToast({
 				title: '生成失败',
 				icon: 'none',
 			});
 		}
 	} catch (err) {
 		console.error('调用云函数失败:', err);
 		uni.showToast({
 			title: '调用云函数失败',
 			icon: 'none',
 		});
 	}
 },

 // 获取二维码的临时文件路径
 async getTempFilePath(fileID) {
  // Base64 图片地址
  const base64Data =fileID;
  
  // 去掉 Base64 前缀
  const base64 = base64Data.split(',')[1];
  
  // 转换为临时文件地址
  uni.base64ToTempFilePath({
    base64Data: base64, // Base64 数据
    success: (res) => {
      const tempFilePath = res.tempFilePath; // 临时文件地址
      console.log('临时文件地址:', tempFilePath);
      // 可以在这里使用临时文件地址，例如显示图片或上传文件
    },
    fail: (error) => {
      console.error('转换失败:', error);
    },
  });
 },
 
 // 保存二维码到手机相册
 async  saveQRCodeToAlbum() {
   try {
 	const fileID=this.modalImage;
     const tempFilePath = await this.getTempFilePath(fileID);
     await uni.saveImageToPhotosAlbum({
       filePath: tempFilePath,
     });
     uni.showToast({ title: '保存成功', icon: 'success' });
   } catch (error) {
     console.error('保存失败:', error);
     uni.showToast({ title: '保存失败', icon: 'none' });
   }
 },
 // 分享二维码
async shareQRCode() {
 	const fileID=this.modalImage;
 	const tempFilePath = await getTempFilePath(fileID);
   uni.share({
     provider: 'weixin',
     scene: 'WXSceneSession', // 分享到聊天界面
     type: 'image',
     imageUrl: tempFilePath, // 二维码的云存储文件 ID 或临时文件路径
     success: () => {
       uni.showToast({ title: '分享成功', icon: 'success' });
     },
     fail: (error) => {
       console.error('分享失败:', error);
       uni.showToast({ title: '分享失败', icon: 'none' });
     },
   });
 },
 // 假设在某个按钮点击事件中触发弹窗
 showQRCode() {
 	this.generateQRCode();
 	console.log(this.modalImage);
 	this.showModal(this.modalImage, '这里是弹窗文字内容');
 },
     
   
  },
};
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  padding-top:150rpx ;
}

.qr-code {
  width: 250px;
  height: 250px;
  margin-bottom: 20px;
  margin-top: 100px;
  background-color: #007aff;
}

.action-button {
  width: 80%;
  margin-top: 20px;
  background-color: #1fc7d6;
  color: white;
  border-radius: 5px;
}
</style>