const db = uniCloud.database();
exports.main = async (event) => {
  // 实际检查逻辑
  const order = await db.collection('orders')
    .where({ order_no: event.order_no, status: 'pending' })
    .get();

  if (order.data.length) {
    await db.collection('orders').doc(order.data[0]._id).update({
      status: 'timeout'
    });
  }
};