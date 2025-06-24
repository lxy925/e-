const db = uniCloud.database();
const https = require('https'); // 用于调用微信接口

exports.main = async (event) => {
	console.log('收到添加地址请求:', event);

	try {
		// 参数验证
		if (!event || !event.address) {
			return {
				code: 400,
				message: '未接收到地址数据'
			};
		}

		// 从 event.address 获取地址信息
		const addressData = event.address;

		// 验证地址信息完整性
		const requiredFields = ['name', 'phone', 'detail', 'district'];
		for (const field of requiredFields) {
			if (!addressData[field]) {
				return {
					code: 400,
					message: `参数错误: ${field} 不能为空`
				};
			}
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
								// 继续执行地址添加逻辑
								resolve(addAddress(addressData, openid));
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

		// 3. 如果已获取到 OpenID，继续执行地址添加逻辑
		const addressResult = await addAddress(addressData, openid);
		return addressResult;

	} catch (error) {
		console.error('[地址添加错误]', error);
		return {
			code: 500,
			message: error.message || '服务器异常，请稍后重试'
		};
	}
};

// 地址添加逻辑封装函数
async function addAddress(addressData, openid) {
	// 构建最终要存储的地址数据
	const finalAddressData = {
		name: addressData.name,
		phone: addressData.phone,
		detail: addressData.detail,
		district: addressData.district,
		latitude: addressData.latitude || null,
		longitude: addressData.longitude || null,
		isDefault: addressData.isDefault || false,
		createTime: new Date(),
		updateTime: new Date(),
		user_id: openid // 使用 openid 作为用户标识
	};

	console.log('准备插入地址数据:', finalAddressData);

	// 插入地址到数据库
	const result = await db.collection('user_address').add(finalAddressData);

	console.log('地址添加成功，返回结果:', result);

	// 如果设置为默认地址，更新其他地址
	if (finalAddressData.isDefault) {
		await setDefaultAddress(openid, result.id);
	}

	return {
		code: 200,
		data: {
			address_id: result.id,
			...finalAddressData
		},
		message: '地址添加成功'
	};
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