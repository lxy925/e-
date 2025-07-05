'use strict';
const db = uniCloud.database();
const messageCollection = db.collection('messages');
const userCollection = db.collection('users');
const escortCollection = db.collection('escorts');
const jwt = require('./jwt.js');
// 缓存用户类型判断结果
const userTypeCache = new Map();

exports.main = async (event, context) => {
	const {
		action,
		data
	} = event;
console.log("data",data)
	try {
		// // 1. 验证主token
		// let decoded = jwt.verifyToken(data.userId);
		// let data.userId = decoded.userId;
		
		// if (!data._id) {
		//   return { code: 403, msg: 'Token无效' };
		// }
		switch (action) {
			case 'getMessages':
				return await getMessages(data);
			case 'loadMoreMessages':
				return await loadMoreMessages(data);
			case 'sendMessage':
				return await sendMessage(data);
			case 'startMessageListener':
				return await startMessageListener(data);
			default:
				return {
					code: 400, msg: '未知的操作类型'
				};
		}
	} catch (e) {
		console.error('操作失败:', e);
		return {
			code: 500,
			msg: e.message || '操作失败'
		};
	}
};


async function getUserType(userId) {
	if (userTypeCache.has(userId)) {
		return userTypeCache.get(userId);
	}

	const [userResult, escortResult] = await Promise.all([
		userCollection.doc(userId).get(),
		escortCollection.doc(userId).get()
	]);

	let userType;
	if (userResult.data) userType = 'user';
	else if (escortResult.data) userType = 'escort';
	else throw new Error('用户ID不存在');

	userTypeCache.set(userId, userType);
	return userType;
}

async function validateAndNormalizeIds(data) {
	const {
		userId,
		chatPartnerId,
		sender_type
	} = data;

	console.log('开始验证用户类型，sender_type:', sender_type);
	console.log('原始ID:', {
		userId,
		chatPartnerId
	});

	// 根据sender_type确定发送者和接收者类型
	const receiver_type = sender_type === '普通用户' ? '陪诊师' : '普通用户';

	try {
		// 获取真实的user_id和escort_id
		let realUserId, realEscortId;

		if (sender_type === '普通用户') {
			// 发送者是普通用户，接收者是陪诊师
			[realUserId, realEscortId] = await Promise.all([
				getRealUserId(userId).catch(e => {
					throw new Error(`获取用户ID失败: ${e.message}`)
				}),
				getRealEscortId(chatPartnerId).catch(e => {
					throw new Error(`获取陪诊师ID失败: ${e.message}`)
				})
			]);
		} else {
			// 发送者是陪诊师，接收者是普通用户
			[realUserId, realEscortId] = await Promise.all([
				getRealUserId(chatPartnerId).catch(e => {
					throw new Error(`获取用户ID失败: ${e.message}`)
				}),
				getRealEscortId(userId).catch(e => {
					throw new Error(`获取陪诊师ID失败: ${e.message}`)
				})
			]);
		}

		// 验证ID是否有效
		if (!realUserId || !realEscortId) {
			throw new Error(`获取的ID无效: user_id=${realUserId}, escort_id=${realEscortId}`);
		}

		console.log('标准化后的ID:', {
			user_id: realUserId,
			escort_id: realEscortId,
			sender_type,
			receiver_type
		});

		return {
			user_id: realUserId,
			escort_id: realEscortId,
			sender_type,
			receiver_type,
			sender_raw_id: userId
		};
	} catch (e) {
		console.error('验证标准化ID时出错:', e);
		throw e; // 重新抛出错误
	}
}

async function getRealUserId(_id) {
	if (!_id || typeof _id !== 'string') {
		console.error('无效的用户ID:', _id);
		throw new Error('无效的用户ID');
	}

	const res = await userCollection.doc(_id).get();
	if (!res.data) {
		console.error('用户不存在:', _id);
		throw new Error('用户不存在');
	}

	const userData = res.data[0]; // 获取数组第一个元素
	console.log('用户文档数据:', userData);

	// 返回 user_id 或 _id
	return userData.user_id
}

async function getRealEscortId(_id) {
	if (!_id || typeof _id !== 'string') {
		console.error('无效的陪诊师ID:', _id);
		throw new Error('无效的陪诊师ID');
	}
	console.log('查询陪诊师真实ID:', _id);
	const res = await userCollection.doc(_id).get();
	if (!res.data) {
		console.error('陪诊师不存在:', _id);
		throw new Error('陪诊师不存在');
	}
	console.log('获取到陪诊师数据:', res.data);
	const escortData = res.data[0]; // 获取数组第一个元素
	console.log('陪诊师文档数据:', escortData);

	// 返回 escort_id 或 _id
	return escortData.user_id
}

async function getMessages(data) {
	const {
		userId,
		chatPartnerId,
		pageSize,
		sender_type
	} = data;

	// 确保传入完整的data对象
	const normalized = await validateAndNormalizeIds({
		userId,
		chatPartnerId,
		sender_type: sender_type
	});

	const {
		data: messages
	} = await messageCollection
		.where({
			user_id: normalized.user_id,
			escort_id: normalized.escort_id
		})
		.orderBy('time', 'desc')
		.limit(pageSize)
		.get();

	return {
		code: 200,
		data: messages.reverse()
	};
}



async function loadMoreMessages(data) {
	const {
		userId,
		chatPartnerId,
		lastMessageTime,
		pageSize,
		sender_type
	} = data;

	const normalized = await validateAndNormalizeIds({
		userId,
		chatPartnerId,
		sender_type: sender_type
	});

	const {
		data: messages
	} = await messageCollection
		.where({
			user_id: normalized.user_id,
			escort_id: normalized.escort_id,
			time: db.command.lt(lastMessageTime)
		})
		.orderBy('time', 'desc')
		.limit(pageSize)
		.get();

	return {
		code: 200,
		data: messages.reverse()
	};
}

async function sendMessage(data) {
	const {
		content,
		message_type,
		userId,
		chatPartnerId,
	} = data;

	// 验证并标准化ID（现在传入整个data对象）
	const normalized = await validateAndNormalizeIds(data);

	const message = {
		user_id: normalized.user_id, // 来自user表的真实user_id
		escort_id: normalized.escort_id, // 来自escort表的真实escort_id
		sender_raw_id: data.userId, // 原始发送者_id
		sender_type: normalized.sender_type,
		receiver_type: normalized.receiver_type,
		content,
		message_type: message_type || 'text',
		time: Date.now(),
		status: 'sent'
	};

	console.log('准备存储的消息:', message);

	const addResult = await messageCollection.add(message);
	console.log('数据库添加结果:', addResult);
	return {
	        code: 200,
	        data: {
	            id: addResult.id,  // 直接使用addResult.id
	            ...message
	        }
	    };
}

async function startMessageListener(data) {
	const {
		userId,
		chatPartnerId,
		sender_type
	} = data;

	const normalized = await validateAndNormalizeIds({
		userId,
		chatPartnerId,
		sender_type: sender_type
	});

	const {
		data: messages
	} = await messageCollection
		.where({
			user_id: normalized.user_id,
			escort_id: normalized.escort_id
		})
		.orderBy('time', 'desc')
		.limit(20)
		.get();

	return {
		code: 200,
		data: messages
	};
}