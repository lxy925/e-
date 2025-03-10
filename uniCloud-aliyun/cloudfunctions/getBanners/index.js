'use strict';
const db = uniCloud.database();
const _ = db.command; // 引入数据库命令

exports.main = async (event, context) => {
  try {
    console.log('开始获取轮播图数据');

    const bannerCollection = db.collection('banners');

    // 查询条件
    const query = {
      status: _.in([1, "1"]) // 同时查询数字 1 和字符串 "1"
    };
    console.log('查询条件：', query);

    // 查询轮播图数据
    const res = await bannerCollection
      .where(query)
      .orderBy('sort', 'asc')
      .get();

    console.log('查询结果：', JSON.stringify(res, null, 2));

    // 返回结果
    return {
      code: 0,
      message: 'success',
      data: res.data
    };
  } catch (e) {
    console.error('错误：', e);
    return {
      code: -1,
      message: e.message || '获取轮播图失败',
      data: null
    };
  }
};