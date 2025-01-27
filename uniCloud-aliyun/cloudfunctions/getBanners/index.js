'use strict';
const db = uniCloud.database()

exports.main = async (event, context) => {
  try {
    console.log('开始获取轮播图数据')
    
    const bannerCollection = db.collection('banners')
    const res = await bannerCollection
      .where({
        status: 1  // 改为字符串类型的"1"，或者确保数据库中是数字类型的1
      })
      .orderBy('sort', 'asc')
      .get()
    
    console.log('查询结果：', res)
    
    return {
      code: 0,
      msg: 'success',
      data: res.data
    }
  } catch (e) {
    console.error('错误：', e)
    return {
      code: -1,
      msg: e.message || '获取轮播图失败'
    }
  }
}