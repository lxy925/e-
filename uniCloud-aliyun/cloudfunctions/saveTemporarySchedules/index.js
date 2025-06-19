'use strict';
const jwt = require('./jwt.js');
exports.main = async (event, context) => {
	try {
		const db = uniCloud.database()
		let user_id = jwt.verifyToken(event.user_id).userId;
		const tempData = event.tempData
		// 获取本周一的日期
		const currentDate = new Date()
		const dayOfWeek = currentDate.getDay() || 7
		const monday = new Date(currentDate)
		monday.setDate(currentDate.getDate() - (dayOfWeek - 1))
		monday.setHours(0, 0, 0, 0)
		const weekStartTimestamp = monday.getTime()




		// 如果有数据则插入
		if (tempData && tempData.length > 0) {
			const countRes = await db.collection('time_temporary')
				.where({
					user_id
				})
				.count();
			if (countRes.total > 0) {
				// 已有数据，执行更新操作
				// 先删除该用户的所有旧数据
				await db.collection('time_temporary')
					.where({
						user_id
					})
					.update({
						tempData
					});



				return {
					code: 200,
					message: '更新成功',

				};
			} else {
				// 没有数据，直接插入
				const addRes = await db.collection('time_temporary')
					.add({
						user_id,
						tempData
					});

				return {
					code: 200,
					message: '新增成功',

				};
			}
		}else{
			return{
				code: 200,
				message: '没有新增',
				error: err
			}
		}

	} catch (err) {
		return {
			code: 500,
			message: '保存失败',
			error: err
		}
	}
};