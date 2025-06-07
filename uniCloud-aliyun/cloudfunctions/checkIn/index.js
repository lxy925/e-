'use strict';
const db = uniCloud.database();
const checkInsCollection = db.collection('check_ins');
const ordersCollection = db.collection('order');

exports.main = async (event, context) => {
  const { action, data } = event;
  
  switch (action) {
    case 'createCheckIn':
      return await createCheckIn(data);
    case 'submitCheckIn':
      return await submitCheckIn(data);
    case 'getPendingCheckIns':
      return await getPendingCheckIns(data);
    case 'checkCheckInStatus':
      return await checkCheckInStatus(data);
    case 'checkSuccessfulCheckIn':
      return await checkSuccessfulCheckIn(data);
    default:
      return {
        code: 404,
        msg: '未找到对应的操作'
      };
  }
};

// 创建打卡任务
async function createCheckIn(data) {
  const { order_id, escort_id, user_id, scheduled_time } = data;
  
  try {
    // 检查是否已存在打卡记录
    const existingCheckIn = await checkInsCollection.where({
      order_id,
      escort_id
    }).get();
    
    if (existingCheckIn.data.length > 0) {
      return {
        code: 400,
        msg: '该订单已存在打卡记录'
      };
    }
    
    // 创建打卡记录
    const checkInData = {
      order_id,
      escort_id,
      user_id,
      scheduled_time: new Date(scheduled_time),
      status: 'pending',
      create_time: new Date(),
      update_time: new Date()
    };
    
    const result = await checkInsCollection.add(checkInData);
    
    return {
      code: 200,
      msg: '打卡任务创建成功',
      data: {
        id: result.id,
        ...checkInData
      }
    };
  } catch (e) {
    return {
      code: 500,
      msg: '创建打卡任务失败：' + e.message
    };
  }
}

// 提交打卡
async function submitCheckIn(data) {
  const { check_in_id, location, images, description } = data;
  
  try {
    if (!location || !images || images.length === 0) {
      return {
        code: 400,
        msg: '位置和图片为必填项'
      };
    }
    
    // 检查位置信息是否包含具体地址
    if (!location.address || location.address.includes('经度')) {
      return {
        code: 400,
        msg: '请获取具体的位置地址'
      };
    }
    
    const checkIn = await checkInsCollection.doc(check_in_id).get();
    if (!checkIn.data || checkIn.data.length === 0) {
      return {
        code: 404,
        msg: '未找到打卡记录'
      };
    }
    
    const checkInData = checkIn.data[0];
    const now = new Date();
    const scheduledTime = new Date(checkInData.scheduled_time);
    const fiveMinutesAfter = new Date(scheduledTime.getTime() + 5 * 60 * 1000);
    
    // 检查是否超时
    if (now > fiveMinutesAfter) {
      // 更新状态为failed
      await checkInsCollection.doc(check_in_id).update({
        status: 'failed',
        update_time: now
      });
      
      return {
        code: 400,
        msg: '打卡已超时'
      };
    }
    
    // 检查状态是否为pending
    if (checkInData.status !== 'pending') {
      return {
        code: 400,
        msg: '该打卡记录状态不正确'
      };
    }
    
    // 更新打卡记录
    const updateData = {
      check_in_time: now,
      location,
      images,
      description: description || '',
      status: 'success',
      update_time: now
    };
    
    await checkInsCollection.doc(check_in_id).update(updateData);
    
    return {
      code: 200,
      msg: '打卡成功',
      data: {
        check_in_time: now
      }
    };
  } catch (e) {
    return {
      code: 500,
      msg: '提交打卡失败：' + e.message
    };
  }
}

