'use strict';
// 云函数：confirmWithdraw
exports.main = async (event, context) => {
  const { withdraw_records_id } = event;
  const db = uniCloud.database();
const _id=withdraw_records_id;
  // 1. 验证token有效性
  const record = await db.collection('withdraw_records')
    .where({ _id, status: 'WAIT_USER_CONFIRM' })
    .get();
  if (!record.data.length || record.data[0].token_expire < Date.now()) {
    return { code: 400, msg: '无效或过期的token' };
  }

  // 2. 获取存储的options
  const {options} = record.data[0];
console.log(options)
  // 3. 调用微信支付确认接口
  try {
    const res = await uni.requestMerchantTransfer({
      ...options,
      success: (result) => {
        console.log('转账成功:', result);
      },
      fail: (err) => {
        throw new Error(err.errMsg);
      }
    });

    // 4. 更新记录状态
    await db.collection('withdraw_records').doc(_id).update({
      status: '已完成',
      update_time: Date.now()
    });

    return { code: 200, msg: '提现成功' };
  } catch (e) {
    // 失败时更新状态
    await db.collection('withdraw_records').doc(_id).update({
      status: '失败',
      error_msg: e.message,
      update_time: Date.now()
    });
    return { code: 500, msg: e.message };
  }
};