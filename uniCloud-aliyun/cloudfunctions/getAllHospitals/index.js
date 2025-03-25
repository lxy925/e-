const db = uniCloud.database();

exports.main = async (event, context) => {
  const { page = 1, pageSize = 20, keyword = '', city = null } = event;

  // 转义正则表达式的特殊字符
  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // 转义特殊字符
  }

  // 构造查询条件
  const conditions = {};

  if (keyword) {
    const escapedKeyword = escapeRegExp(keyword);
    conditions.$or = [
      { name: db.RegExp({ regexp: escapedKeyword, options: 'i' }) },
      { address: db.RegExp({ regexp: escapedKeyword, options: 'i' }) }
    ];
  }

  if (city) {
    const escapedCity = escapeRegExp(city);
    conditions.city = db.RegExp({ regexp: escapedCity, options: 'i' });
  }

  // 构造查询
  const query = db.collection('hospitals')
    .limit(pageSize)
    .skip((page - 1) * pageSize)
    .where(conditions);

  try {
    const result = await query.get();
    const total = await db.collection('hospitals').count();

    // 打印调试信息
    console.log('Query conditions:', JSON.stringify(conditions, null, 2));
    console.log('Query result:', JSON.stringify(result.data, null, 2));

    return {
      code: 0,
      data: result.data,
      total: total.total
    };
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    return {
      code: 1,
      message: 'Error fetching hospitals: ' + error.message
    };
  }
};