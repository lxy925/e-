// 云函数文件：reFundPay/index.js
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
	try {
		// 初始化 uni-pay
		const unipayIns = unipay.initWeixinV3({
			appId: 'wxf8afb6dce14d487a', // 替换你的APPID
			mchId: '1711967249', // 替换商户号
			v3Key: 'Epwy9402123456789012345678901940', // 替换APIv3密钥
			// serialNo: '45F59D4D8F********', // 替换证书序列号
			appCertContent: apiclientCertContent, // 参数名修正
			appPrivateKeyContent: apiclientKeyContent // 参数名修正
		});

		// 构造退款参数
		const refundParams = {
			outRefundNo: `T${new Date().getTime()}`, // 商户退款单号
			outTradeNo: event.out_trade_no, // 商户订单号
			totalFee: Number(event.total_fee), // 订单总金额（单位：分）
			refundFee: Number(event.refund_fee || event.total_fee), // 退款金额（单位：分）
			refundFeeType: 'CNY',
		};
		// 使用 uni-pay 查询订单
		// 添加查询前的日志输出
		console.log('开始查询订单，event参数:', {
			event: event
		});
		console.log('开始查询订单，参数:', {
			out_trade_no: event.out_trade_no
		});
		try {
			let queryResult = await unipayIns.getOrder({
				outTradeNo: event.out_trade_no, // 注意参数名与文档保持一致
			});
			console.log('微信支付订单查询结果（原始）:', queryResult);
			console.log('微信支付订单查询结果（格式化）:', JSON.stringify(queryResult, null, 2));
		} catch (queryError) {
			console.error('订单查询异常:', {
				code: queryError.errCode,
				message: queryError.errMsg,
				stack: queryError.stack
			});
			throw queryError; // 终止流程
		}

		// 调用 uni-pay 的 refund 方法
		const result = await unipayIns.refund(refundParams);

		// 更新订单状态为已退款
		await uniCloud.callFunction({
			name: 'updateOrderStatus',
			data: {
				order_no: event.order_no,
				status: 'refunded'
			}
		});

		return {
			code: 0,
			message: '退款成功',
			data: result
		};
	} catch (error) {
		console.error('退款失败:', error);
		return {
			code: 500,
			message: '退款失败，请检查后再试'
		};
	}
};