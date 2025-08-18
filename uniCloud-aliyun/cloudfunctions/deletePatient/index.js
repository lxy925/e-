exports.main = async (event, context) => {
	try {
		const {
			server_id,
			userid
		} = event;
		const db = uniCloud.database();
		const collection = db.collection('server_object');

		// 1. 校验参数
		if (!server_id || !userid) {
			return {
				code: 1,
				msg: '参数缺失'
			};
		}

		// 2. 查询就诊人（注意：data是数组）
		const patient = await collection.doc(server_id).get();
		console.error('查询到的就诊人：', patient);
		const patientData = patient.data && patient.data.length > 0 ? patient.data[0] : null;

		// 3. 打印日志验证 userid
		console.error('就诊人userid：', patientData?.userid, '长度：', patientData?.userid?.length);
		console.error('请求userid：', userid, '长度：', userid?.length);

		// 4. 权限校验（修复数组取值 + 处理空白字符）
		const cleanPatientUserId = patientData?.userid?.trim().replace(/\s/g, '');
		const cleanRequestUserId = userid?.trim().replace(/\s/g, '');
		if (!patientData || cleanPatientUserId !== cleanRequestUserId) {
			return {
				code: 2,
				msg: '无权限删除此就诊人'
			};
		}

		// 5. 执行删除
		await collection.doc(server_id).remove();
		return {
			code: 0,
			msg: '删除成功'
		};

	} catch (err) {
		console.error('删除失败：', err);
		return {
			code: 99,
			msg: '服务器错误'
		};
	}
};