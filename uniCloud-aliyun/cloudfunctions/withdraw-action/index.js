'use strict';
const db = uniCloud.database();
const dbCmd = db.command;

exports.main = async (event, context) => {
  const {
    action, // 'confirmTransfer' 或 'cancelTransfer'
    options,
    accountInfo,
    amount,
    out_bill_no,
    transferResult // 新增参数，前端传递的转账结果
  } = event;
  
  try {
    if (action === 'confirmTransfer') {
      return await handleConfirmTransfer();
    } else if (action === 'cancelTransfer') {
      return await handleCancelTransfer();
    } else {
      throw new Error('无效的操作类型');
    }
  } catch (error) {
    console.error('操作失败:', error);
    return {
      code: 500,
      message: error.message || '操作失败',
      data: null
    };
  }
  
  async function handleConfirmTransfer() {
    // 参数校验
    if (!accountInfo || !accountInfo._id || !out_bill_no || !amount) {
      throw new Error('缺少必要参数');
    }

    const transaction = await db.startTransaction();
    
    try {
      // 解冻金额（需从冻结金额扣除）
      const _id = accountInfo._id;
      await transaction.collection('escort_account')
        .doc(_id)
        .update({
          frozen_amount: dbCmd.inc(-amount), // 减少冻结金额
          update_time: Date.now()
        });
      
      // 获取新的账户信息
      const newAccountRes = await db.collection('escort_account')
        .doc(_id)
        .get();
      const newAccountInfo = newAccountRes.data[0];
      
      // 更新提现记录状态
      await transaction.collection('withdraw_records')
        .doc(out_bill_no)
        .update({
          status: 'SUCCESS',
          update_time: Date.now()
        });
      
      // 提交事务
      await transaction.commit();
      
      return {
        code: 200,
        message: '提现成功',
        data: {
          transferResult, // 使用前端传递的转账结果
          updatedAccount: {
            accountInfo,
            newAccountInfo
          }
        }
      };
    } catch (dbError) {
      // 数据库操作失败回滚
      if (transaction && transaction._state === 'pending') {
        await transaction.rollback();
      }
      console.error('数据库更新失败:', dbError);
      throw new Error('系统处理失败，请联系客服');
    }
  }
  
  async function handleCancelTransfer() {
    // 参数校验
    if (!out_bill_no || !accountInfo || !accountInfo._id) {
      throw new Error('缺少必要参数: out_bill_no 或 accountInfo');
    }

   const vkPay = require("vk-uni-pay");
    const transaction = await db.startTransaction();
    
    try {
      // 1. 调用支付平台撤销接口
      const cancelResult = await vkPay.cancelTransfer({
        provider: "wxpay",
        platform: 'mp-weixin',
        out_bill_no
      });

      if (cancelResult.code !== 0) {
        throw new Error(cancelResult.msg || '支付平台撤销失败');
      }

      // 2. 恢复账户金额
      const _id = accountInfo._id;
      await transaction.collection('escort_account')
        .doc(_id)
        .update({
          frozen_amount: accountInfo.frozen_amount,
          withdrawable_amount: accountInfo.withdrawable_amount,
          update_time: Date.now()
        });
      
      // 3. 更新提现记录状态
      await transaction.collection('withdraw_records')
        .doc(out_bill_no)
        .update({
          status: 'CANCELED',
          cancel_time: Date.now(),
          update_time: Date.now(),
          cancel_reason: '用户主动撤销'
        });
      
      // 提交事务
      await transaction.commit();
      
      return {
        code: 200,
        message: '撤销提现成功',
        data: {
          cancelResult,
          updatedAccount: {
            ...accountInfo
          }
        }
      };
    } catch (error) {
      // 如果事务已开始但未提交，则回滚
      if (transaction && transaction._state === 'pending') {
        await transaction.rollback();
      }
      console.error('撤销提现失败:', error);
      throw new Error(`撤销提现失败: ${error.message}`);
    }
  }
};