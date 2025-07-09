// cloudfunctions/updateUserAddress/index.js
const db = uniCloud.database();
const https = require('https'); // 用于调用微信接口

exports.main = async (event) => {
	console.log('收到更新地址请求:', event);

	try {
		// 参数验证
		if (!event || !event.address) {
			return {
				code: 400,
				message: '未接收到请求参数'
			};
		}

		const {
			_id,
			...addressData
		} = event.address;
		if (!_id) {
			return {
				code: 400,
				message: '缺少地址ID'
			};
		}

		// 从环境变量获取敏感信息（避免硬编码）
		const appid = 'wxf8afb6dce14d487a';
		const secret = '06d3e5f2f7ed1bf8504fe90a1a1e04e5';

		let openid;

		// 1. 优先尝试从 uniCloud 内置认证获取 OpenID
		if (event.wxContext && event.wxContext.OPENID) {
			openid = event.wxContext.OPENID;
		}
		// 2. 如果未启用认证或 wxContext 不存在，尝试通过 js_code 获取 OpenID
		else if (event.js_code) {
			if (!appid || !secret) {
				return {
					code: 500,
					message: '未配置微信 AppID 或 Secret'
				};
			}

			// 构造微信接口请求 URL
			const url =
				`https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${event.js_code}&grant_type=authorization_code`;

			return new Promise((resolve, reject) => {
				https.get(url, (res) => {
					let data = '';
					res.on('data', (chunk) => {
						data += chunk;
					});
					res.on('end', () => {
						try {
							const result = JSON.parse(data);
							if (result.openid) {
								openid = result.openid;
								// 继续执行地址更新逻辑
								resolve(updateAddress(_id, addressData, openid));
							} else {
								reject({
									code: 401,
									message: result.errmsg || '获取 OpenID 失败'
								});
							}
						} catch (e) {
							reject(e);
						}
					});
				}).on('error', (err) => {
					reject({
						code: 500,
						message: '请求微信接口失败',
						error: err.message
					});
				});
			});
		} else {
			return {
				code: 401,
				message: '未获取到用户身份，请重新登录'
			};
		}

		// 3. 如果已获取到 OpenID，继续执行地址更新逻辑
		const updateResult = await updateAddress(_id, addressData, openid);
		return updateResult;

	} catch (error) {
		console.error('[地址更新错误]', error);
		return {
			code: 500,
			message: error.message || '服务器异常，请稍后重试'
		};
	}
};

// 地址更新逻辑封装函数
async function updateAddress(addressId, addressData, openid) {
	// 检查地址是否存在且属于当前用户
	const address = await db.collection('user_address')
		.where({
			_id: addressId,
			user_id: openid
		})
		.get();

	if (!address.data || address.data.length === 0) {
		return {
			code: 404,
			message: '未找到该地址或无权限修改'
		};
	}

	// 更新地址数据
	const updateData = {
		...addressData,
		updateTime: new Date()
	};

	console.log('准备更新地址数据:', updateData);

	const result = await db.collection('user_address')
		.doc(addressId)
		.update(updateData);

	console.log('地址更新结果:', result);

	if (result.updated > 0) {
		// 如果设置为默认地址，更新其他地址
		if (updateData.isDefault === true) {
			await setDefaultAddress(openid, addressId);
		}

		return {
			code: 200,
			message: '地址更新成功',
			data: {
				address_id: addressId,
				...updateData
			}
		};
	} else {
		return {
			code: 404,
			message: '未找到该地址或更新失败'
		};
	}
}

// 设置默认地址函数
async function setDefaultAddress(openid, addressId) {
	try {
		const _ = db.command;

		// 将该用户的所有其他地址设为非默认
		await db.collection('user_address')
			.where({
				user_id: openid,
				_id: _.neq(addressId)
			})
			.update({
				isDefault: false
			});

		console.log('已将其他地址设为非默认');
	} catch (error) {
		console.error('设置默认地址失败:', error);
		// 忽略错误，不影响主流程
	}
}