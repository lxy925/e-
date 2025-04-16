const jwt = require('../common/jwt');
const db = uniCloud.database();

exports.main = async (event, context) => {
  const { refreshToken } = event;
  
  if (!refreshToken) {
    return { code: 401, message: '未提供refreshToken' };
  }

  try {
    // 1. 验证refreshToken
    const decoded = jwt.verifyRefreshToken(refreshToken);
    // console.log(decoded)
    // 2. 检查refreshToken是否有效
    const record = await db.collection('user_tokens').where({
      userId: decoded.userId,
      token: refreshToken,
      type: 'refresh_token'
    }).get();
    
    if (!record.data.length) {
      return { code: 401, message: '无效的refreshToken' };
    }
    
    // 3. 生成新token
    const newToken = jwt.generateToken({
      uid: decoded.userId,
      role: decoded.role
    });
    
    return {
      code: 200,  // 统一使用200表示成功
      data: {
        token: newToken,
        expiresIn: 900
      }
    };
  } catch (e) {
    return {
      code: 401,
      message: e.message || 'refreshToken验证失败'
    };
  }
};