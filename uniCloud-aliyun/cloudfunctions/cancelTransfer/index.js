'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
	const out_bill_no, = event.out_bill_no;

	// 参数校验
	if (!out_bill_no) {
		return {
			code: 400,
			msg: '缺少必要参数'
		};
	}

	const vkPay = uniCloud.importObject('vk-uni-pay');


	try {
		// 1. 调用支付平台撤销接口
		const cancelResult = await vkPay.cancelTransfer({
			provider: "wxpay",
			platform: 'mp-weixin',
			out_bill_no
		});

		if (cancelResult.code == 0) {
			return {
				code: 200,
				msg: '撤销成功'
			};
		}
	} catch (err) {


		console.error('撤销流程失败:', err);

		return {
			code: 500,
			msg: err.message || '系统异常',
			error: process.env.NODE_ENV === 'development' ? err.stack : undefined
		};
	}
};