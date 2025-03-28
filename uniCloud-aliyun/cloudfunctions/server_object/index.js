// server_object/index.js
const db = uniCloud.database(); // 获取数据库实例

exports.main = async (event, context) => {
  const {
    server_id, 
    name, 
    gender, 
    age, 
    phone, 
    relationship, 
    medicalInfo = '', // 默认值为空字符串
    uploadedImages = [], // 默认值为空数组
    userid,
    photo ,
	address// 添加服务对象照片
  } = event; // 从事件中获取数据

  // 数据验证（可选）
  if (!name || !gender || !age || !phone || !relationship || !userid||!address) {
    return {
      code: 1,
      message: '所有字段都是必填的',
    };
  }

  // 将数据插入到数据库
  try {
    const result = await db.collection('server_object').add({
      server_id,
      name,
      gender,
      age,
      phone,
      relationship,
      medicalInfo, // 允许为空
      uploadedImages, // 允许为空
      userid, // 添加用户ID
      photo, // 添加服务对象照片
	  address,
      createdAt: new Date(), // 添加创建时间
    });

    return {
      code: 0,
      message: '数据提交成功',
      data: result,
    };
  } catch (error) {
    console.error('数据库操作失败：', error);
    return {
      code: 2,
      message: '数据提交失败',
    };
  }
};