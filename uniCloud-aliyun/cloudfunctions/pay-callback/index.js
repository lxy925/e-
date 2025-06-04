const db = uniCloud.database();

exports.main = async (event, context) => {
  console.log('支付回调数据:', event);

  const { order_no } = event;
  try {
    // 更新订单状态为 'paid'
    const res = await db.collection('orders')
      .where({ order_no, status: 'pending' })
      .update({
        status: 'paid',
        update_time: Date.now()
      });
//res.updated 是一个返回值，用于表示更新操作影响的文档数量
    if (res.updated > 0) {
      console.log('订单状态更新为 paid');
      return { success: true, message: '订单状态更新成功' };
    } else {
      console.error('订单状态更新失败，订单号:', order_no);
      return { success: false, message: '订单状态更新失败' };
    }
  } catch (error) {
    console.error('支付回调处理失败:', error);
    return { success: false, message: '支付回调处理失败' };
  }
};