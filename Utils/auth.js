// 获取 token
export function getToken() {
  return uni.getStorageSync('uni_id_token')
}

// 设置 token
export function setToken(token) {
  uni.setStorageSync('uni_id_token', token)
}

// 获取 refreshToken
export function getRefreshToken() {
  return uni.getStorageSync('uni_id_refresh_token')
}

// 设置 refreshToken
export function setRefreshToken(token) {
  uni.setStorageSync('uni_id_refresh_token', token)
}

// 清除 token
export function clearToken() {
  uni.removeStorageSync('uni_id_token')
  uni.removeStorageSync('uni_id_refresh_token')
}