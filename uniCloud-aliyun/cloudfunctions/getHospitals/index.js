'use strict';
const db = uniCloud.database()

exports.main = async (event, context) => {
  try {
    const { page = 1, pageSize = 10 } = event
    
    const collection = db.collection('hospitals')
    const countResult = await collection.where({ status: 1 }).count()
    const total = countResult.total
    
    const res = await collection
      .where({
        status: 1
      })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .orderBy('createTime', 'desc')
      .get()
    
    return {
      code: 0,
      msg: 'success',
      data: {
        list: res.data,
        total,
        page,
        pageSize
      }
    }
  } catch (e) {
    console.error('获取医院列表失败：', e)
    return {
      code: -1,
      msg: e.message || '获取医院列表失败',
      data: null
    }
  }
}