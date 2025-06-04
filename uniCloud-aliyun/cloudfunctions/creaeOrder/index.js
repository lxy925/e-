
// 云函数Createorder
'use strict';
const db = uniCloud.database();
const crypto = require('crypto');

// AES加密密钥(需与前端一致)
const AES_KEY = '12345678901234561234567890123456';

exports.main = async (event, context) => {
  const { action, data } = event;
  
  if (action === 'create') {
    // 创建订单
    const res = await db.collection('orders').add({
      order_no: data.order_no,
      user_id: data.user_id,
      amount: data.amount,
      status: data.status,
      created_time: Date.now()
    });
    
    return { success: true, id: res.id };
  }
  
  return { success: false };
};