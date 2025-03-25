'use strict';
// 云函数 addEscortMore/index.js
exports.main = async (event, context) => {
  const db = uniCloud.database();
  const { moreData } = event;
  let result;
const type=moreData.type;
  try {
    // 将数据存储到云数据库
		
	if(type=="陪诊师"){
		result = await db.collection('escorts_more').where({
			user_id:moreData.user_id
			
		})
			
		.update({
			
			
			certificate: moreData.certificateList,
			
			
			provide_transport: moreData.provide_transport,
			self_introduction: moreData.self_introduction,
			familiar_hospitals: moreData.familiar_hospitals,
			familiar_departments: moreData.familiar_departments
		})
	}else{
		result = await db.collection('escorts_more').add(moreData);
	}
   

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
