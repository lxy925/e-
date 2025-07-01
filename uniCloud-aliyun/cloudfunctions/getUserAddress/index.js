// cloudfunctions/getUserAddresses/index.js
const db = uniCloud.database();
const userAddressCollection = db.collection('user_address');

exports.main = async (event, context) => {
	try {
		const {
			userId
		} = event;
		if (!userId) {
			return {
				code: 400,
				message: '缺少用户ID'
			};
		}

		const res = await userAddressCollection
			.where({
				userId
			})
			.orderBy('isDefault', 'desc')
			.orderBy('createTime', 'desc')
			.get();

		return {
			code: 200,
			message: '获取地址列表成功',
			data: res.data
		};
	} catch (error) {
		console.error('获取用户地址列表失败:', error);
		return {
			code: 500,
			message: '服务器错误，获取地址失败'
		};
	}
};