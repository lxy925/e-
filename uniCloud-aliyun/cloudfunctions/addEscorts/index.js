'use strict';
// 云函数 addEscort/index.js
exports.main = async (event, context) => {
  const db = uniCloud.database();
  const { name, age, gender, phone, city, idNumber, avatarList,  } = event;


  try {
    // 将数据存储到云数据库
    const result = await db.collection('escorts').add({
		user_id:3,
      name:name,
      age:age,
      gender:gender,
      phone:phone,
      address:city,
      card_id:idNumber,
      avatarUrl:avatarList,
      info_id:null
     
    });
console.log('Insert result:', result);
if (!result.id ) {
      throw new Error('Insert operation did not return a valid _id');
    }
   // 调用 addEscortMore 云函数
       const moreResult = await uniCloud.callFunction({
         name: 'addEscortMore',
         data: {
           // 传递需要存储到 escorts_more 表的数据
           moreData: {
            user_id:3,
			rating:0,
			order:0
           },
        }
       });
   console.log('Insert result:', moreResult);
      
   
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
