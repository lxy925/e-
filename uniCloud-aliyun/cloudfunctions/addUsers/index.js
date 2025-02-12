'use strict';
exports.main = async (event, context) => {
	const db = uniCloud.database();
	const {
		phone,
		idNumber,
		avatarUrl,
		realName,
		ID,
		nickName
	} = event;
	console.log("传入的参数phone:", phone)
	try {
		const result = await db.collection('users').add({
			user_id: ID,
			name: realName,
			nickName: nickName,
			type: "普通用户",
			phone: phone,
			idNumber: idNumber,

			avatar: avatarUrl


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