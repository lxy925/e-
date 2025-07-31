const db = uniCloud.database();

exports.main = async (event, context) => {
	console.log('收到订单创建请求:', event);

	try {
		// 参数验证（完全保留您原有的验证逻辑）
		if (!event) {
			return {
				code: 400,
				message: '未接收到请求参数'
			};
		}
		if (event.total_price === undefined) {
			console.error('event对象结构:', Object.keys(event));
			return {
				code: 400,
				message: '参数错误: total_price未定义'
			};
		}

		const total_price = Number(event.total_price);
		if (isNaN(total_price)) {
			return {
				code: 400,
				message: '参数错误: total_price必须是数字'
			};
		}

		// 从环境变量获取敏感信息（保持您原有的配置方式）
		const appid = 'wxf8afb6dce14d487a';
		const secret = '06d3e5f2f7ed1bf8504fe90a1a1e04e5';
		let openid;

		// 1. 优先尝试从 uniCloud 内置认证获取 OpenID（保持原有逻辑）
		if (event.wxContext && event.wxContext.OPENID) {
			openid = event.wxContext.OPENID;
		}
		// 2. 通过 js_code 获取 OpenID（仅修改网络请求方式）
		else if (event.js_code) {
			if (!appid || !secret) {
				return {
					code: 500,
					message: '未配置微信 AppID 或 Secret'
				};
			}

			const url =
				`https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${event.js_code}&grant_type=authorization_code`;

			// 使用 uniCloud.httpclient 替代 https（关键修改点）
			const res = await uniCloud.httpclient.request(url, {
				method: 'GET',
				dataType: 'json'
			});

			if (res.status !== 200 || !res.data.openid) {
				throw new Error(res.data.errmsg || '获取 OpenID 失败');
			}
			openid = res.data.openid;
		} else {
			return {
				code: 401,
				message: '未获取到用户身份，请重新登录'
			};
		}

		// 3. 完全保留您原有的订单创建逻辑
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

// 完全保留您原有的 createOrder 函数
async function createOrder(event, openid) {
	const timestamp = Date.now();
	const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
	const order_no = `ORD${timestamp}${random}`;

	let doctor_user_id = null;
	const input_doctor_id = event.doctor_id; // 从event获取的doctor_id
	// 1. 查询 escorts 表，获取陪诊师信息
	if (input_doctor_id && input_doctor_id.trim() !== '') {
		const escortRes = await db.collection('escorts').where({
			user_id: input_doctor_id
		}).get();
		if (!escortRes.data || escortRes.data.length === 0) {
			return {
				code: 404,
				msg: '未找到该陪诊师'
			};
		}
		const escortInfo = escortRes.data[0];
		const doctor_user_id = escortInfo.user_id; // 从数据库获取的user_id
	}

	// 构建订单数据，保持您原有的订单数据结构
	const orderData = {
		service_start_time: event.service_start_time,
		service_end_time: event.service_end_time,
		patient_name: event.patient_name,
		patient_phone: event.patient_phone,
		doctor_id: doctor_user_id,
		order_no,
		out_trade_no: order_no,
		user_id: openid,
		address: event.address,
		total_price: Number(event.total_price),
		status: 'unpaid',
		create_time: new Date(),
		expire_time: new Date(timestamp + 15 * 60 * 1000),
		service_id: event.service_id,
		// 根据需求决定是否保留注释
		service_info: event.service_info || null
	};

	console.log('准备插入订单数据:', orderData);

	const result = await db.collection('orders').add(orderData);
	console.log('订单创建成功:', result);

	// 保持您原有的返回结构
	return {
		code: 200,
		data: {
			order_no,
			out_trade_no: order_no,
			total_price: event.total_price,
			order_id: result.id,
			service_info: event.service_info,
			address: event.address,
			openid: openid,
			expire_time: orderData.expire_time.toISOString(),
			doctor_id: event.doctor_id,
			patient_name: event.patient_name,
			patient_phone: event.patient_phone,
		},
		message: '订单创建成功'
	};
}