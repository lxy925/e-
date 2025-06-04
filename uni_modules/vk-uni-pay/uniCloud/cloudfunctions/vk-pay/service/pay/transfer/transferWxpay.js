'use strict';
const vkPay = require("vk-uni-pay");
module.exports = {
	/**
	 * 转账到微信零钱
	 * @url pay/transfer/transferWxpay 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {String} pid vk-pay-config表的_id（多商户模式下必填）
	 * @param {String} platform 使用哪个平台的配置，如 mp-weixin、h5-weixin 等，默认使用 transfer
	 * @param {String} out_bill_no 必填，商户系统内部的商家单号，要求此参数只能由数字、大小写字母组成，在商户系统内部唯一
	 * @param {String} openid 必填，收款用户的openid
	 * @param {String} user_name 收款方真实姓名，转账金额 >= 2000元时必填
	 * @param {Number} transfer_amount 必填，转账金额 单位分 100=1元
	 * @param {String} transfer_remark 转账备注
	 * @param {String} transfer_scene_id 必填，该笔转账使用的转账场景，可前往“商户平台-产品中心-商家转账”中申请。如：1001-现金营销
	 * @param {String} user_recv_perception 用户收款时感知到的收款原因将根据转账场景自动展示默认内容。如有其他展示需求，可在本字段传入。各场景展示的默认内容和支持传入的内容 详见：https://pay.weixin.qq.com/doc/v3/merchant/4012711988#3.3-发起转账
	 * @param {Array} transfer_scene_report_infos 必填，各转账场景下需报备的内容 详见：https://pay.weixin.qq.com/doc/v3/merchant/4012711988#（3）按转账场景报备背景信息
	 * transfer_scene_report_infos 参数
	 * @param {String} info_type 必填，请根据产品文档确认当前转账场景下需传入的信息类型，需按要求填入，有多个字段时需填写完整 如：转账场景为1000-现金营销，需填入活动名称、奖励说明
	 * @param {String} info_content  必填，请根据信息类型，描述当前这笔转账单的转账背景 如：信息类型为活动名称，请在信息内容描述用户参与活动的名称，如新会员有礼。信息类型为奖励说明，请在信息内容描述用户因为什么奖励获取这笔资金，如注册会员抽奖一等奖
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

		// 此为验证转账异步回调的示例
		// res = await vkPay.verifyTransferNotify({
		// 	provider: "wxpay",
		// 	platform: "mp-weixin",
		// 	headers: {
		// 		"content-length": "771",
		// 		"wechatpay-nonce": "DA1cLWnRXeg9URQhqiJ5cJTsGnE1HO7F",
		// 		"x5-uuid": "dbae9365fe5f1bcfab173c9b72b7bf08",
		// 		"x-client-ip": "121.51.58.175",
		// 		"wechatpay-timestamp": "1739178529",
		// 		"wechatpay-signature": "DKA3cgWJOSNJaEed9Q9CVu0O012yCf9HCj3xZn1FrxJfkrSrTcALInu1YgE+15KNhY+PBInWr7o7pwe71L11nlczKu5tfr0h0yT5n/sosI32s30ckExyg7i1gIFupjBX0PBg9V7b2ZxE4fo3zu2txT3/hHjzl8kG02uf1DkTWvcLdLJdrsROtYVbQQ+bYxknUbjGUuPON34sHqtciMIzRsGDk6GeDEaiJ/fquKiukieepcHeaCeu3F9GSCpI1a7LxvfjcUOk+bUwwkbAZK8T0hQcFTAR7m1XYbMuNK+F/w5IeTDP2lPCauut1B6bSwafKGtR+JiAVzVmDYZTF5oZDw==",
		// 		"wechatpay-signature-type": "WECHATPAY2-SHA256-RSA2048",
		// 		"host": "fc-mp-33d35e24-c2f3-47b4-80fc-7b23a6010e11.next.bspapp.com",
		// 		"wechatpay-serial": "PUB_KEY_ID_0116789398642024122500389500000994",
		// 		"content-type": "application/json",
		// 		"x-forwarded-for": "121.51.58.175, 120.27.173.117, 39.96.130.167",
		// 		"pragma": "no-cache",
		// 		"accept": "*/*",
		// 		"x-real-ip": "121.51.58.175",
		// 		"x-sinfo": "on",
		// 		"x-forwarded-by": "172.28.195.27:80",
		// 		"user-agent": "Mozilla/4.0"
		// 	},
		// 	body: "{\"id\":\"64658c06-6fd1-5472-b1de-330ff21d5427\",\"create_time\":\"2025-02-10T17:08:45+08:00\",\"resource_type\":\"encrypt-resource\",\"event_type\":\"MCHTRANSFER.BILL.FINISHED\",\"summary\":\"商家转账单据终态通知\",\"resource\":{\"original_type\":\"mch_payment\",\"algorithm\":\"AEAD_AES_256_GCM\",\"ciphertext\":\"n0M9lop0rFdAPXnUuPSEQSb895fuNvXQs+bPZa9MylNro7nZ84AYQwQd+wyJGEZ2bUbGBmSePB3CAxifcyjAya1miHw54KRYlJ7SyB0Hx5Kar26EJDbCSg7GjoAQgS0dd1qnRWEjhKiJOqagoZW1mXAekhBHPPusGFTEJEFv+JK8MJNUb704YM/hCBtMuddNWa4+jH2ByCYisW8vTU0yhLFo4BdU3nyA44NCIb2NEBpe9BmOY0nIlDdv2B9h+UIHZ48mrFRrwhPjvSug8PBH3OQumipjHXG798EJhXJ1UKBwvUa+XNs6tqFucPVRoFzEg1PxsoJ8SvqgwAWiEOnxHddCBNWOZRcUCU6rmKp6YtED+gDT65FoA5p1gGu46650VXVbc9WMSn8Z+qyAqThQMRxPrzGhtheU8A==\",\"associated_data\":\"mch_payment\",\"nonce\":\"Qpe1yWY1GE1O\"}}",
		// });
		// return res;

		// 转账开始-----------------------------------------------------------
		let out_bill_no = "test" + Date.now();
		res = await vkPay.transfer({
			provider: "wxpay", // 固定值wxpay
			out_bill_no, // 商户系统内部的转账单号
			transfer_amount: 10, // 转账金额 100=1元（单位分）
			openid: "ogtX061Da3Azw7fUZm-zNBYmbt0U", // 用户的openid
			user_name: "真实姓名", // 收款方真实姓名，转账金额 >= 2000元时必填
			transfer_remark: "转账备注", // 转账备注
			transfer_scene_id: "1000",
			user_recv_perception: "现金奖励",
			transfer_scene_report_infos: [{
					info_type: "活动名称",
					info_content: "新会员有礼"
				},
				{
					info_type: "奖励说明",
					info_content: "注册会员抽奖一等奖"
				}
			]
		});
		if (res.code === 0) {
			// 转账申请提交成功
			console.log("转账申请提交成功");
			// 执行转账接口成功后，在用户未确认收款前还可以执行转账撤销接口来撤销本次转账
			// let cancelTransferRes = await vkPay.cancelTransfer({
			// 	provider: "wxpay", // 固定值wxpay
			// 	platform: "mp-weixin", // 平台类型：app-plus、mp-weixin，用于获取对应平台的支付配置信息
			// 	out_bill_no
			// });
			// console.log('cancelTransferRes: ', cancelTransferRes);
			// // 通过queryTransfer接口可以查询转账结果
			// let queryTransferRes = await vkPay.queryTransfer({
			// 	provider: "wxpay", // 固定值wxpay
			// 	platform: "mp-weixin", // 平台类型：app-plus、mp-weixin，用于获取对应平台的支付配置信息
			// 	out_bill_no
			// });
			// console.log('queryTransferRes: ', queryTransferRes)
		} else {
			// 转账申请提交失败
			console.log("转账申请提交失败", res.msg);
		}
		// 转账结束-----------------------------------------------------------
		return res;
	}
}
