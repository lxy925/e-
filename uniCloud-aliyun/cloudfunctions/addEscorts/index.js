'use strict';
// 云函数 addEscort/index.js
exports.main = async (event, context) => {
  const db = uniCloud.database();
  const { name, age, gender, phone, city, idNumber, avatarList,  } = event;


  try {
    // 将数据存储到云数据库
    const result = await db.collection('escorts').add({
		user_id:2,
      name:name,
      age:age,
      gender:gender,
      phone:phone,
      address:city,
      card_id:idNumber,
      avatarUrl:avatarList,
      
     
    });

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
