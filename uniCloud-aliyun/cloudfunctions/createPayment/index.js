const vkPay = require("vk-uni-pay");

exports.main = async (event, context) => {

	let res = await vkPay.createPayment({
		context,
		provider: "wxpay",
		data: {
			//"用户openid，小程序支付时必传"
			openid: event.openid,
			//"必填项，商户支付订单号，需自行保证全局唯一"
			out_trade_no: event.out_trade_no,
			total_fee: 1, // 订单金额（单位分 100 = 1元）
			subject: "订单标题",
			type: "recharge", // 订单类型如recharge（充值订单）、goods（商品订单）、vip（会员订单）等，此处type的值如果是recharge，则回调时就会执行 pay-notify 目录下的 recharge.js 内的逻辑
			// 自定义回调数据，能在回调事件获取到以下数据，回调函数中通过 let { out_trade_no, user_id, recharge_balance } = data;方式获取（不可与data内的一级属性名重复）
			custom: {

			},
			// 微信、支付宝文档上的其他选填参数（other内的参数会原样发送给微信、支付宝）
			other: {

			}
		}
	});

	return res;

};