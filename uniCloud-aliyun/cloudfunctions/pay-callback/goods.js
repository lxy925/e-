'use strict';
const db = uniCloud.database();
const payCrypto = require('../libs/crypto.js'); // 获取加密服务


module.exports = async (obj) => {
  const { data = {}, custom = {} } = obj;
  let user_order_success = true;
  // 1. 获取订单号（从加密数据或直接传参）
  const order_no = data.order_no || custom.order_no; 
console.log("type：goods");
  // 2. 更新订单状态
  const res = await db.collection('orders')
    .where({ 
      order_no,
      status: 'pending' // 防止重复处理
    })
    .update({
      status: 'paid',
      paid_time: Date.now()
    });
  // 3. 清理延迟任务
  if (res.updated > 0) {
    await db.collection('delay_tasks')
      .where({ order_no })
      .remove();
    console.log('支付成功处理完成');
  }

 return user_order_success;
};
