'use strict';
const db = uniCloud.database();

exports.main = async (event) => {
	// 参数校验增强
	const requiredParams = ['user_id', 'total_price', 'order_no', 'client_time'];
	const missingParams = requiredParams.filter(p => !(p in event));
	if (missingParams.length > 0) {
		throw new Error(`缺少必要参数: ${missingParams.join(', ')}`);
	}

	// 将 client_time 转换为 Date 对象
	let clientTime;
	if (typeof event.client_time === 'number') {
		clientTime = new Date(event.client_time);
	} else if (typeof event.client_time === 'string') {
		clientTime = new Date(event.client_time);
	} else {
		throw new Error('client_time 必须是字符串或数字');
	}

	if (isNaN(clientTime.getTime())) {
		throw new Error('client_time 无效');
	}

	try {
		const orderData = {
			order_no: event.order_no, // 对外订单号
			out_trade_no: event.out_trade_no, // 支付单号（与订单号一致）
			user_id: event.user_id,
			total_price: Number(event.total_price),
			status: event.status,
			create_time: clientTime, // 使用客户端传递的时间
			expire_time: new Date(clientTime.getTime() + 15 * 60 * 1000) // 15分钟超时
		};

		// 写入订单
		const orderRes = await db.collection('orders').add(orderData);

		return {
			code: 200,
			data: {
				orderId: orderRes.id,
				orderNo: event.order_no,
				expireTime: orderData.expire_time.toISOString()
			}
		};
	} catch (e) {
		console.error(`[ERROR] 订单创建失败: ${e.message}`, e);

		return {
			code: 500,
			message: e.message || '系统繁忙，请重试'
		};
	}
};