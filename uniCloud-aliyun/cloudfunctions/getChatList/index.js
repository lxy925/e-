'use strict';
const jwt = require('./jwt.js');
const db = uniCloud.database();

exports.main = async (event, context) => {
	try {
		const {
			currentUser
		} = event;

		if (!currentUser) {
			return {
				code: 400,
				msg: '用户信息不能为空'
			};
		}
		let user_id = jwt.verifyToken(event.currentUser.user_id).userId;
		// 查询订单
		const orderCollection = db.collection('orders');
		const query = {
			$or: [{
					status: 'paid'
				},
				{
					status: '已确认'
				}
			],
			$or: [{
					user_id: user_id
				},
				{
					doctor_id: user_id
				}
			]
		};

		const {
			data: orders
		} = await orderCollection.where(query).get();

		if (!orders || orders.length === 0) {
			return {
				code: 200,
				data: []
			};
		}

		const partners = new Set(); // 使用Set去重
		console.log("orders", orders);
		for (const order of orders) {
			let partnerId, partnerType;

			if (currentUser.type === '普通用户') {
				// 当前用户是普通用户，获取陪诊师信息
				partnerId = order.doctor_id;
				partnerType = '陪诊师';
			} else {
				// 当前用户是陪诊师，获取普通用户信息
				partnerId = order.user_id;
				partnerType = '普通用户';
			}

			// 获取聊天对象信息
			let collection;
			if (partnerType === '陪诊师') {
				collection = db.collection('escorts');
			} else {
				collection = db.collection('users');
			}

			const {
				data: partnerData
			} = await collection.where({user_id:partnerId}).get();

			if (partnerData && partnerData.length > 0) {
				const partner = partnerData[0];
				const partnerInfo = {
					user_id: partner.user_id,
					name: partner.realName || partner.name || '未知用户',
					avatar: partner.avatarUrl || partner.avatar || '/static/service-default.png',
					type: partnerType
				};
				partners.add(JSON.stringify(partnerInfo));
			}
		}

		// 将Set转换为数组
		const chatPartners = Array.from(partners).map(item => JSON.parse(item));
		console.log("chatPartners", chatPartners);
		return {
			code: 200,
			data: chatPartners
		};

	} catch (e) {
		console.error('获取聊天列表失败:', e);
		return {
			code: 500,
			msg: '获取聊天列表失败'
		};
	}
};