const cloud = require('alicloud-sdk');

exports.main = async (event, context) => {
  const { keyword = '', page = 1, pageSize = 10 } = event;

  try {
    // 这里假设你有一个数据库连接
    const db = cloud.database();
    const skip = (page - 1) * pageSize;

    const hospitals = await db.collection('hospitals')
      .where({ name: db.RegExp({ regexp: keyword, options: 'i' }) })
      .skip(skip)
      .limit(pageSize)
      .get();

    return {
      code: 0,
      msg: '获取医院列表成功',
      data: hospitals.data
    };
  } catch (error) {
    console.error('获取医院列表失败:', error);
    return {
      code: -1,
      msg: '获取医院列表失败',
      data: null
    };
  }
}