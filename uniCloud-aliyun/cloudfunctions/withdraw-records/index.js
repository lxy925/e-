'use strict';
const db = uniCloud.database();
const dbCmd = db.command;
const _ = db.command;

exports.main = async (event, context) => {
  // 参数解构与默认值设置
  const { accountInfo, page = 1, pageSize = 10, status } = event;
  
  // 参数校验 - 更全面的校验
  if (!accountInfo || !accountInfo.user_id) {
    return {
      code: 400,
      msg: '缺少必要参数: accountInfo.user_id'
    };
  }

  // 校验分页参数
  if (page < 1 || pageSize < 1 || pageSize > 100) {
    return {
      code: 400,
      msg: '分页参数不合法'
    };
  }

  const openid = accountInfo.user_id;
  
  try {
    // 构建查询条件
    const queryCondition = {
      openid: openid
    };

    // 添加状态筛选条件
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      queryCondition.status = status;
    }

    console.log("queryCondition", queryCondition);

    // 获取记录总数
    const countRes = await db.collection('withdraw_records')
      .where(queryCondition)
      .count();

    const total = countRes.total;
    console.log("数据条数：", total);
    
    // 处理无数据情况
    if (total === 0) {
      return {
        code: 200,
        data: {
          list: [],
          total: 0,
          totalPages: 0,
          currentPage: page
        }
      };
    }

    // 计算总页数
    const totalPages = Math.ceil(total / pageSize);
    
    // 计算实际要查询的页码(从后往前)
    const targetPage = Math.max(1, Math.min(totalPages, page)); // 确保不超过总页数
    const skip = (targetPage - 1) * pageSize;

    // 查询数据
    const recordsRes = await db.collection('withdraw_records')
      .where(queryCondition)
      .orderBy('create_time', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get();

    return {
      code: 200,
      data: {
        list: recordsRes.data,
        total: total,
        totalPages: totalPages,
        currentPage: page,
        targetPage: targetPage
      }
    };
  } catch (error) {
    console.error('查询提现记录失败:', error);
    return {
      code: 500,
      msg: '服务器内部错误',
      error: error.message
    };
  }
};