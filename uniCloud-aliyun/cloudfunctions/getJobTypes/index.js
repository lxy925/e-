'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
  try {
    console.log('开始获取工种信息...');

    const res = await db.collection('job_types').get();
    const data = res.data;

    console.log('查询结果:', JSON.stringify(data));

    if (!data || data.length === 0) {
      console.warn('未查询到工种数据');
      return {
        code: 0,
        msg: '暂无数据',
        data: []
      };
    }

    console.log('成功获取工种数据，数量:', data.length);

    return {
      code: 0,
      msg: '获取成功',
      data: data
    };
  } catch (e) {
    console.error('获取工种信息异常:', e);
    return {
      code: 500,
      msg: '获取工种信息失败: ' + (e.message || e),
      error: e,
      data: []
    };
  }
};