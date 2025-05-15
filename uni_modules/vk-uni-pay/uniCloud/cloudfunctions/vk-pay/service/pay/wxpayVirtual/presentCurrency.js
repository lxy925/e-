'use strict';
const vkPay = require("vk-uni-pay");
module.exports = {
	/**
	 * 赠送代币
	 * @url wxpayVirtual/presentCurrency 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {String} openid 用户的openid
	 * @param {String} userIp 用户的ip地址
	 * @param {Number} amount 赠送代币数量
	 * @param {String} outTradeNo 商户订单号
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
			amount, // 赠送代币数量
		} = data;
		/**
		 * 注意
		 * 正式上线时请删除此云函数（赠送代币代码应该写到你自己的云函数中，并自己控制好权限）
		 * 正式上线时请删除此云函数（赠送代币代码应该写到你自己的云函数中，并自己控制好权限）
		 * 正式上线时请删除此云函数（赠送代币代码应该写到你自己的云函数中，并自己控制好权限）
		 */
		let userIp = originalParam.context.CLIENTIP;
		// 获取微信虚拟支付实例
		const wxpayVirtualManager = await vkPay.getWxpayVirtualManager();
		// 赠送代币
		res = await wxpayVirtualManager.presentCurrency({
			openid, // 用户的openid
			userIp, // 用户的ip地址
			amount: Number(amount), // 赠送代币数量
			outTradeNo: out_trade_no, // 商户订单号
			deviceType: 1, // 平台类型1-安卓 仅支持传1
		});
		// 转账结束-----------------------------------------------------------
		return res;
	}
}
