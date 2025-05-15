'use strict';
/**
 * 此处建议只改下订单状态，保证能及时返回给第三方支付服务器成功状态
 * 且where条件可以增加判断服务器推送过来的金额和订单表中订单需支付金额是否一致
 * 将消息发送、返佣、业绩结算等业务逻辑异步处理(写入异步任务队列表)
 * 如开启定时器每隔5秒触发一次，处理订单
 */

const db = uniCloud.database(); // 全局数据库引用
const _ = db.command; // 数据库操作符
const $ = _.aggregate; // 聚合查询操作符

module.exports = async (obj) => {
	let user_order_success = true;
	let { data = {} } = obj;
	let {
		out_trade_no,
		transaction_id,
		total_fee,
		expand_data = {},
	} = data;
	// 注意，data内可以拿到很多数据，并非只有上面这几个字段，详见：https://vkdoc.fsq.pub/vk-uni-pay/db/vk-pay-orders.html
	let {
		mode,
	} = expand_data;
	if (mode === "short_series_coin") {
		// 代币充值
		// 不需要处理，因为微信官方已经给用户自动充值了
		// 如果你还有自己的业务逻辑，可以在此处写
		let {
			buy_quantity, // 充值的代币数量
		} = expand_data;


		user_order_success = true; // 最终返回true即可 true 代表你自己的逻辑处理成功 返回 false 代表你自己的处理逻辑失败。
	} else if (mode === "short_series_goods") {
		// 道具直购
		// 此处写你自己的道具直购支付成功逻辑开始-----------------------------------------------------------
		let {
			buy_quantity, // 购买的道具数量
			product_id, // 道具id
			goods_price, // 道具价格
		} = expand_data;
		// 有三种方式
		// 方式一：直接写数据库操作（原生数据库语句）
		// 方式二：使用 await uniCloud.callFunction 调用其他云函数
		// 方式三：使用 await uniCloud.httpclient.request 调用http接口地址

		// 注意：如果使用方式二和方式三时，为了安全起见，请带上请求密钥（密钥自己传一个固定的32位字符串即可），然后在你请求的接口中判断密钥是否一致，可以有效的防止伪造请求。（因为密钥只有你自己知道）

		user_order_success = true; // 最终返回true即可 true 代表你自己的逻辑处理成功 返回 false 代表你自己的处理逻辑失败。
		// 此处写你自己的道具直购支付成功逻辑结束-----------------------------------------------------------

	}

	return user_order_success;
};
