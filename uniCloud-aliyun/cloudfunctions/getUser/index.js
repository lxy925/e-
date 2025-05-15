'use strict';

const jwt = require('./jwt.js');
const db = uniCloud.database();

exports.main = async (event, context) => {
  console.log("event:", event);
  const { user_id, type } = event.userInfo;
  // const refreshToken = event.refreshToken;
  console.log(event.userInfo)
console.log(user_id)
  if (!user_id) {
    return { code: 401, msg: '未提供Token' };
  }

  try {
    // 1. 验证主token
    let decoded = jwt.verifyToken(user_id);
    let openid = decoded.userId;
	console.log(decoded);
    console.log(openid, type);
    
    if (!openid) {
      return { code: 403, msg: 'Token无效' };
    }

    // 2. 获取用户数据
    let userInfo = await getUserFromDB(openid, type, user_id);
	userInfo.userInfo.user_id=user_id;
	if(type=="陪诊师"){
		userInfo.userInfo.moreInfo.user_id=user_id;
		userInfo.userInfo.accountInfo.user_id=user_id;
	}
	
	
    return { 
      code: 200,
      data: userInfo.userInfo 
    };

  } catch (err) {
   return { code: 401, msg: 'token过期，需重新登录' };
    
    // // 3. 使用refreshToken获取新token
    // const newTokenRes = await uniCloud.callFunction({
    //   name: 'refresh-token',
    //   data: { refreshToken }  // 注意这里要传对象
    // });
    // console.log("新token",newTokenRes.result.data.token)
    
    
    // 4. 验证新token并再次获取用户数据
 //    const newDecoded = jwt.verifyToken(newTokenRes.result.data.token);  // 确保使用正确的字段
 //    const newOpenid = newDecoded.uid;
 //    let newCatchUserInfo = await getUserFromDB(newOpenid, type, newTokenRes.result.data.token);
 //    newCatchUserInfo.userInfo.user_id=newTokenRes.result.data.token;
	// if(type=="陪诊师"){
	// 	console.log("重新获取用户数据后对数据加密",newCatchUserInfo.userInfo)
	// 	newCatchUserInfo.userInfo.moreInfo.user_id=newTokenRes.result.data.token;
	// 	newCatchUserInfo.userInfo.accountInfo.user_id=newTokenRes.result.data.token;
	// }
	
 //    return {
 //      code: 200,
 //      data:newCatchUserInfo.userInfo,
       
 //    };
  }
};

async function getUserFromDB(user_id, userType, token) {
  const usersCollection = db.collection('users');
  let query;
  
  if (userType === "陪诊师") {
    query = usersCollection.aggregate()
      .match({ user_id })
      .lookup({
        from: 'escorts',
        localField: 'user_id',
        foreignField: 'user_id',
        as: 'moreInfo'
      })
	  .lookup({
	    from: 'escort_account',
	    localField: 'user_id',
	    foreignField: 'user_id',
	    as: 'accountInfo'
	  })
      .unwind('$moreInfo')
	   .unwind('$accountInfo')
      .end();
  } else {
    query = usersCollection.where({ user_id }).get();
  }

  const res = await query;
  if (!res.data || res.data.length === 0) {
    throw new Error('未找到匹配的用户数据');
  }
  // 返回数据时不要加密原始数据
 
  const userInfo=res.data[0];
  console.log("获取的用户数据",userInfo)
  
  return {
    userInfo
   
  };
}