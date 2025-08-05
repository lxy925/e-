'use strict';
const db = uniCloud.database();
const checkInsCollection = db.collection('check_ins');
const ordersCollection = db.collection('orders');

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
  const { check_in_id, location, images } = data;
  
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
      //description: description || '',
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
  const { doctor_id } = data;
  try {
    console.log('开始查询待打卡任务，陪诊师doctor_id:', doctor_id);
    const now = new Date();
    // 1. 查找该陪诊师的所有订单（可根据实际业务调整订单状态筛选）
    const orders = await ordersCollection.where({
      doctor_id,
      // 可根据实际业务调整状态筛选
      status: db.command.in(['paid', '已确认'])
    }).get();
    console.log('所有有效订单:', JSON.stringify(orders.data));
    // 2. 查找该陪诊师所有check_in记录
    const allCheckIns = await checkInsCollection.where({
      escort_id: doctor_id
    }).get();
    // 3. 遍历订单，找出需要打卡的订单
    const pendingCheckIns = [];
    for (const order of orders.data) {
      let serviceTimeRaw = order.service_info && order.service_info.service_time;
      let serviceTimeStr = serviceTimeRaw;
      // 强制兼容Date类型
      if (serviceTimeRaw instanceof Date) {
        serviceTimeStr = serviceTimeRaw.toISOString();
      }
      // 兼容时间戳（数字）
      if (typeof serviceTimeRaw === 'number') {
        serviceTimeStr = new Date(serviceTimeRaw).toISOString();
      }
      console.error('serviceTimeRaw:', serviceTimeRaw, 'typeof:', typeof serviceTimeRaw, 'serviceTimeStr:', serviceTimeStr);
      if (!serviceTimeStr || typeof serviceTimeStr !== 'string' || !serviceTimeStr.includes('T')) continue;
      if (serviceTimeStr.includes('T') && !serviceTimeStr.includes('Z')) {
        serviceTimeStr += 'Z';
      }
      serviceTimeStr = serviceTimeStr.replace(/T(\d):/, 'T0$1:');
      const serviceTime = new Date(serviceTimeStr);
      if (isNaN(serviceTime.getTime())) continue;
      const fiveMinutesBefore = new Date(serviceTime.getTime() - 5 * 60 * 1000);
      const fiveMinutesAfter = new Date(serviceTime.getTime() + 5 * 60 * 1000);
      console.error('serviceTime:', serviceTime.toISOString());
      console.error('now:', now.toISOString());
      console.error('fiveMinutesBefore:', fiveMinutesBefore.toISOString());
      console.error('fiveMinutesAfter:', fiveMinutesAfter.toISOString());
      console.error('now in window:', now >= fiveMinutesBefore && now <= fiveMinutesAfter);
      if (now < fiveMinutesBefore || now > fiveMinutesAfter) continue;
      const hasSuccessCheckIn = allCheckIns.data.some(
        ci => ci.order_id === order._id && ci.escort_id === doctor_id && ci.status === 'success'
      );
      if (hasSuccessCheckIn) continue;
      let pendingCheckIn = allCheckIns.data.find(
        ci => ci.order_id === order._id && ci.escort_id === doctor_id && ci.status === 'pending'
      );
      if (!pendingCheckIn) {
        const checkInData = {
          order_id: order._id,
          escort_id: doctor_id,
          user_id: order.user_id,
          scheduled_time: serviceTime,
          status: 'pending',
          create_time: now,
          update_time: now
        };
        const result = await checkInsCollection.add(checkInData);
        pendingCheckIn = { ...checkInData, _id: result.id };
      }
      if (now > fiveMinutesAfter) {
        await checkInsCollection.doc(pendingCheckIn._id).update({
          status: 'failed',
          update_time: now
        });
        continue;
      }
      pendingCheckIns.push(pendingCheckIn);
    }
    // 返回所有有效的待打卡任务
    return {
      code: 200,
      msg: pendingCheckIns.length > 0 ? '获取成功' : '没有需要打卡的订单',
      data: pendingCheckIns
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