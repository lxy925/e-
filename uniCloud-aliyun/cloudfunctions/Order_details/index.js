'use strict';
const db = uniCloud.database()

exports.main = async (event, context) => {
  try {
    console.log('获取图片')
    
    const DetailsImageCollection = db.collection('order_details')
    const res = await DetailsImageCollection
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
      msg: e.message || '获取图片失败'
    }
  }
}