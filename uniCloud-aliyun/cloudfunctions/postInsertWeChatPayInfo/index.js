'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
	try {
		// 查询订单是否存在
		const orderSnapshot = await db.collection('orders')
			.where({
				order_no: event.order_no
			})
			.get();

		if (orderSnapshot.data.length === 0) {
			return {
				code: 404,
				message: '订单未找到'
			};
		}

		// 更新订单信息
		await db.collection('orders')
			.doc(orderSnapshot.data[0]._id)
			.update({
				payment_time: event.payment_time,
				transaction_id: event.transaction_id
			});

		return {
			code: 0,
			message: 'success'
		};
	} catch (error) {
		console.error('Error in updating payment info:', error);
		return {
			code: 500,
			message: '更新支付信息失败'
		};
	}
};