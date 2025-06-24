// cloudfunctions/setDefaultAddress/index.js
const db = uniCloud.database();
const userAddressCollection = db.collection('user_address');

exports.main = async (event, context) => {
	try {
		const {
			userId,
			addressId
		} = event;
		if (!userId || !addressId) {
			return {
				code: 400,
				message: '缺少必要参数'
			};
		}

		// 开启事务
		const transaction = await db.startTransaction();

		try {
			// 将该用户的所有地址设为非默认
			await transaction.collection('user_address')
				.where({
					userId
				})
				.update({
					isDefault: false
				});

			// 将指定地址设为默认
			const updateRes = await transaction.collection('user_address')
				.where({
					_id: addressId,
					userId
				})
				.update({
					isDefault: true
				});

			if (updateRes.updated === 0) {
				throw new Error('未找到该地址或无权限修改');
			}

			// 提交事务
			await transaction.commit();

			return {
				code: 200,
				message: '设置默认地址成功'
			};
		} catch (error) {
			// 回滚事务
			await transaction.rollback();
			throw error;
		}
	} catch (error) {
		console.error('设置默认地址失败:', error);
		return {
			code: 500,
			message: '服务器错误，设置默认地址失败'
		};
	}
};