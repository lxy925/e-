// server_object/index.js
const db = uniCloud.database(); // 获取数据库实例

exports.main = async (event, context) => {
  const { name, gender, age, phone, relationship } = event; // 从事件中获取数据

  // 数据验证（可选）
  if (!name || !gender || !age || !phone || !relationship) {
    return {
      code: 1,
      message: '所有字段都是必填的',
    };
  }

  // 将数据插入到数据库
  try {
    const result = await db.collection('server_object').add({
      name,
      gender,
      age,
      phone,
      relationship,
      createdAt: new Date(), // 添加创建时间
    });

    return {
      code: 0,
      message: '数据提交成功',
      data: result,
    };
  } catch (error) {
    console.error('数据库操作失败：', error);
    console.error('传递的数据：', event); // 打印传递的数据
    return {
      code: 2,
      message: '数据提交失败',
    };
  }
};