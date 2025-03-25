'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	const { doctorId,subordinateId } = event;
	try {
		const result = await db.collection('escort_relation').add({
			doctorId: doctorId,
			subordinateId: subordinateId
	
	
		});
		console.log('Insert result:', result);
		return {
			code: 200,
			message: '数据提交成功',
			data: result,
		};
	} catch (err) {
		return {
			code: 500,
			message: '数据提交失败',
			error: err,
		};
	}
	
};
