   // getOpenId/index.js
   const axios = require('axios');

   exports.main = async (event, context) => {
     const { code } = event;
     const appid = 'mp-d3196fd4-48df-43aa-88ae-e8c598b0fa18'; // 替换为您的小程序 AppID
     const secret = 'rk5d8I7mtxu3FSrSipUvCA=='; // 替换为您的小程序 AppSecret

     const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;

     try {
       const response = await axios.get(url);
       return {
         openId: response.data.openid, // 返回 openId
       };
     } catch (error) {
       console.error('获取 openId 失败：', error);
       return {
         code: 1,
         message: '获取 openId 失败',
       };
     }
   };