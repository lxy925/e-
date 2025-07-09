'use strict';
// 文件位置：uniCloud/cloudfunctions/close-order/index.js
exports.main = async (event) => {
  const db = uniCloud.database();
  const orderId = event.data.orderId;

  // 使用事务保证原子性
  const transaction = await db.startTransaction();
  try {
    const order = await transaction.collection('orders').doc(orderId).get();
    
    if (order.data[0].status !== 'pending') {
      await transaction.rollback();
      return { code: 200, message: '订单状态已变更' };
    }

    // 执行取消操作
    await transaction.collection('orders').doc(orderId).update({
      status: 'cancelled',
      cancel_reason: '支付超时'
    });

    await transaction.commit();
    return { code: 200 };
  } catch (e) {
    await transaction.rollback();
    return { code: 500, message: e.message };
  }
};