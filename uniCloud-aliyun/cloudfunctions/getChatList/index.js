'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
  try {
    const { currentUser } = event;
    if (!currentUser || !currentUser.user_id) {
      return {
        code: 400,
        msg: '用户信息不能为空'
      };
    }
    const user_id = currentUser.user_id;
    const user_type = currentUser.type;

    // 构建查询条件
    let orderQuery = {};
    if (user_type === '普通用户') {
      orderQuery = { user_id };
    } else {
      orderQuery = { doctor_id: user_id };
    }

    // 只查有效订单
    orderQuery.status = db.command.in(['paid', '已确认']);

    const orderCollection = db.collection('orders');
    const { data: orders } = await orderCollection.where(orderQuery).get();

    if (!orders || orders.length === 0) {
      return {
        code: 200,
        data: []
      };
    }

    // 收集聊天对象id
    const partnerIdsSet = new Set();
    for (const order of orders) {
      if (user_type === '普通用户') {
        if (order.doctor_id) partnerIdsSet.add(order.doctor_id);
      } else {
        if (order.user_id) partnerIdsSet.add(order.user_id);
      }
    }
    const partnerIds = Array.from(partnerIdsSet);
    if (partnerIds.length === 0) {
      return {
        code: 200,
        data: []
      };
    }

    // 查询聊天对象详细信息
    const usersCollection = db.collection('users');
    const { data: partners } = await usersCollection.where({ user_id: db.command.in(partnerIds) }).get();

    // 整理返回数据，修正type
    const chatPartners = partners.map(partner => ({
      user_id: partner.user_id,
      name: partner.realName || partner.nickName || '未知用户',
      avatar: partner.avatar || '/static/service-default.png',
      type: user_type === '普通用户' ? '陪诊师' : '普通用户'
    }));

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