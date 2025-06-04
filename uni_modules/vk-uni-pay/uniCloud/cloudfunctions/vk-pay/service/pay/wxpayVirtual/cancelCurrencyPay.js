'use strict';
const vkPay = require("vk-uni-pay");
module.exports = {
	/**
	 * 代币支付退款（currencyPay接口的逆操作）
	 * @url wxpayVirtual/cancelCurrencyPay 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {String} openid 用户的openid
	 * @param {String} userIp 用户的ip地址
	 * @param {Number} amount 需要回退的代币数量
	 * @param {String} outTradeNo 需要回退的商户订单号
	 * @param {String} outRefundNo 商户退款单号
	 * @param {String} deviceType 平台类型1-安卓 仅支持传1
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 */
	main: async (event) => {
		let { data = {}, originalParam } = event;
		let res = { code: 0, msg: '' };
		// 转账开始-----------------------------------------------------------
		let {
			openid, // 用户的openid
			out_trade_no, // 商户订单号
			amount, // 需要回退的代币数量
		} = data;
		/**
		 * 注意
		 * 正式上线时请删除此云函数，避免用户恶意退款（退款代码应该写到你自己的云函数中，并自己控制好权限）
		 * 正式上线时请删除此云函数，避免用户恶意退款（退款代码应该写到你自己的云函数中，并自己控制好权限）
		 * 正式上线时请删除此云函数，避免用户恶意退款（退款代码应该写到你自己的云函数中，并自己控制好权限）
		 */
		let userIp = originalParam.context.CLIENTIP;
		let lastFourDigits = Date.now().toString().substr(-4);
		// 获取微信虚拟支付实例
		const wxpayVirtualManager = await vkPay.getWxpayVirtualManager();
		// 回退扣减代币
		res = await wxpayVirtualManager.cancelCurrencyPay({
			openid, // 用户的openid
			userIp, // 用户的ip地址
			amount: Number(amount), // 需要回退的代币数量
			outTradeNo: out_trade_no, // 需要回退的商户订单号
			outRefundNo: `${out_trade_no}-${lastFourDigits}`, // 商户退款单号
			deviceType: 1, // 平台类型1-安卓 仅支持传1
		});
		// 转账结束-----------------------------------------------------------
		return res;
	}
}
