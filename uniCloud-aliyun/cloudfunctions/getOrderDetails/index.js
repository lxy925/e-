// uniCloud/cloudfunctions/getOrderDetails/index.js
const db = uniCloud.database();

exports.main = async (event) => {
  const { order_no } = event;
  const order = await db.collection('orders')
    .where({ order_no })
    .get();

  return order.data[0] || {};
};