'use strict';
/**
 * 要求：只改下订单状态，保证能及时返回给第三方支付服务器成功状态（必须要在5秒内返回）
 */

const db = uniCloud.database(); // 全局数据库引用
const _ = db.command; // 数据库操作符
const $ = _.aggregate; // 聚合查询操作符

module.exports = async (obj) => {
	let user_order_success = true;
	let { data = {} } = obj;
	let {
		appid, // appid
		create_time, // 创建时间
		mch_id, // 商户号
		openid, // 用户openid
		out_bill_no, // 商户转账单号
		state, // 状态：SUCCES
		transfer_amount, // 转账金额
		transfer_bill_no, // 微信转账单号
		transfer_remark, // 转账备注
		update_time, // 更新时间
	} = data;

	// 此处写你自己的回调逻辑开始-----------------------------------------------------------
	// 有三种方式
	// 方式一：直接写数据库操作（原生数据库语句）
	// 方式二：使用 await uniCloud.callFunction 调用其他云函数
	// 方式三：使用 await uniCloud.httpclient.request 调用http接口地址
	// 注意：如果使用方式二和方式三时，为了安全起见，请带上请求密钥（密钥自己传一个固定的32位字符串即可），然后在你请求的接口中判断密钥是否一致，可以有效的防止伪造请求。（因为密钥只有你自己知道）

	/**
	 * state 的转账状态（只有 state 为 SUCCESS 或者 FAIL 或者 CANCELLED 的时候才会回调到这里）
	 * SUCCESS: 转账成功
	 * FAIL: 转账失败
	 * CANCELLED: 转账撤销完成
	 * data内的其他参数详见文档：https://pay.weixin.qq.com/doc/v3/merchant/4012716437 中的应答参数
	 */

	console.log("在这里写自己的转账回调逻辑处理");

	if (state === "SUCCESS") {
		// 转账成功
	} else if (state === "FAIL") {
		// 转账失败
	} else if (state === "CANCELLED") {
		// 转账撤销完成
	}

	// 此处写你自己的回调逻辑结束-----------------------------------------------------------
	// user_order_success =  true 代表你自己的逻辑处理成功 返回 false 代表你自己的处理逻辑失败。
	return user_order_success;
};
