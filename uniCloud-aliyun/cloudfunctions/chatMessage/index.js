'use strict';
const db = uniCloud.database();
const messageCollection = db.collection('messages');

exports.main = async (event, context) => {
	const { action, data } = event;
	
	try {
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
					code: 400,
					msg: '未知的操作类型'
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

// 获取消息列表
async function getMessages(data) {
	const { userId, chatPartnerId, pageSize } = data;
	
	const { data: messages } = await messageCollection
		.where({
			$or: [
				{ user_id: userId, escort_id: chatPartnerId },
				{ user_id: chatPartnerId, escort_id: userId }
			]
		})
		.orderBy('time', 'desc')
		.limit(pageSize)
		.get();
		
	return {
		code: 200,
		data: messages.reverse()
	};
}

// 加载更多历史消息
async function loadMoreMessages(data) {
	const { userId, chatPartnerId, lastMessageTime, pageSize } = data;
	
	const { data: messages } = await messageCollection
		.where({
			$or: [
				{ user_id: userId, escort_id: chatPartnerId },
				{ user_id: chatPartnerId, escort_id: userId }
			],
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

// 发送消息
async function sendMessage(data) {
	const { result } = await messageCollection.add(data);
	return {
		code: 200,
		data: result
	};
}

// 开始监听消息
async function startMessageListener(data) {
	const { userId, chatPartnerId } = data;
	
	const query = {
		$or: [
			{ user_id: userId, escort_id: chatPartnerId },
			{ user_id: chatPartnerId, escort_id: userId }
		]
	};
	
	const { data: messages } = await messageCollection
		.where(query)
		.orderBy('time', 'desc')
		.limit(20)
		.get();
		
	return {
		code: 200,
		data: messages
	};
} 