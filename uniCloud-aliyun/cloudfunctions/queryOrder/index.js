const vkPay = require("vk-uni-pay");

exports.main = async (event, context) => {

	let res = await vkPay.queryPayment({
		out_trade_no: "event.outTradeNo",
		await_notify: false, // 是否需要等待异步通知执行完成，若为了响应速度，可以设置为false，若需要等待异步回调执行完成，则设置为true
		pay_order_info: true, // 是否需要返回支付订单信息，默认为false
	});

	return res;
};