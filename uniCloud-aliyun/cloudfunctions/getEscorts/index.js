'use strict';
const db = uniCloud.database();
const _ = db.command;

exports.main = async (event, context) => {
	console.log('event', event)
	const {
		timeObj,
		isFromOrder,
		searchKeyword,
		startTime, // 查询的服务开始时间（ISO字符串）
		endTime, // 查询的服务结束时间（ISO字符串）
		page = 1, // 新增：当前页码，默认第1页
		pageSize = 10 // 新增：每页条数，默认10条
	} = event;
	// 计算分页偏移量
	const skip = (page - 1) * pageSize;

	const currentDate = new Date();
	const currentWeekStart = getWeekStartDate(currentDate);

	try {
		console.log('开始获取陪诊师数据（分页：第' + page + '页）');
		// 1. 构建基础查询条件（关联陪诊师详情）
			let query = db.collection('escorts').aggregate()
					.lookup({
						from: 'escorts_more',
						localField: 'user_id',
						foreignField: 'user_id',
						as: 'moreInfo'
					})
					.unwind('$moreInfo')
				// 仅当从订单页面进入时，才筛选已认证的陪诊师
				if (isFromOrder) {
					query = query.match({
						is_certified: true
					});
					console.log("从订单页面进入，仅显示已认证陪诊师");
				}
				query = query.skip(skip).limit(safePageSize);
		
				// 2. 添加姓名搜索条件（如果有搜索关键词）
				if (searchKeyword && searchKeyword.trim()) {
					query = query.match({
						name: new RegExp(searchKeyword, 'i') // 不区分大小写的模糊搜索
					});
				}
		// 3. 如果不是从order页面进入，直接返回所有陪诊师
		if (!isFromOrder) {
			const escortsRes = await query.end();
			console.log("按名字查询", escortsRes)
			return {
				success: true,
				data: escortsRes.data.sort((a, b) => b.moreInfo.rating - a.moreInfo.rating)
			};
		}

		// 4. 从order页面进入的逻辑（按时间筛选）
		// 4.1 先获取符合条件的陪诊师基础数据（分页）
		const escortsRes = await query.end();
		if (!escortsRes.data || escortsRes.data.length === 0) {
			return {
				success: true,
				data: [],
				msg: "没找到陪诊师"
			};
		}
		// 4.2 提取陪诊师ID列表
		const escortIds = escortsRes.data.map(escort => escort.user_id);

		// 4.3 处理星期和时间段
		console.log("timeObj", timeObj)
		const dayOfWeek = timeObj < 7 ? timeObj + 1 : (timeObj - 6);
		const timePeriod = timeObj < 7 ? 1 : 2;
		console.log("星期/时间段：", dayOfWeek, timePeriod);

		// 4.4 查询临时安排
		const tempRes = await db.collection('time_temporary')
			.where({
				user_id: db.command.in(escortIds),

			})
			.get();

		// 4.5 查询长期安排
		const longTermRes = await db.collection('time_base')
			.where({
				user_id: db.command.in(escortIds)
			})
			.get();

		// 4.6 筛选可用陪诊师
		let availableEscortIds = new Set();
		console.log("tempRes", tempRes)

		// 处理临时安排
		tempRes.data.forEach(tempRecord => {
			const matchedTempData = tempRecord.tempData.find(item =>
				item.day_of_week === dayOfWeek &&
				item.time_period === timePeriod
			);
			console.log("找到的第一个matchedTempData", matchedTempData)
			if (matchedTempData && matchedTempData.status === 1) {
				availableEscortIds.add(tempRecord.user_id);
			}
		});
		console.log("availableEscortIds", availableEscortIds)
		console.log("longTermRes", longTermRes)

		// 处理长期安排（只处理没有临时安排的陪诊师）
		const escortsWithoutTemp = escortIds.filter(id => !availableEscortIds.has(id));
		longTermRes.data.forEach(longTermRecord => {
			if (!escortsWithoutTemp.includes(longTermRecord.user_id)) return;

			const matchedLongTermData = longTermRecord.longTermData.find(item =>
				item.day_of_week === dayOfWeek &&
				item.time_period === timePeriod
			);

			if (matchedLongTermData && matchedLongTermData.status === 1) {
				availableEscortIds.add(longTermRecord.user_id);
			}
		});

		// #################### 新增逻辑：排除已有订单的陪诊师 ####################
		// 5.1 校验时间参数
		if (!startTime || !endTime) {
			return {
				success: false,
				msg: "缺少 startTime 或 endTime 参数"
			};
		}
		// 将时间字符串转为Date对象（用于比较）
		const queryStart = new Date(startTime);
		const queryEnd = new Date(endTime);
		if (isNaN(queryStart.getTime()) || isNaN(queryEnd.getTime())) {
			return {
				success: false,
				msg: "startTime 或 endTime 格式错误"
			};
		}

		console.log("5.1 待查询的时间范围：", {
			startTime: queryStart.toISOString(),
			endTime: queryEnd.toISOString()
		});

		// 5.2 查询可用陪诊师在[startTime, endTime]范围内的有效订单
		console.log("5.2 待查询冲突的陪诊师ID：", [...availableEscortIds]);
		const conflictingOrders = await db.collection('orders') // 订单集合名，需与实际一致
			.where({
				doctor_id: _.in([...availableEscortIds]), // 只查可用陪诊师的订单
				status: _.neq('cancelled'), // 排除已取消的订单
				// 核心：订单时段与查询时段有重叠
				service_start_time: _.lt(endTime), // 订单开始 < 查询结束
				service_end_time: _.gt(startTime) // 订单结束 > 查询开始
			})
			.field({
				doctor_id: 1
			}) // 只返回陪诊师ID，提升查询效率
			.get();
		console.log("5.2 冲突订单查询结果：", conflictingOrders.data);

		// 5.3 提取有冲突的陪诊师ID（需要排除）
		const conflictingIds = new Set(
			conflictingOrders.data.map(order => order.doctor_id)
		);
		console.log("5.3 有冲突的陪诊师ID：", [...conflictingIds]);
		// 5.4 最终可用陪诊师：排除有冲突订单的ID
		const finallyAvailableIds = [...availableEscortIds].filter(id => !conflictingIds.has(id));
		console.log("5.4 排除冲突后最终可用ID：", finallyAvailableIds);
		availableEscortIds = new Set(finallyAvailableIds);

		// 6. 筛选出符合条件的陪诊师
		const availableEscorts = escortsRes.data.filter(escort =>
				availableEscortIds.has(escort.user_id))
			.sort((a, b) => b.moreInfo.rating - a.moreInfo.rating);

		console.log("6. 最终返回的陪诊师列表：", availableEscorts.map(e => e.user_id)); // 新增日志
		return {
			success: true,
			data: availableEscorts,
			total: availableEscorts.length
		};
	} catch (e) {
		console.error('错误：', e);
		return {
			code: -1,
			msg: e.message || '获取陪诊师集合失败'
		};
	}
};

function getWeekStartDate(date) {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? -6 : 1);
	return new Date(d.setDate(diff)).setHours(0, 0, 0, 0);
}