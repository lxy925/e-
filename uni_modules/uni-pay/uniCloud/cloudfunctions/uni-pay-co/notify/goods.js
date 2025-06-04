'use strict';
const db = uniCloud.database();

module.exports = async (obj) => {
  const { data = {}, custom = {} } = obj;
  const order_no = data.out_trade_no || custom.order_no;

  try {
    // 处理支付关闭（微信触发）
    if (data.trade_state === 'CLOSED') {
      // await db.collection('orders')
      //   .where({ order_no })
      //   .update({
      //     status: 'expired',
      //     close_time: Date.now(),
      //     close_reason: '微信支付超时'
      //   });
      // return { code: 0 };
	    await uniCloud.callFunction({
	          name: 'updateOrderStatus',
	          data: {
	            order_no,
	            from_status: 'pending',
	            to_status: 'expired',
	            expired_at: Date.now()
	          }
	        });
	        return { code: 0 };
	      }
    }

    // 处理支付成功
    if (data.trade_state === 'SUCCESS') {
      // const updateRes = await db.collection('orders')
      //   .where({ 
      //     order_no,
      //     status: 'unpaid'
      //   })
      //   .update({
      //     status: 'paid',
      //     paid_time: Date.now(),
      //   });

      // if (updateRes.updated > 0) {
      //   // 这里可以添加积分发放、库存扣除等逻辑
      //   return { code: 0 };
      // }
	  const updateRes =  await uniCloud.callFunction({
	          name: 'updateOrderStatus',
	          data: {
	            order_no,
	            from_status: 'pending',
	            to_status: 'paid',
	            paid_at: Date.now()
	          }
	        });
	      if (updateRes.updated > 0) { 
			  return { code: 0 };
			  }
    }

    return { code: -1, msg: '订单状态未变更' };
  } catch (e) {
    console.error('处理失败:', e);
    return { code: -2, msg: e.message };
  }
};