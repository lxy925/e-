'use strict';
const db = uniCloud.database();
const _ = db.command;

exports.main = async (event, context) => {
	try {
		const now = db.serverDate(); // 获取当前服务器时间

		// 查询所有超时且状态为 pending 的订单
		const expiredOrders = await db.collection('orders')
			.where({
				status: 'pending',
				expire_time: _.lt(now) // expire_time < 当前时间
			})
			.get();

		for (const order of expiredOrders.data) {
			try {
				// 更新订单状态为 expired
				await db.collection('orders')
					.where({
						user_id: order._id
					})
					.update({
						status: 'expired',
						updated_at: db.serverDate()
					});

				// 调用微信关闭订单API（需实现）
				// await closeWechatOrder(order.order_no);

				// 执行补偿逻辑（如库存回滚）
				await rollbackStock(order.order_no);

				console.log(`订单 ${order.order_no} 已超时并关闭`);
			} catch (err) {
				console.error(`处理订单 ${order.order_no} 失败:`, err);
			}
		}

		return {
			code: 200,
			count: expiredOrders.data.length
		};
	} catch (e) {
		console.error('超时检测失败:', e);
		throw e;
	}
};

// // 示例：调用微信关闭订单（需补充完整）
// async function closeWechatOrder(orderNo) {
//   // 调用微信支付关闭订单API
// }