
const cloud = require('wx-server-sdk');
cloud.init();

exports.main = async (event, context) => {
    const { code } = event;
  const appid: 'wxf8afb6dce14d487a'//你的小程序的APPID
  const secret: '06d3e5f2f7ed1bf8504fe90a1a1e04e5'

    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
    const response = await cloud.httpRequest({
        url: url,
        method: 'GET',
    });

    return response.data;
};