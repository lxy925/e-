// uniCloud/cloudfunctions/delayCheckOrder/index.js
const db = uniCloud.database();

exports.main = async (event, context) => {
  const { action, order_no, delay } = event;

  // 测试模式
  if (action === 'test') {
    console.log('=== 测试模式 ===');
    console.error('delay时间为:',delay);
    // 查询订单
    const order = await db.collection('orders').where({ order_no }).get();
    console.log('订单查询结果:', order.data);

    if (order.data.length === 0) {
      console.error('订单未找到');
      return { success: false, message: '订单未找到' };
    }

    // 将订单状态设置为 pending
    const setPendingRes = await uniCloud.callFunction({
      name: 'updateOrderStatus',
      data: {
        order_no,
        from_status: 'unpaid',
        to_status: 'pending'
      }
    });
    console.log('设置订单状态为 pending:', setPendingRes.result);

    if (!setPendingRes.result.success) {
      console.error('设置订单状态为 pending 失败');
      return { success: false, message: '设置订单状态为 pending 失败' };
    }

    // 确保延迟任务按预期时间触发
    const timeoutId = setTimeout(async () => {
      console.log('延迟任务开始执行');
      const res = await checkOrderExpired(order_no);
      console.log('延迟检查结果:', res);
    }, delay);

    // 保存 timeoutId，以便后续可以取消或管理
    context.timeoutId = timeoutId;

    return { success: true, testInitiated: true };
  }

  // 正常创建延迟任务
  if (action === 'create') {
    return await createDelayTask(order_no, delay);
  }

  return { success: false, message: '无效操作' };
};

async function createDelayTask(order_no, delay) {
  // 实际项目中应该使用uniCloud的定时任务
  // 这里简化为直接写入数据库
  return await db.collection('delay_tasks').add({
    order_no,
    expire_time: Date.now() + delay,
    status: 'pending'
  });
}

async function checkOrderExpired(order_no) {
  console.log('开始检查订单是否过期:', order_no);
  console.log('检查时间为:', Date.now());
  try {
    const orderRes = await uniCloud.callFunction({
      name: 'updateOrderStatus',
      data: {
        order_no,
        from_status: 'pending',
        to_status: 'expired'
      }
    });

    console.log('更新订单状态结果:', orderRes.result);
    return orderRes.result.success;
  } catch (error) {
    console.error('更新订单状态失败:', error);
    return false;
  }
}