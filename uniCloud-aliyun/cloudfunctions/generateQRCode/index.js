'use strict';
const cloud = require('wx-server-sdk');
cloud.init();
const axios = require('axios');

exports.main = async (event, context) => {
  const { user_id } = event; // 获取陪诊师的 user_id

  // 获取 access_token
  const accessTokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxf8afb6dce14d487a&secret=06d3e5f2f7ed1bf8504fe90a1a1e04e5`;

  let accessToken; // 使用 let 声明变量，避免 const 重新赋值问题

  try {
    const response = await axios.get(accessTokenUrl);
    if (response.data && response.data.access_token) {
      accessToken = response.data.access_token;
      console.log("获取到的 access_token:", accessToken);
    } else {
      throw new Error(`获取 access_token 失败: ${response.data.errmsg}`);
    }
  } catch (error) {
    console.error("获取 access_token 失败:", error.response ? error.response.data : error.message);
    return {
      code: 500,
      message: '获取 access_token 失败',
      error: error.message || '未知错误'
    };
  }

  // 微信生成小程序码的接口
  const url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`;

  try {
    // 调用微信接口生成小程序码,确保该页面已经发布到微信小程序的线上版本中
    const response = await axios.post(url, {
      scene: user_id, // 携带 user_id 参数
      page: 'pages/escortRegistration/escortRegistration', // 跳转的小程序页面
      width: 430, // 二维码宽度
    }, {
      responseType: 'arraybuffer', // 返回二进制数据
    });

    // 检查返回的数据是否是二维码
    if (response.headers['content-type'] === 'image/jpeg' || response.headers['content-type'] === 'image/png') {
      // 将二进制数据转换为 Base64
      const qrCodeDataUrl = `data:image/png;base64,${Buffer.from(response.data, 'binary').toString('base64')}`;

      return {
        code: 200,
        message: '生成成功',
        data: qrCodeDataUrl // 返回二维码的 Data URL
      };
    } else {
      // 如果不是二维码，返回错误信息
      const errorData = JSON.parse(response.data.toString());
      console.error("微信接口返回错误:", errorData);
      return {
        code: 500,
        message: '生成小程序码失败',
        error: errorData.errmsg || '未知错误'
      };
    }
  } catch (err) {
    console.error("生成小程序码失败:", err.response ? err.response.data : err.message);
    return {
      code: 500,
      message: '生成小程序码失败',
      error: err.response ? err.response.data : err.message
    };
  }
};