// 获取待打卡任务
async function getPendingCheckIns(data) {
  const { escort_id } = data;
  
  try {
    console.log('开始查询待打卡任务，陪诊师ID:', escort_id);
    
    // 获取当前时间
    const now = new Date();
    console.log('当前时间:', now.toISOString());
    
    // 1. 先查找符合条件的订单
    const orders = await ordersCollection.where({
      escort_id,
      order_status: '已确认'
    }).get();
    
    console.log('所有已确认订单:', JSON.stringify(orders.data));
    
    // 2. 查找已有的待打卡记录
    const existingCheckIns = await checkInsCollection.where({
      escort_id,
      status: 'pending'
    }).get();
    
    console.log('已有的待打卡记录:', JSON.stringify(existingCheckIns.data));
    
    // 3. 检查并更新超时的打卡记录
    for (const checkIn of existingCheckIns.data) {
      const scheduledTime = new Date(checkIn.scheduled_time);
      const fiveMinutesAfter = new Date(scheduledTime.getTime() + 5 * 60 * 1000);
      if (now > fiveMinutesAfter) {
        await checkInsCollection.doc(checkIn._id).update({
          status: 'failed',
          update_time: now
        });
      }
    }
    
    // 4. 过滤出需要新建打卡任务的订单
    const pendingOrders = orders.data.filter(order => {
      try {
        // 修复时间格式，确保是有效的ISO格式
        let orderTimeStr = order.order_time;
        // 如果时间格式是 "2025-06-07T7:34:00Z"，转换为 "2025-06-07T07:34:00Z"
        if (orderTimeStr.includes('T') && !orderTimeStr.includes('Z')) {
          orderTimeStr += 'Z';
        }
        // 确保小时是两位数
        orderTimeStr = orderTimeStr.replace(/T(\d):/, 'T0$1:');
        
        // 将字符串时间转换为Date对象
        const orderTime = new Date(orderTimeStr);
        const fiveMinutesBefore = new Date(orderTime.getTime() - 5 * 60 * 1000);
        const fiveMinutesAfter = new Date(orderTime.getTime() + 5 * 60 * 1000);
        
        console.log('原始订单时间:', order.order_time);
        console.log('格式化后订单时间:', orderTimeStr);
        console.log('订单时间对象:', orderTime.toISOString());
        console.log('5分钟前时间:', fiveMinutesBefore.toISOString());
        console.log('5分钟后时间:', fiveMinutesAfter.toISOString());
        console.log('当前时间:', now.toISOString());
        
        // 检查时间是否有效
        if (isNaN(orderTime.getTime())) {
          console.log('无效的订单时间:', order.order_time);
          return false;
        }
        
        // 检查是否在打卡时间范围内（订单时间前后5分钟）
        const isInTimeRange = now >= fiveMinutesBefore && now <= fiveMinutesAfter;
        console.log('是否在打卡时间范围内:', isInTimeRange);
        
        // 检查是否已存在打卡记录（包括success和failed状态）
        const hasAnyCheckIn = existingCheckIns.data.some(
          checkIn => checkIn.order_id === order.order_id
        );
        
        // 如果在时间范围内且没有任何打卡记录，则需要新建打卡任务
        return isInTimeRange && !hasAnyCheckIn;
      } catch (e) {
        console.error('处理订单时间时出错:', e);
        return false;
      }
    });
    
    console.log('需要新建打卡任务的订单:', JSON.stringify(pendingOrders));
    
    // 5. 创建新的打卡任务
    const newCheckIns = [];
    for (const order of pendingOrders) {
      try {
        console.log('处理订单:', order.order_id);
        
        // 修复时间格式
        let orderTimeStr = order.order_time;
        if (orderTimeStr.includes('T') && !orderTimeStr.includes('Z')) {
          orderTimeStr += 'Z';
        }
        orderTimeStr = orderTimeStr.replace(/T(\d):/, 'T0$1:');
        
        // 创建新的打卡任务
        const checkInData = {
          order_id: order.order_id,
          escort_id,
          user_id: order.user_id,
          scheduled_time: new Date(orderTimeStr),
          status: 'pending',
          create_time: now,
          update_time: now
        };
        
        console.log('创建新的打卡任务:', JSON.stringify(checkInData));
        
        const result = await checkInsCollection.add(checkInData);
        if (result.id) {
          newCheckIns.push({
            ...checkInData,
            _id: result.id
          });
          console.log('打卡任务创建成功，ID:', result.id);
        }
      } catch (e) {
        console.error('创建打卡任务失败:', e);
      }
    }
    
    // 6. 重新获取所有有效的待打卡记录（包括新创建的）
    const updatedCheckIns = await checkInsCollection.where({
      escort_id,
      status: 'pending'
    }).get();
    
    // 过滤掉已超时的记录
    const validCheckIns = updatedCheckIns.data.filter(checkIn => {
      try {
        const scheduledTime = new Date(checkIn.scheduled_time);
        const fiveMinutesAfter = new Date(scheduledTime.getTime() + 5 * 60 * 1000);
        return now <= fiveMinutesAfter;
      } catch (e) {
        console.error('处理打卡记录时间时出错:', e);
        return false;
      }
    });
    
    console.log('返回的所有待打卡任务:', JSON.stringify(validCheckIns));
    
    return {
      code: 200,
      msg: validCheckIns.length > 0 ? '获取成功' : '没有需要打卡的订单',
      data: validCheckIns
    };
  } catch (e) {
    console.error('获取待打卡任务失败:', e);
    return {
      code: 500,
      msg: '获取待打卡任务失败：' + e.message
    };
  }
}

// 检查打卡状态
async function checkCheckInStatus(data) {
  const { check_in_id } = data;
  
  try {
    const checkIn = await checkInsCollection.doc(check_in_id).get();
    if (!checkIn.data || checkIn.data.length === 0) {
      return {
        code: 404,
        msg: '未找到打卡记录'
      };
    }
    
    const checkInData = checkIn.data[0];
    const now = new Date();
    const scheduledTime = new Date(checkInData.scheduled_time);
    const fiveMinutesAfter = new Date(scheduledTime.getTime() + 5 * 60 * 1000);
    
    // 如果状态为pending且已超时，更新状态为failed
    if (checkInData.status === 'pending' && now > fiveMinutesAfter) {
      await checkInsCollection.doc(check_in_id).update({
        status: 'failed',
        update_time: now
      });
      
      checkInData.status = 'failed';
    }
    
    return {
      code: 200,
      msg: '获取成功',
      data: checkInData
    };
  } catch (e) {
    return {
      code: 500,
      msg: '检查打卡状态失败：' + e.message
    };
  }
}

// 检查是否有成功的打卡记录
async function checkSuccessfulCheckIn(data) {
  const { escort_id } = data;
  
  try {
    console.log('检查成功打卡记录，陪诊师ID:', escort_id);
    
    // 获取当前时间
    const now = new Date();
    
    // 查找最近24小时内的成功打卡记录
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const successfulCheckIns = await checkInsCollection.where({
      escort_id,
      status: 'success',
      check_in_time: db.command.gte(oneDayAgo)
    }).get();
    
    console.log('成功打卡记录:', JSON.stringify(successfulCheckIns.data));
    
    return {
      code: 200,
      msg: '检查成功',
      data: {
        hasSuccessfulCheckIn: successfulCheckIns.data.length > 0,
        checkIns: successfulCheckIns.data
      }
    };
  } catch (e) {
    console.error('检查成功打卡记录失败:', e);
    return {
      code: 500,
      msg: '检查成功打卡记录失败：' + e.message
    };
  }
} 