// uniCloud/cloudfunctions/getOrder/index.js
const db = uniCloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  // 安全校验
  const { order_no } = event;
  const user_id = context.APPID === 'your-app-id' ? 
    uniCloud.getCurrentUserInfo().uid : 
    event.user_id;

  const res = await db.collection('orders')
    .where({
      order_no,
      user_id: _.eq(user_id) // 确保用户只能查自己的订单
    })
    .field({
      _id: true,
      status: true,
      create_time: true,
      expire_time: true,
      amount: true
    })
    .get();

  if (res.data.length === 0) {
    return { 
      success: false,
      code: 'ORDER_NOT_FOUND'
    };
  }

  return {
    success: true,
    data: res.data[0]
  };
};