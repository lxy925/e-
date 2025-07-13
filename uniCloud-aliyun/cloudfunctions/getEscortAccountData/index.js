'use strict';
const db = uniCloud.database();
const $ = db.command.aggregate;

exports.main = async (event, context) => {
	const {
		userId,
		startTime,
		endTime
	} = event;
	console.log('请求参数:', {
		userId,
		startTime,
		endTime
	});

	try {
		// 1. 查询待结算金额
		const pendingMatchCondition = {
			doctor_id: userId,
			status: 'paid',
			service_status: 'completed',
			audit_status: db.command.in(['unreviewed', 'pending_review']),
			create_time: db.command.gte(new Date(startTime)).lte(new Date(endTime))
		};
		console.log('待结算金额查询条件:', JSON.stringify(pendingMatchCondition));

		const pendingAmountRes = await db.collection('orders').aggregate()
			.match(pendingMatchCondition)
			.group({
				_id: null,
				total: $.sum('$total_price')
			})
			.end();
		console.log('待结算金额查询结果:', JSON.stringify(pendingAmountRes));

		// 2. 查询已结算金额
		const settledMatchCondition = {
			doctor_id: userId,
			audit_status: 'approved',
			create_time: db.command.gte(new Date(startTime)).lte(new Date(endTime))
		};
		console.log('已结算金额查询条件:', JSON.stringify(settledMatchCondition));

		const settledAmountRes = await db.collection('orders').aggregate()
			.match(settledMatchCondition)
			.group({
				_id: null,
				total: $.sum('$total_price')
			})
			.end();
		console.log('已结算金额查询结果:', JSON.stringify(settledAmountRes));

		// 3. 查询销售额
		const salesMatchCondition = {
			doctor_id: userId,
			status: 'paid',
			create_time: db.command.gte(new Date(startTime)).lte(new Date(endTime))
		};
		console.log('销售额查询条件:', JSON.stringify(salesMatchCondition));

		const salesAmountRes = await db.collection('orders').aggregate()
			.match(salesMatchCondition)
			.group({
				_id: null,
				total: $.sum('$total_price'),
				count: $.sum(1)
			})
			.end();
		console.log('销售额查询结果:', JSON.stringify(salesAmountRes));

		// 4. 查询用户账户信息
		console.log('用户ID查询:', userId);
		const userRes = await db.collection('users').where({
			user_id: userId
		}).get();
		console.log('用户信息查询结果:', JSON.stringify(userRes));

		// 安全处理聚合查询结果
		const safeGet = (res, field) => {
			return (res.data && res.data[0]) ? res.data[0][field] : 0;
		};

		const result = {
			orderCount: safeGet(salesAmountRes, 'count'),
			salesAmount: safeGet(salesAmountRes, 'total'),
			pendingAmount: safeGet(pendingAmountRes, 'total'),
			settledAmount: safeGet(settledAmountRes, 'total'),
			accountInfo: userRes.data?.accountInfo || {}
		};
		console.log('最终返回结果:', JSON.stringify(result));

		return {
			code: 200,
			data: result
		};
	} catch (e) {
		console.error('查询失败:', e);
		return {
			code: 500,
			msg: '查询失败',
			error: e.message
		};
	}
};