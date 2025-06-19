'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
	try {
		const { currentUser } = event;
		
		if (!currentUser) {
			return {
				code: 400,
				msg: '用户信息不能为空'
			};
		}

		// 查询订单
		const orderCollection = db.collection('order');
		const query = {
			$or: [
				{ order_status: '已完成' },
				{ order_status: '已确认' }
			],
			$or: [
				{ user_id: currentUser._id },
				{ escort_id: currentUser._id }
			]
		};
		
		const { data: orders } = await orderCollection.where(query).get();
		
		if (!orders || orders.length === 0) {
			return {
				code: 200,
				data: []
			};
		}

		const partners = new Set(); // 使用Set去重
		
		for (const order of orders) {
			let partnerId, partnerType;
			
			if (currentUser.type === '普通用户') {
				// 当前用户是普通用户，获取陪诊师信息
				partnerId = order.escort_id;
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
			
			const { data: partnerData } = await collection.doc(partnerId).get();
			
			if (partnerData && partnerData.length > 0) {
				const partner = partnerData[0];
				const partnerInfo = {
					_id: partner._id,
					name: partner.realName || partner.name || '未知用户',
					avatar: partner.avatarUrl || partner.avatar || '/static/service-default.png',
					type: partnerType
				};
				partners.add(JSON.stringify(partnerInfo));
			}
		}
		
		// 将Set转换为数组
		const chatPartners = Array.from(partners).map(item => JSON.parse(item));
		
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
			     
				
