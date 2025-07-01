// cloudfunctions/getUserAddresses/index.js
const db = uniCloud.database();
const https = require('https'); // 用于调用微信接口

exports.main = async (event) => {
	console.log('收到获取地址列表请求:', event);

	try {
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
								// 继续执行获取地址列表逻辑
								resolve(fetchAddresses(openid));
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

		// 3. 如果已获取到 OpenID，继续执行获取地址列表逻辑
		const addressResult = await fetchAddresses(openid);
		return addressResult;

	} catch (error) {
		console.error('[获取地址列表错误]', error);
		return {
			code: 500,
			message: error.message || '服务器异常，请稍后重试'
		};
	}
};

// 获取地址列表逻辑封装函数
async function fetchAddresses(openid) {
	console.log('准备获取用户地址列表，openid:', openid);

	const res = await db.collection('user_address')
		.where({
			user_id: openid // 使用 openid 作为用户标识
		})
		.orderBy('isDefault', 'desc') // 默认地址排在前面
		.orderBy('createTime', 'desc') // 最新创建的排在前面
		.get();

	console.log('获取地址列表成功，数量:', res.data.length);

	return {
		code: 200,
		message: '获取地址列表成功',
		data: res.data
	};
}