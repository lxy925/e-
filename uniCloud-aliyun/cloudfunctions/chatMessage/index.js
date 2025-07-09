'use strict';
const db = uniCloud.database();
const messageCollection = db.collection('messages');
const userCollection = db.collection('users');
const orderCollection = db.collection('orders');

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
        return { code: 400, msg: '未知的操作类型' };
    }
  } catch (e) {
    console.error('操作失败:', e);
    return { code: 500, msg: e.message || '操作失败' };
  }
};

// 获取聊天对象user_id（普通用户查doctor_id，陪诊师查user_id）
async function getChatPartnerUserId(currentUserId, sender_type) {
  let orderQuery = {};
  if (sender_type === '普通用户') {
    orderQuery = { user_id: currentUserId, status: db.command.in(['paid', '已确认']) };
  } else {
    orderQuery = { doctor_id: currentUserId, status: db.command.in(['paid', '已确认']) };
  }
  const { data: orders } = await orderCollection.where(orderQuery).get();
  if (!orders || orders.length === 0) throw new Error('未找到有效订单');
  // 取第一个订单的聊天对象id
  if (sender_type === '普通用户') {
    return orders[0].doctor_id;
  } else {
    return orders[0].user_id;
  }
}

// 获取用户详细信息
async function getUserInfo(user_id) {
  const { data } = await userCollection.where({ user_id }).get();
  if (!data || data.length === 0) throw new Error('未找到用户信息');
  return data[0];
}

// 标准化消息双方id
async function normalizeUserAndEscortId({ userId, sender_type, chatPartnerId }) {
  // userId: 当前用户user_id
  // chatPartnerId: 聊天对象user_id
  let user_id, escort_id;
  if (sender_type === '普通用户') {
    user_id = userId;
    escort_id = chatPartnerId;
  } else {
    user_id = chatPartnerId;
    escort_id = userId;
  }
  return { user_id, escort_id };
}

async function getMessages(data) {
  const { userId, sender_type } = data;
  // 获取聊天对象id
  const chatPartnerId = data.chatPartnerId || await getChatPartnerUserId(userId, sender_type);
  const { user_id, escort_id } = await normalizeUserAndEscortId({ userId, sender_type, chatPartnerId });
  const { data: messages } = await messageCollection
    .where({ user_id, escort_id })
    .orderBy('time', 'desc')
    .limit(data.pageSize || 20)
    .get();
  return { code: 200, data: messages.reverse() };
}

async function loadMoreMessages(data) {
  const { userId, sender_type, lastMessageTime } = data;
  const chatPartnerId = data.chatPartnerId || await getChatPartnerUserId(userId, sender_type);
  const { user_id, escort_id } = await normalizeUserAndEscortId({ userId, sender_type, chatPartnerId });
  const { data: messages } = await messageCollection
    .where({ user_id, escort_id, time: db.command.lt(lastMessageTime) })
    .orderBy('time', 'desc')
    .limit(data.pageSize || 20)
    .get();
  return { code: 200, data: messages.reverse() };
}

async function sendMessage(data) {
  const { userId, sender_type, chatPartnerId, content, message_type } = data;
  const { user_id, escort_id } = await normalizeUserAndEscortId({ userId, sender_type, chatPartnerId });
  const message = {
    user_id,
    escort_id,
    sender_type,
    receiver_type: sender_type === '普通用户' ? '陪诊师' : '普通用户',
    content,
    message_type: message_type || 'text',
    time: Date.now().toString(),
    status: 'sent'
  };
  const addResult = await messageCollection.add(message);
  return { code: 200, data: { id: addResult.id, ...message } };
}

async function startMessageListener(data) {
  // 仅返回最新20条
  return await getMessages(data);
}