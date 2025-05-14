'use strict';
const jwt = require('../common/jwt.js');
const db = uniCloud.database();

exports.main = async (event, context) => {
  console.log("event:", event);
  const { user_id, type } = event.userInfo;
  const refreshToken = event.refreshToken;

  if (!user_id) {
    return { code: 401, msg: '未提供Token' };
  }

  try {
    // 1. 验证主token
    let decoded = jwt.verifyToken(user_id);
    let openid = decoded.userId;
    console.log(openid, type);
    
    if (!openid) {
      return { code: 403, msg: 'Token无效' };
    }

    // 2. 获取用户数据
    let userInfo = await getUserFromDB(openid, type, user_id);
    return { 
      code: 200,
      data: userInfo 
    };

  } catch (err) {
    console.error('需要更新token:', err);
    
    // 3. 使用refreshToken获取新token
    const newTokenRes = await uniCloud.callFunction({
      name: 'refresh-token',
      data: { refreshToken }  // 注意这里要传对象
    });
    console.log(newTokenRes.result.data.token)
    if (newTokenRes.code === 401) {
      return { code: 401, msg: 'refreshToken过期，需重新登录' };
    }
    
    // 4. 验证新token并获取用户数据
	// console.log("生成的refreshToken",newTokenRes.result.data.token)
    const newDecoded = jwt.verifyToken(newTokenRes.result.data.token);  // 确保使用正确的字段
	// console.log(newDecoded)
    const newOpenid = newDecoded.uid;
    const userInfo = await getUserFromDB(newOpenid, type, newTokenRes.result.data.token);
    
    return {
      code: 200,
      data:{
	  userInfo,
      newToken: newTokenRes.result.data.token  }// 返回新token给客户端
    };
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
      .unwind('$moreInfo')
      .end();
  } else {
    query = usersCollection.where({ user_id }).get();
  }

  const res = await query;
  if (!res.data || res.data.length === 0) {
    throw new Error('未找到匹配的用户数据');
  }
  console.log(res.data[0])
  const userInfo=res.data[0];
  console.log(token)
  userInfo.user_id=token;
  console.log(userInfo)
  // 返回数据时不要修改原始数据
  return {
    userInfo
   
  };
}