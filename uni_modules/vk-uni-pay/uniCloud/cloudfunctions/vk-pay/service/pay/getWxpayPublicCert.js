'use strict';
const vkPay = require("vk-uni-pay");
module.exports = {
	/**
	 * 转账微信零钱 v3 版本（单笔转账）
	 * @url pay/wxpayTransfer3 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {String} real_name 真实姓名 大于2000元的转账需要填写真实姓名
	 * @param {Number} amount 金额 100=1元(单位分)
	 * @param {String} title 转账标题
	 * @param {String} openid 微信专用 - 用户的openid
	 * @param {String} remark 转账备注
	 * @param {String} out_biz_no 转账单号
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 */
	main: async (event) => {
		let { data = {}, originalParam } = event;
		let res = { code: 0, msg: '' };
		// 开始-----------------------------------------------------------
		res = await vkPay.wxpay.fetchCertificates();
		// 结束-----------------------------------------------------------
		return res;
	}
}
