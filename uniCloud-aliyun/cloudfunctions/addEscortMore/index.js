'use strict';
// 云函数 addEscortMore/index.js
exports.main = async (event, context) => {
  const db = uniCloud.database();
  const { moreData } = event;

  try {
    // 将数据存储到云数据库
    const result = await db.collection('escorts_more').add(moreData);

    return {
      code: 200,
      message: '数据提交成功',
      data: result,
    };
  } catch (err) {
    return {
      code: 500,
      message: '数据提交失败',
      error: err,
    };
  }
};
