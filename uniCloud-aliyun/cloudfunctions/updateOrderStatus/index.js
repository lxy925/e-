const db = uniCloud.database();

exports.main = async (event) => {
	const {
		order_no,
		from_status,
		to_status
	} = event;
	console.log('更新订单状态参数:', event);

	try {
		// 1. 查询订单是否存在
		const orderRes = await db.collection('orders')
			.where({
				order_no
			})
			.get();

		const order = orderRes.data[0];
		if (!order) {
			return {
				success: false,
				message: '订单不存在'
			};
		}

		// 2. 检查状态是否允许更新
		if (order.status !== from_status) {
			return {
				success: false,
				message: `订单状态不匹配，当前状态: ${order.status}`
			};
		}

		// 3. 执行更新，强制添加 updated_time 字段
		const updateRes = await db.collection('orders')
			.doc(order._id) // 使用 _id 确保唯一性
			.update({
				status: to_status,
				updated_time: Date.now() // 强制添加时间戳字段
			});

		console.log('更新结果:', updateRes);

		// 4. 更新后再次查询订单，验证字段是否添加成功
		const updatedOrder = await db.collection('orders')
			.doc(order._id)
			.get();

		console.log('更新后的订单:', updatedOrder.data);

		return {
			success: updateRes.updated === 1,
			updated: updateRes.updated,
			updatedOrder: updatedOrder.data // 返回完整的更新后数据
		};
	} catch (err) {
		console.error('更新订单状态失败:', err);
		return {
			success: false,
			error: err.message
		};
	}
};