'use strict';
const db = uniCloud.database();
const dbCmd = db.command;
const _ = db.command;  // 添加这行
const jwt = require('./jwt.js');

exports.main = async (event, context) => {
  const {accountInfo, page = 1, pageSize = 10, status} = event;
  
  // 参数校验
  if (!accountInfo) {
    return {
      code: 400,
      msg: '参数错误'
    };
  }

  const openid=accountInfo.user_id;
  try {
  // 构建查询条件 - 修改为180天
  const queryCondition = {
    openid: openid,
    // create_time: _.gte(Date.now() - 180 * 24 * 60 * 60 * 1000)
  };

  if (status) {
    queryCondition.status = status;
  }
console.log("queryCondition",queryCondition)
  // 获取记录总数
  const countRes = await db.collection('withdraw_records')
    .where(queryCondition)
    .count();

  const total = countRes.total;
  console.log("数据条数：",total)
  if (total === 0) {
    return {
      code: 200,
      data: {
        list: [],
        total: 0,
        totalPages: 0,
        currentPage: 0
      }
    };
  }

  const totalPages = Math.ceil(total / pageSize);
  
  // 计算实际要查询的页码(从后往前)
  const targetPage = Math.max(1, totalPages - page + 1);
  const skip = (targetPage - 1) * pageSize;

  // 查询数据 - 修改为降序排列
  const recordsRes = await db.collection('withdraw_records')
    .where(queryCondition)
    .orderBy('create_time', 'desc')  // 改为降序
    .skip(skip)
    .limit(pageSize)
    .get();

  return {
    code: 200,
    data: {
      list: recordsRes.data,
      total: total,
      totalPages: totalPages,
      currentPage: page,  // 返回前端传入的页码
      targetPage: targetPage // 实际查询的页码(用于调试)
    }
  };
};