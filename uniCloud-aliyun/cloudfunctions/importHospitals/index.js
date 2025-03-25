'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
	const collection = db.collection('hospitals');
	
	// 这里直接处理你的医院数据
	const hospitalsData = event.data; // 从客户端传入的数据
	
	try {
		// 批量插入数据
		const result = await collection.add(hospitalsData);
		return {
			code: 0,
			msg: '数据导入成功',
			data: result
		}
	} catch (err) {
		return {
			code: -1,
			msg: '数据导入失败',
			error: err
		}
	}
};