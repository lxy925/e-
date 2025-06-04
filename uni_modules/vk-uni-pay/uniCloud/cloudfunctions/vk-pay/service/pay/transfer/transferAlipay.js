'use strict';
const vkPay = require("vk-uni-pay");
module.exports = {
	/**
	 * 转账到支付宝
	 * @url pay/transfer/transferAlipay 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {String} pid vk-pay-config表的_id（多商户模式下必填）
	 * @param {String} platform 使用哪个平台的配置，如 mp-weixin、h5-weixin 等
	 * @param {String} out_bill_no 必填，商户系统内部的商家单号，要求此参数只能由数字、大小写字母组成，在商户系统内部唯一
	 * @param {Number} transfer_amount 必填，转账金额 单位分 100=1元
	 * @param {String} transfer_remark 转账备注
	 * @param {String} payee_info 必填，收款方信息
	 * @param {String} order_title 必填，转账业务的标题，用于在支付宝用户的账单里显示。
	 * @param {Boolean} payer_use_alias 是否展示付款方别名，为true将展示商家支付宝在商家中心 商户信息 > 商户基本信息 页面配置的 商户别名
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 */
	main: async (event) => {
		let { data = {}, originalParam } = event;
		let res = { code: 0, msg: '' };
		/**
		 * 注意
		 * 正式上线时请删除此云函数（转账代码应该写到你自己的云函数中，并自己控制好权限）
		 * 正式上线时请删除此云函数（转账代码应该写到你自己的云函数中，并自己控制好权限）
		 * 正式上线时请删除此云函数（转账代码应该写到你自己的云函数中，并自己控制好权限）
		 */
		// 转账开始-----------------------------------------------------------
		res = await vkPay.transfer({
			provider: "alipay", // 固定值alipay
			out_bill_no: "test" + Date.now(), // 商户系统内部的商家单号，要求此参数只能由数字、大小写字母组成，在商户系统内部唯一
			payee_info: {
				identity_type: "ALIPAY_LOGON_ID", // 收款方账户类型。可取值：ALIPAY_USER_ID（支付宝用户 UID）、ALIPAY_LOGON_ID（支付宝登录账号）ALIPAY_OPEN_ID（支付宝 openId）
				// 当 identity_type=ALIPAY_USER_ID 时，参数 identity 填写支付宝用户 UID。示例值：2088开头的一串数字
				// 当 identity_type=ALIPAY_LOGON_ID 时，参数 identity 填写支付宝登录账号。示例值：邮箱或手机号
				// 当 identity_type=ALIPAY_OPEN_ID 时，参数 identity 填写支付宝用户 openId。示例值：英文字母和数字组成一串字符串
				identity: "xxx@163.com",
				name: "真实姓名", // 收款方真实姓名。当 identity_type=ALIPAY_LOGON_ID 时，本参数必填
				// cert_type: "", // 参与方的证件类型。IDENTITY_CARD：身份证，PASSPORT：护照
				// cert_no: "", // 参与方的证件号，支持身份证号、护照号。当传入cert_type时，必传
			},
			transfer_amount: 10, // 转账金额 100=1元（单位分）
			order_title: "转账", // 转账标题
			transfer_remark: "转账备注", // 转账备注
			payer_use_alias: true
		});
		if (res.code === 0) {
			// 转账成功
			console.log("转账成功");
		} else {
			// 转账失败
			console.log("转账失败", res.msg);
		}
		// 转账结束-----------------------------------------------------------
		return res;
	}
}
