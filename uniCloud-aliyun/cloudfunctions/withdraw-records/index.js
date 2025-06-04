'use strict';
const db = uniCloud.database();
const dbCmd = db.command;
const jwt = require('./jwt.js');
exports.main = async (event, context) => {
  const {accountInfo,page = 1, pageSize = 10, status } = event;
  // 参数校验
  // console.log(event)
  // if (!accountInfo || !status  ) {
  // 	return {
  // 		code: 400,
  // 		msg: '参数错误'
  // 	};
  // }
  console.log('status:',status)
   
   let openid;
   // 验证主token
   try {
   	let decoded = jwt.verifyToken(accountInfo.user_id);
	console.log("decoded",decoded)
   	openid = decoded.userId;
	console.log("openid",openid)
   	if (!openid) {
   		return {
   			code: 403,
   			msg: 'Token无效'
   		};
   	}
   } catch (err) {
   	return {
   		code: 401,
   		msg: err
   	};
   	
   }
    // 获取记录总数
    const countRes = await db.collection('withdraw_records')
      .where({
		  user_id:openid,
		  status
	  })
      .count();
    
    // 获取分页记录
    const recordsRes = await db.collection('withdraw_records')
      .where({
		  user_id:openid,
		  status
	  })
      .orderBy('create_time', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();
    
    return {
      code: 200,
      message: '获取成功',
      data: {
        list: recordsRes.data,
        total: countRes.total,
        page,
        pageSize
      }
    };
  
};