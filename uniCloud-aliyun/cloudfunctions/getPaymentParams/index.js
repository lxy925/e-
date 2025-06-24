// 云函数 getPaymentParams.js
exports.main = async (event, context) => {
	try {
		const {
			orderId
		} = event;
		const db = uniCloud.database();

		// 查询订单信息
		const orderRes = await db.collection('orders').doc(orderId).get();
		if (orderRes.data.length === 0) {
			return {
				code: 404,
				message: '订单不存在'
			};
		}

		const order = orderRes.data[0];

		// 检查订单状态
		if (order.status !== 'unpaid') {
			return {
				code: 400,
				message: '订单状态不支持支付'
			};
		}

		return {
			code: 200,
			data: {
				orderNo: order.order_no,
				outTradeNo: order.out_trade_no,
				totalPrice: order.total_price,
				openid: order.user_id
			}
		};

	} catch (e) {
		console.error('获取支付参数异常:', e);
		return {
			code: 500,
			message: '服务器内部错误'
		};
	}
};