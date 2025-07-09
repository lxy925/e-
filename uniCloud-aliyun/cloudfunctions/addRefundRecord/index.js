// 云函数入口文件
const db = uniCloud.database();

exports.main = async (event, context) => {
	const collection = db.collection('refund');

	try {
		// 插入数据
		const res = await collection.add(event.refundData);

		return {
			code: 200,
			message: '退款记录创建成功',
			data: res
		};
	} catch (e) {
		return {
			code: 500,
			message: '服务器错误：' + e.message
		};
	}
};