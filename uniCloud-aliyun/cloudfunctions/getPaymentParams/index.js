const crypto = require('crypto');
const db = uniCloud.database();

exports.main = async (event) => {
  // 配置参数（需替换为你的实际信息）
  const config = {
   appid: 'wxf8afb6dce14d487a', //你的小程序的APPID
    mchId: '1711967249',         // 微信商户号
    apiKey: 'PjZ06us3QMY9GKwP0XhW5Gk2', // 微信支付API密钥
    notifyUrl:{
		// 测试环境服务空间-支付回调地址
		"mp-d3196fd4-48df-43aa-88ae-e8c598b0fa18": "https://fc-mp-d3196fd4-48df-43aa-88ae-e8c598b0fa18.next.bspapp.com/uni-pay-co",
		// 线上环境服务空间-支付回调地址（如果只有一个服务空间，则只需要配置线上环境服务空间即可）
		"mp-499e2a37-0c77-418a-82aa-3e5820ecb057": "https://fc-mp-499e2a37-0c77-418a-82aa-3e5820ecb057.next.bspapp.com/uni-pay-co",
	} 
  };

  // 生成支付参数
  const params = {
    appid: config.appId,
    mch_id: config.mchId,
    nonce_str: crypto.randomBytes(16).toString('hex'), // 随机字符串
    body: '商品支付', // 商品描述
    out_trade_no: event.order_no, // 商户订单号
    total_fee: event.amount, // 金额（单位：分）
    spbill_create_ip: '127.0.0.1', // 终端IP
    notify_url: config.notifyUrl,
    trade_type: 'JSAPI', // 支付类型
    openid: event.openid // 用户openid
  };

  // 生成签名
  const sign = this.createSign(params, config.apiKey);
  params.sign = sign;

  return params;
};

// 生成微信支付签名
function createSign(params, apiKey) {
  const sortedParams = Object.keys(params)
    .sort()
    .filter(key => params[key] !== '' && key !== 'sign')
    .map(key => `${key}=${params[key]}`)
    .join('&');

  const stringSignTemp = `${sortedParams}&key=${apiKey}`;
  return crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase();
}