const db = uniCloud.database();
const https = require('https'); // 用于调用微信接口

exports.main = async (event) => {
	console.log('收到订单创建请求:', event);

	try {
		// 参数验证
		// 检查event对象是否存在
		if (!event) {
			return {
				code: 400,
				message: '未接收到请求参数'
			};
		}
		// 检查total_price是否存在
		if (event.total_price === undefined) {
			console.error('event对象结构:', Object.keys(event));
			return {
				code: 400,
				message: '参数错误: total_price未定义'
			};
		}

		// 验证total_price是数字
		const total_price = Number(event.total_price);
		if (isNaN(total_price)) {
			return {
				code: 400,
				message: '参数错误: total_price必须是数字'
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
								// 继续执行订单创建逻辑
								resolve(createOrder(event, openid));
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

		// 3. 如果已获取到 OpenID，继续执行订单创建逻辑
		const orderResult = await createOrder(event, openid);
		return orderResult;

	} catch (error) {
		console.error('[订单创建错误]', error);
		return {
			code: 500,
			message: error.message || '服务器异常，请稍后重试'
		};
	}
};

// 订单创建逻辑封装函数
async function createOrder(event, openid) {
	// 生成唯一订单号
	const timestamp = Date.now();
	const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
	const order_no = `ORD${timestamp}${random}`;


	// 构建订单数据
	const orderData = {
		patient_name: event.patient_name,
		patient_phone: event.patient_phone,
		doctor_id: event.doctor_id,
		order_no,
		out_trade_no: order_no,
		user_id: openid,
		total_price: Number(event.total_price), // 确保转换为数字
		status: 'unpaid',
		create_time: new Date(),
		expire_time: new Date(timestamp + 15 * 60 * 1000),
		service_id: event.service_id,
		// service_info: event.service_info
	};

	console.log('准备插入订单数据:', orderData);

	// 插入订单到数据库
	const result = await db.collection('orders').add(orderData);

	console.log('订单创建成功:', result);

	return {
		code: 200,
		data: {
			order_no,
			out_trade_no: order_no,
			total_price: event.total_price,
			order_id: result.id,
			openid: openid,
			expire_time: orderData.expire_time.toISOString(),
			doctor_id: event.doctor_id,
			patient_name: event.patient_name,
			patient_phone: event.patient_phone,
		},
		message: '订单创建成功'
	};
}