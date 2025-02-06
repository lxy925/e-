'use strict';
const db = uniCloud.database()

exports.main = async (event, context) => {
    const location = event.location // 从传入参数中获取 location 字符串
  try {
    console.log('开始获取陪诊师数据')
    
    const res = await db.collection('escorts')
    .aggregate()
    .match({
        address: location // 根据 location 进行匹配
    })
    .lookup({
      from: 'escorts_more', // 关联的表名
      localField: 'info_id', // escorts 表中的字段
      foreignField: 'info_id', // escorts_more 表中的字段
      as: 'moreInfo' // 输出的字段名
    })
    .unwind('$moreInfo') // 展开 moreInfo 数组
    .sort({
      'moreInfo.rating': -1 // 按照 rating 从大到小排序
    })
    .end()
    
    console.log('查询结果：', res)
    
    return {
        success: true,
        data: res
    }
  } catch (e) {
    console.error('错误：', e)
    return {
      code: -1,
      msg: e.message || '获取陪诊师集合失败'
    }
  }
}