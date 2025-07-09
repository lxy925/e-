const db = uniCloud.database();

exports.main = async (event) => {
	// 打印完整的event对象
	console.log('完整的event对象:', JSON.stringify(event, null, 2));

	const {
		order_no,
		from_status,
		to_status,
		update_data = {}
	} = event.args || event;
	console.log('更新订单状态参数:', event);

	try {
		// 参数验证
		if (!order_no || !from_status || !to_status) {
			console.log('参数验证失败:', {
				order_no,
				from_status,
				to_status
			});
			return {
				code: 400,
				success: false,
				message: '缺少必要参数: order_no, from_status, to_status'
			};
		}

		// 查询订单是否存在
		const orderRes = await db.collection('orders')
			.where({
				order_no
			})
			.get();

		const order = orderRes.data[0];
		if (!order) {
			return {
				code: 404,
				success: false,
				message: '订单不存在'
			};
		}

		// 检查状态是否允许更新
		if (order.status !== from_status) {
			return {
				code: 400,
				success: false,
				message: `订单状态不匹配，当前状态: ${order.status}, 期望状态: ${from_status}`
			};
		}

		// 构建更新数据
		const updateData = {
			status: to_status,
			updated_time: Date.now(),
			...update_data // 合并传入的额外更新数据
		};

		// 执行更新
		const updateRes = await db.collection('orders')
			.doc(order._id)
			.update(updateData);

		// 更新后查询订单
		const updatedOrder = await db.collection('orders')
			.doc(order._id)
			.get();

		return {
			code: 200,
			success: updateRes.updated === 1,
			message: '订单状态更新成功',
			data: updatedOrder.data
		};
	} catch (err) {
		console.error('更新订单状态失败:', err);
		return {
			code: 500,
			success: false,
			message: '服务器错误',
			error: err.message
		};
	}
};