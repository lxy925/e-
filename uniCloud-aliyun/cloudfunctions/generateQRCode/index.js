'use strict';
const cloud = require('wx-server-sdk');
cloud.init();
const axios = require('axios');

exports.main = async (event, context) => {
  const { user_id } = event; // 获取陪诊师的 user_id

  // 获取 access_token
  const accessTokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxf8afb6dce14d487a&secret=06d3e5f2f7ed1bf8504fe90a1a1e04e5`;

  let accessToken;
  try {
    const response = await axios.get(accessTokenUrl);
    if (response.data && response.data.access_token) {
      accessToken = response.data.access_token;
    } else {
      throw new Error(`获取 access_token 失败: ${response.data.errmsg}`);
    }
  } catch (error) {
    console.error("获取 access_token 失败:", error);
    return { code: 500, message: '获取 access_token 失败', error: error.message };
  }

  // 微信生成小程序码的接口
  const url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`;

  try {
    // 生成唯一的二维码标识（如时间戳）
    const timestamp = Date.now();
    const qrCodeId = `${user_id}_${timestamp}`;

    // 调用微信接口生成小程序码
    const response = await axios.post(url, {
      scene: qrCodeId, // 携带唯一的二维码标识
      page: 'pages/login/login', // 跳转到登录页面
      width: 430, // 二维码宽度
    }, {
      responseType: 'arraybuffer', // 返回二进制数据
    });

    // 将二维码保存到云存储
    const uploadResult = await cloud.uploadFile({
      cloudPath: `qrcodes/${qrCodeId}.png`, // 云存储路径（包含唯一标识）
      fileContent: response.data, // 二维码二进制数据
    });

    // 返回二维码的云存储地址
    return {
      code: 200,
      message: '生成成功',
      data: uploadResult.fileID, // 二维码的云存储文件 ID
    };
  } catch (err) {
    console.error("生成小程序码失败:", err);
    return { code: 500, message: '生成小程序码失败', error: err.message };
  }
};