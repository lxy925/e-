'use strict';
const unipay = require('uni-pay')
const path = require('path');
const fs = require('fs');

// 使用path模块构建路径（更可靠）
const certDir = path.join(__dirname, 'cert');

// 读取证书文件（注意：不使用utf8编码）
const apiclientCertContent = fs.readFileSync(path.join(certDir, 'apiclient_cert.pem')); // 保持Buffer格式
const apiclientKeyContent = fs.readFileSync(path.join(certDir, 'apiclient_key.pem')); // 保持Buffer格式

exports.main = async (event) => {
	// 1. 初始化支付实例
	const unipayIns = unipay.initWeixinV3({
		appId: 'wxf8afb6dce14d487a', // 替换你的APPID
		mchId: '1711967249', // 替换商户号
		v3Key: 'Epwy9402123456789012345678901940', // 替换APIv3密钥
		// serialNo: '45F59D4D8F********', // 替换证书序列号
		appCertContent: apiclientCertContent, // 参数名修正
		appPrivateKeyContent: apiclientKeyContent // 参数名修正
	});

	try {
		// 2. 生成支付订单
		const orderInfo = await unipayIns.getOrderInfo({
			body: '购买商品',
			outTradeNo: event.order_no, // 示例订单号
			totalFee: event.total_price, // 1元=100分
			tradeType: 'JSAPI', // 关键！指定支付类型:JSAPI为小程序支付
			openid: event.openId, // 通过wx.login获取
			notifyUrl: 'https://fc-mp-d3196fd4-48df-43aa-88ae-e8c598b0fa18.next.bspapp.com/uni-pay-co' // 替换你的通知地址
		});

		return {
			code: 0,
			data: orderInfo
		};
	} catch (e) {
		console.error('支付报错:', e);
		return {
			code: -1,
			msg: e.message
		};
	}
};