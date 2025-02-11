const httpclient = require('httpclient');

exports.main = async function(event, context) {
  const { code } = event;
  const appId = 'wxf8afb6dce14d487a'; // 替换为你的小程序 appId
  const appSecret = 'f00ab7cf65338de89b24cb5a52c640a4'; // 替换为你的小程序 appSecret
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;

  try {
    const response = await httpclient.request({
      url: url,
      method: 'GET',
      dataType: 'json'
    });

    if (response.errcode) {
      return { success: false, error: response.errmsg };
    }

    return { success: true, session_key: response.session_key, openid: response.openid };
  } catch (err) {
    console.error('请求微信服务器失败', err);
    return { success: false, error: '请求微信服务器失败' };
  }
};