const app = getApp()
const BASE_URL = 'https://your-domain.com/api'

const interceptors = { request: [], response: [] }

function addInterceptor(type, fn) { interceptors[type].push(fn) }
function runInterceptors(type, config) {
  return interceptors[type].reduce((p, fn) => p.then(fn), Promise.resolve(config))
}

function request(options) {
  const config = {
    url: BASE_URL + options.url,
    method: options.method || 'GET',
    data: options.data || {},
    header: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + (app.globalData.token || ''),
      ...options.header
    },
    timeout: options.timeout || 30000
  }
  return runInterceptors('request', config).then(cfg => new Promise((resolve, reject) => {
    wx.request({
      ...cfg,
      success(res) {
        if (res.statusCode === 200) resolve(res.data)
        else if (res.statusCode === 401) {
          app.globalData.token = ''
          wx.redirectTo({ url: '/pages/login/login' })
          reject(new Error('登录过期'))
        } else {
          reject(new Error(res.data.message || '请求失败'))
        }
      },
      fail(err) { wx.showToast({ title: '网络异常', icon: 'none' }); reject(err) }
    })
  })).then(data => runInterceptors('response', data))
}

const http = {
  get(url, data, opt) { return request({ url, method: 'GET', data, ...opt }) },
  post(url, data, opt) { return request({ url, method: 'POST', data, ...opt }) },
  put(url, data, opt) { return request({ url, method: 'PUT', data, ...opt }) },
  del(url, data, opt) { return request({ url, method: 'DELETE', data, ...opt }) }
}

module.exports = { request, http, addInterceptor }
