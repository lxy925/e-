'use strict';


exports.main = async (event, context) => {
	// event为客户端上传的参数
	console.log('event : ', event);

	// 获取传入的参数
	const {
		user_id,
		
		is_bookable
	} = event;

	// 检查参数是否存在
	

	try {
		// 获取数据库引用
		const db = uniCloud.database();
		
		// 更新表 users 中 user_id 相同的记录的 type 字段
	
			const updateResult = await db.collection('escorts').where({
				user_id: user_id
			}).update({
			
			
				is_bookable: is_bookable
			
			});
			
		
		
		// 检查更新是否成功
		if (updateResult.matchedCount === 0) {
			return {
				success: false,
				message: '未找到匹配的记录'
			};
		} else {
			return {
				success: true,
				message: '更新成功',
				updatedCount: updateResult.modifiedCount
			};
		}
	} catch (error) {
		console.error('更新失败：', error);
		return {
			success: false,
			message: '更新失败，服务器错误',
			error: error
		};
	}
};