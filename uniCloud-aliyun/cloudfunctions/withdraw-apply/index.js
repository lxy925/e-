'use strict';
const db = uniCloud.database();
const withdrawRecords = db.collection('withdraw_records');
const escortAccount = db.collection('escort_account');

exports.main = async (event, context) => {
    const { accountInfo, amount } = event;

    // 参数校验
    if (!accountInfo.user_id || !amount || amount <= 0) {
        return { code: 400, msg: '参数错误' };
    }

    // 检查余额
    if (accountInfo.withdrawable_amount < amount) {
        return { code: 403, msg: '余额不足' };
    }

    let transaction;
    let recordId;
    const openid = accountInfo.user_id;

    try {
        // 开始事务
        transaction = await db.startTransaction();
        
        // 冻结金额
        await transaction.collection('escort_account').doc(accountInfo._id).update({
            withdrawable_amount: accountInfo.withdrawable_amount - amount,
            frozen_amount: (accountInfo.frozen_amount || 0) + amount,
            update_time: Date.now()
        });

        // 创建提现记录
        const record = {
            openid,
            amount,
            status: 'PROCESSING',
            create_time: Date.now(),
            update_time: Date.now(),
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            week: getWeekNumber(new Date()),
            day: new Date().getDate()
        };

        const recordRes = await transaction.collection('withdraw_records').add(record);
        recordId = recordRes.id;

        // 提交事务
        await transaction.commit();

        // 异步触发提现处理
        try {
            const { result } = await uniCloud.callFunction({
                name: 'withdraw-process',
                data: { _id: recordId, user_id: openid, amount }
            });

            if (result.code === 200) {
                return {
                    code: 201,
                    msg: result.msg,
                    data: {
                        options: result.data.options,
                        out_bill_no: result.data.out_bill_no
                    }
                };
            } else {
                // 提现失败，解冻资金
                await handleWithdrawFailure(recordId, openid, amount, accountInfo._id, result.message);
                return { code: 500, msg: result.msg || '提现处理失败' };
            }
        } catch (e) {
            // 提现处理异常，解冻资金
            await handleWithdrawFailure(recordId, openid, amount, accountInfo._id, e.message);
            return { code: 500, msg: '提现处理异常', error: e.message };
        }

    } catch (e) {
        // 确保事务已回滚
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackErr) {
                console.error('事务回滚失败:', rollbackErr);
            }
        }
        
        console.error('提现申请提交失败:', e);
        return { code: 500, msg: '提现申请提交失败', error: e.message };
    }
};

// 处理提现失败的情况（解冻资金）
async function handleWithdrawFailure(recordId, userId, amount, accountId, errorMsg) {
    const db = uniCloud.database();
    const transaction = await db.startTransaction();
    
    try {
        // 1. 更新提现记录状态
        await transaction.collection('withdraw_records').doc(recordId).update({
            status: 'FAILED',
            error_msg: errorMsg,
            update_time: Date.now()
        });

        // 2. 解冻资金（查询当前账户状态以确保准确性）
        const accountRes = await transaction.collection('escort_account').doc(accountId).get();
        const account = accountRes.data[0];
        
        await transaction.collection('escort_account').doc(accountId).update({
            withdrawable_amount: account.withdrawable_amount + amount,
            frozen_amount: account.frozen_amount - amount,
            update_time: Date.now()
        });

        await transaction.commit();
    } catch (e) {
        await transaction.rollback();
        console.error('资金解冻失败:', e);
        // 这里可以添加通知管理员的逻辑
    }
}

// 辅助函数：获取周数
function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}