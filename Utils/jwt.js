// utils/jwt.js
const jwt = require('jsonwebtoken')

const secret = 'fc9a8d7e4b4a2c1f0e3d2c7b6a5d4e3f2c110a9f8e7d6c1es4a3f2e1dee9b8a7'

module.exports = {
  generateToken(payload) {
    return jwt.sign(payload, secret, { expiresIn: '30d' })
  },
  
  // generateRefreshToken(payload) {
  //   return jwt.sign(payload, refreshSecret, { expiresIn: '30d' })
  // },
  
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, secret, {
        clockTolerance: 30 // 允许30秒时钟偏差
      })
      console.log('Token验证成功，有效期至:', new Date(decoded.exp * 1000))
      return decoded
    } catch (e) {
      console.error('Token验证失败详情:', {
        error: e.name,
        message: e.message,
        expiredAt: e.expiredAt,
        currentTime: new Date()
      })
      throw new Error(`token验证失败: ${e.message}`)
    }
  },
  

}