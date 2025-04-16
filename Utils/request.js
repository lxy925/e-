import store from '@/store'
import { getRefreshToken, setToken } from '@/utils/auth'

let isRefreshing = false
let requests = []

// 创建请求实例
const instance = uniCloud.importObject('api-client', {
  customUI: false,
  errorOptions: {
    type: 'toast'
  }
})

// 请求拦截
instance.interceptor.request = async (config) => {
  const token = store.state.user.token
  if (token) {
    config.header = {
      ...config.header,
      'Authorization': `Bearer ${token}`
    }
  }
  return config
}

// 响应拦截
instance.interceptor.response = async (response) => {
  if (response.statusCode === 401) {
    if (!isRefreshing) {
      isRefreshing = true
      try {
        const newToken = await refreshToken()
        setToken(newToken)
        // 重新发送所有挂起的请求
        requests.forEach(cb => cb(newToken))
        requests = []
        return instance.request(response.config)
      } catch (e) {
        // 刷新失败跳转登录
        uni.redirectTo({ url: '/pages/userInfoDetail/userInfoDetail' })
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    } else {
      // 正在刷新中，将请求加入队列
      return new Promise(resolve => {
        requests.push((token) => {
          response.config.header.Authorization = `Bearer ${token}`
          resolve(instance.request(response.config))
        })
      })
    }
  }
  return response.data
}

export default instance