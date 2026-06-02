# Builder Agent — 微信小程序构建指南

> Trae SOLO 模式专用 | 分模块自动构建 | 每模块：目标 → 文件清单 → 代码模板 → 验证方式

---

## 目录

1. [模块 1: 项目脚手架](#模块-1-项目脚手架)
2. [模块 2: 基础封装](#模块-2-基础封装)
3. [模块 3: 页面开发](#模块-3-页面开发)
4. [模块 4: 业务逻辑](#模块-4-业务逻辑)
5. [构建检查清单](#构建检查清单)

---

## 模块 1: 项目脚手架

### 目标
创建标准微信小程序目录结构，生成核心配置文件和代码规范配置。

### 文件清单

```
project/
├── app.js                    # 小程序入口
├── app.json                  # 全局配置
├── app.wxss                  # 全局样式
├── project.config.json       # 项目配置
├── sitemap.json              # 站点地图
├── .eslintrc.js              # ESLint 配置
├── .prettierrc               # Prettier 配置
├── .gitignore                # Git 忽略规则
├── TRAE.md                   # Trae 指令文件
├── .trae/
│   └── rules.md              # Trae 规则（与 TRAE.md 二选一）
├── utils/
│   └── util.js               # 工具函数（占位）
├── pages/
│   └── index/                # 首页（占位）
│       ├── index.js
│       ├── index.json
│       ├── index.wxml
│       └── index.wxss
├── components/               # 通用组件目录
├── images/                   # 静态图片目录
└── services/                 # 接口服务目录
```

### 代码模板

#### app.js

```javascript
// app.js — 小程序入口文件
App({
  /**
   * 小程序初始化
   */
  onLaunch() {
    // 检查更新
    this.checkUpdate()
    // 初始化登录态
    this.initAuth()
  },

  globalData: {
    userInfo: null,
    token: '',
    systemInfo: null
  },

  /**
   * 检查小程序版本更新
   */
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(() => {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(() => {
            wx.showModal({
              title: '更新提示',
              content: '新版本下载失败，请检查网络后重试'
            })
          })
        }
      })
    }
  },

  /**
   * 初始化登录态
   */
  async initAuth() {
    try {
      const { code } = await wx.login()
      // 将 code 发送到后端换取 token
      // const res = await request({ url: '/auth/login', data: { code } })
      // this.globalData.token = res.data.token
    } catch (err) {
      console.error('登录态初始化失败:', err)
    }
  }
})
```

#### app.json

```json
{
  "pages": [
    "pages/index/index"
  ],
  "window": {
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTitleText": "",
    "navigationBarTextStyle": "black",
    "backgroundColor": "#f5f5f5",
    "backgroundTextStyle": "dark"
  },
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#333333",
    "backgroundColor": "#ffffff",
    "borderStyle": "black",
    "list": []
  },
  "sitemapLocation": "sitemap.json",
  "lazyCodeLoading": "requiredComponents"
}
```

#### project.config.json

```json
{
  "description": "项目配置文件",
  "packOptions": {
    "ignore": [],
    "include": []
  },
  "setting": {
    "bundle": false,
    "userConfirmedBundleSwitch": false,
    "urlCheck": true,
    "scopeDataCheck": false,
    "coverView": true,
    "es6": true,
    "postcss": true,
    "compileHotReLoad": false,
    "lazyloadPlaceholderEnable": false,
    "preloadBackgroundData": false,
    "minified": true,
    "autoAudits": false,
    "newFeature": false,
    "uglifyFileName": false,
    "uploadWithSourceMap": true,
    "useIsolateContext": true,
    "nodeModules": false,
    "enhance": true,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "showShadowRootInWxmlPanel": true,
    "packNpmManually": false,
    "enableEngineNative": false,
    "packNpmRelationList": [],
    "minifyWXSS": true,
    "showES6CompileOption": false,
    "minifyWXML": true,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    }
  },
  "compileType": "miniprogram",
  "condition": {}
}
```

#### sitemap.json

```json
{
  "desc": "关于本文件的更多信息，请参考文档 https://developers.weixin.qq.com/miniprogram/dev/framework/sitemap.html",
  "rules": [
    {
      "action": "allow",
      "page": "*"
    }
  ]
}
```

#### .eslintrc.js

```javascript
module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: ['eslint:recommended'],
  globals: {
    wx: 'readonly',
    App: 'readonly',
    Page: 'readonly',
    Component: 'readonly',
    getApp: 'readonly',
    getCurrentPages: 'readonly',
    Behavior: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-throw-literal': 'error',
    'prefer-const': 'warn',
    'no-var': 'error',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'multi-line'],
    'no-multiple-empty-lines': ['warn', { max: 2 }],
    'semi': ['error', 'never']
  }
}
```

#### .prettierrc

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "none",
  "printWidth": 100,
  "tabWidth": 2,
  "endOfLine": "lf",
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "htmlWhitespaceSensitivity": "ignore"
}
```

#### .gitignore

```
node_modules/
miniprogram_npm/
.DS_Store
*.log
dist/
.tea/
```

### 验证方式
1. 检查所有文件是否已创建且内容完整
2. 使用微信开发者工具打开项目，确认无报错
3. ESLint 检查通过：`npx eslint .`

---

## 模块 2: 基础封装

### 目标
创建项目基础工具库和通用组件，为业务开发提供统一基础设施。

### 文件清单

```
utils/
├── request.js       # 请求封装（Promise + 拦截器）
├── auth.js          # 登录态管理
├── storage.js       # 缓存封装
├── util.js          # 通用工具函数
└── constants.js     # 常量定义

components/
├── empty/           # 空状态组件
│   ├── empty.js
│   ├── empty.json
│   ├── empty.wxml
│   └── empty.wxss
├── loading/         # 加载组件
│   ├── loading.js
│   ├── loading.json
│   ├── loading.wxml
│   └── loading.wxss
├── modal/           # 弹窗组件
│   ├── modal.js
│   ├── modal.json
│   ├── modal.wxml
│   └── modal.wxss
└── toast/           # 轻提示组件
    ├── toast.js
    ├── toast.json
    ├── toast.wxml
    └── toast.wxss
```

### 代码模板

#### utils/request.js

```javascript
/**
 * 请求封装 — Promise + 拦截器
 * 
 * 使用示例：
 *   import { request } from '../utils/request'
 *   const res = await request({ url: '/api/user/info', method: 'GET' })
 */

const BASE_URL = 'https://your-api-domain.com'
const TIMEOUT = 10000

// 请求拦截器队列
const requestInterceptors = []
// 响应拦截器队列
const responseInterceptors = []

/**
 * 添加请求拦截器
 * @param {Function} fulfilled - 请求处理函数
 * @param {Function} [rejected] - 请求错误处理函数
 */
function useRequestInterceptor(fulfilled, rejected) {
  requestInterceptors.push({ fulfilled, rejected })
}

/**
 * 添加响应拦截器
 * @param {Function} fulfilled - 响应处理函数
 * @param {Function} [rejected] - 响应错误处理函数
 */
function useResponseInterceptor(fulfilled, rejected) {
  responseInterceptors.push({ fulfilled, rejected })
}

/**
 * 运行拦截器链
 * @param {Array} interceptors - 拦截器队列
 * @param {*} data - 传入数据
 * @returns {Promise<*>}
 */
async function runInterceptors(interceptors, data) {
  let result = data
  for (const interceptor of interceptors) {
    try {
      result = await interceptor.fulfilled(result)
    } catch (err) {
      if (interceptor.rejected) {
        result = await interceptor.rejected(err)
      } else {
        throw err
      }
    }
  }
  return result
}

/**
 * 核心请求方法
 * @param {Object} options - 请求配置
 * @param {string} options.url - 请求地址（相对路径）
 * @param {string} [options.method='GET'] - 请求方法
 * @param {Object} [options.data] - 请求数据
 * @param {Object} [options.header] - 请求头
 * @param {boolean} [options.loading=true] - 是否显示加载提示
 * @param {boolean} [options.errorMessage=true] - 是否显示错误提示
 * @returns {Promise<Object>} 响应数据
 */
function request(options) {
  const {
    url,
    method = 'GET',
    data = {},
    header = {},
    loading = true,
    errorMessage = true
  } = options

  // 构造完整请求配置
  let config = {
    url: url.startsWith('http') ? url : BASE_URL + url,
    method,
    data,
    header: {
      'Content-Type': 'application/json',
      ...header
    },
    timeout: TIMEOUT
  }

  // 自动附加 token
  const token = wx.getStorageSync('token')
  if (token) {
    config.header.Authorization = `Bearer ${token}`
  }

  const showLoading = loading

  return new Promise(async (resolve, reject) => {
    if (showLoading) {
      wx.showLoading({ title: '加载中...', mask: true })
    }

    try {
      // 执行请求拦截器
      config = await runInterceptors(requestInterceptors, config)

      // 发起请求
      const response = await new Promise((res, rej) => {
        wx.request({
          ...config,
          success: res,
          fail: rej
        })
      })

      // 执行响应拦截器
      const result = await runInterceptors(responseInterceptors, response)

      if (showLoading) {
        wx.hideLoading()
      }

      // 业务状态码判断
      if (result.statusCode === 200) {
        const resData = result.data
        if (resData.code === 0 || resData.code === 200) {
          resolve(resData)
        } else {
          // 业务错误
          if (errorMessage) {
            wx.showToast({
              title: resData.message || '请求失败',
              icon: 'none',
              duration: 2000
            })
          }
          reject(resData)
        }
      } else if (result.statusCode === 401) {
        // 登录态过期
        handleTokenExpired()
        reject(result)
      } else {
        // HTTP 错误
        if (errorMessage) {
          wx.showToast({
            title: `请求错误(${result.statusCode})`,
            icon: 'none'
          })
        }
        reject(result)
      }
    } catch (err) {
      if (showLoading) {
        wx.hideLoading()
      }
      // 网络错误
      if (errorMessage) {
        wx.showToast({
          title: '网络异常，请重试',
          icon: 'none'
        })
      }
      reject(err)
    }
  })
}

/**
 * 处理 token 过期
 */
function handleTokenExpired() {
  wx.removeStorageSync('token')
  wx.showToast({
    title: '登录已过期，请重新登录',
    icon: 'none',
    duration: 2000
  })
  // 延迟跳转登录页
  setTimeout(() => {
    wx.redirectTo({ url: '/pages/login/login' })
  }, 1500)
}

// ============ 便捷方法 ============

/**
 * GET 请求
 */
function get(url, data = {}, options = {}) {
  return request({ url, method: 'GET', data, ...options })
}

/**
 * POST 请求
 */
function post(url, data = {}, options = {}) {
  return request({ url, method: 'POST', data, ...options })
}

/**
 * PUT 请求
 */
function put(url, data = {}, options = {}) {
  return request({ url, method: 'PUT', data, ...options })
}

/**
 * DELETE 请求
 */
function del(url, data = {}, options = {}) {
  return request({ url, method: 'DELETE', data, ...options })
}

/**
 * 文件上传
 * @param {string} url - 上传地址
 * @param {string} filePath - 本地文件路径
 * @param {Object} [formData] - 额外表单数据
 */
function upload(url, filePath, formData = {}) {
  const token = wx.getStorageSync('token')
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: url.startsWith('http') ? url : BASE_URL + url,
      filePath,
      name: 'file',
      header: token ? { Authorization: `Bearer ${token}` } : {},
      formData,
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (data.code === 0 || data.code === 200) {
            resolve(data)
          } else {
            reject(data)
          }
        } catch (err) {
          reject(err)
        }
      },
      fail: reject
    })
  })
}

// 注册默认请求拦截器：打印请求日志
useRequestInterceptor((config) => {
  console.log(`[Request] ${config.method} ${config.url}`)
  return config
})

// 注册默认响应拦截器：打印响应日志
useResponseInterceptor((response) => {
  console.log(`[Response] ${response.statusCode} ${response.config?.url || ''}`)
  return response
})

module.exports = {
  request,
  get,
  post,
  put,
  del,
  upload,
  useRequestInterceptor,
  useResponseInterceptor,
  BASE_URL
}
```

#### utils/auth.js

```javascript
/**
 * 登录态管理模块
 * 
 * 封装微信登录流程，管理 token 生命周期
 */

const { request, post } = require('./request')

/** Token 存储键名 */
const TOKEN_KEY = 'token'
/** 用户信息存储键名 */
const USER_INFO_KEY = 'userInfo'
/** Token 过期时间键名 */
const TOKEN_EXPIRE_KEY = 'tokenExpire'
/** Token 刷新阈值（提前 5 分钟刷新） */
const REFRESH_THRESHOLD = 5 * 60 * 1000

/**
 * 微信登录 — 获取 code 并换取 token
 * @param {boolean} [forceRefresh=false] - 是否强制刷新登录态
 * @returns {Promise<string>} token
 */
async function login(forceRefresh = false) {
  // 检查现有 token 是否有效
  if (!forceRefresh) {
    const token = getToken()
    if (token && !isTokenExpiring()) {
      return token
    }
  }

  try {
    // 获取微信登录 code
    const { code } = await wx.login()

    // 发送 code 到后端换取 token
    const res = await post('/auth/login', { code })

    if (res.data && res.data.token) {
      // 存储 token 和过期时间
      wx.setStorageSync(TOKEN_KEY, res.data.token)
      if (res.data.expireTime) {
        wx.setStorageSync(TOKEN_EXPIRE_KEY, res.data.expireTime)
      }
      // 存储用户信息
      if (res.data.userInfo) {
        wx.setStorageSync(USER_INFO_KEY, res.data.userInfo)
      }
      return res.data.token
    }

    throw new Error('登录返回数据异常')
  } catch (err) {
    console.error('登录失败:', err)
    throw err
  }
}

/**
 * 获取用户信息（需用户授权）
 * @returns {Promise<Object>} 用户信息
 */
async function getUserProfile() {
  try {
    const { userInfo } = await wx.getUserProfile({
      desc: '用于完善用户资料'
    })

    // 将用户信息同步到后端
    await post('/auth/updateProfile', userInfo)
    wx.setStorageSync(USER_INFO_KEY, userInfo)

    return userInfo
  } catch (err) {
    console.error('获取用户信息失败:', err)
    throw err
  }
}

/**
 * 获取存储的 token
 * @returns {string} token
 */
function getToken() {
  return wx.getStorageSync(TOKEN_KEY) || ''
}

/**
 * 检查 token 是否即将过期
 * @returns {boolean}
 */
function isTokenExpiring() {
  const expireTime = wx.getStorageSync(TOKEN_EXPIRE_KEY)
  if (!expireTime) return false
  return Date.now() + REFRESH_THRESHOLD >= expireTime
}

/**
 * 检查是否已登录
 * @returns {boolean}
 */
function isLoggedIn() {
  return !!getToken()
}

/**
 * 退出登录
 */
function logout() {
  wx.removeStorageSync(TOKEN_KEY)
  wx.removeStorageSync(TOKEN_EXPIRE_KEY)
  wx.removeStorageSync(USER_INFO_KEY)
  wx.reLaunch({ url: '/pages/index/index' })
}

/**
 * 获取存储的用户信息
 * @returns {Object|null}
 */
function getStoredUserInfo() {
  return wx.getStorageSync(USER_INFO_KEY) || null
}

module.exports = {
  login,
  getUserProfile,
  getToken,
  isTokenExpiring,
  isLoggedIn,
  logout,
  getStoredUserInfo
}
```

#### utils/storage.js

```javascript
/**
 * 缓存封装模块
 * 
 * 提供带过期时间的缓存读写，自动清理过期数据
 */

/**
 * 设置缓存
 * @param {string} key - 缓存键名
 * @param {*} value - 缓存值
 * @param {number} [expireMs] - 过期时间（毫秒），不传则永不过期
 */
function set(key, value, expireMs) {
  const data = {
    value,
    timestamp: Date.now(),
    expire: expireMs ? Date.now() + expireMs : null
  }
  wx.setStorageSync(key, JSON.stringify(data))
}

/**
 * 获取缓存
 * @param {string} key - 缓存键名
 * @param {*} [defaultValue=null] - 缓存不存在或过期时的默认值
 * @returns {*} 缓存值
 */
function get(key, defaultValue = null) {
  try {
    const raw = wx.getStorageSync(key)
    if (!raw) return defaultValue

    const data = JSON.parse(raw)

    // 检查是否过期
    if (data.expire && Date.now() > data.expire) {
      wx.removeStorageSync(key)
      return defaultValue
    }

    return data.value
  } catch (err) {
    console.error(`读取缓存失败 [${key}]:`, err)
    return defaultValue
  }
}

/**
 * 删除缓存
 * @param {string} key - 缓存键名
 */
function remove(key) {
  wx.removeStorageSync(key)
}

/**
 * 清除所有缓存（保留 token 等关键数据）
 * @param {string[]} [preserveKeys=['token', 'userInfo']] - 需要保留的键名
 */
function clear(preserveKeys = ['token', 'userInfo']) {
  const { keys } = wx.getStorageInfoSync()
  keys.forEach((key) => {
    if (!preserveKeys.includes(key)) {
      wx.removeStorageSync(key)
    }
  })
}

/**
 * 获取缓存信息
 * @returns {Object} { keys, currentSize, limitSize }
 */
function getInfo() {
  return wx.getStorageInfoSync()
}

/**
 * 清理所有过期缓存
 * @returns {number} 清理的条目数
 */
function clearExpired() {
  const { keys } = wx.getStorageInfoSync()
  let count = 0
  keys.forEach((key) => {
    try {
      const raw = wx.getStorageSync(key)
      if (!raw) return
      const data = JSON.parse(raw)
      if (data.expire && Date.now() > data.expire) {
        wx.removeStorageSync(key)
        count++
      }
    } catch {
      // 非 storage.js 写入的数据，跳过
    }
  })
  return count
}

module.exports = {
  set,
  get,
  remove,
  clear,
  getInfo,
  clearExpired
}
```

#### utils/constants.js

```javascript
/**
 * 常量定义
 */

// 接口基础地址
const API_BASE_URL = 'https://your-api-domain.com'

// 分页默认配置
const PAGE_SIZE = 10
const PAGE_DEFAULT = 1

// 缓存过期时间
const CACHE_EXPIRE = {
  SHORT: 5 * 60 * 1000,      // 5 分钟
  MEDIUM: 30 * 60 * 1000,    // 30 分钟
  LONG: 24 * 60 * 60 * 1000, // 24 小时
  DAY: 24 * 60 * 60 * 1000   // 1 天
}

// HTTP 状态码
const HTTP_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
}

// 业务状态码（与后端约定）
const BIZ_CODE = {
  SUCCESS: 0,
  TOKEN_EXPIRED: 10001,
  PARAM_ERROR: 20001,
  NOT_FOUND: 20002,
  SERVER_ERROR: 50000
}

module.exports = {
  API_BASE_URL,
  PAGE_SIZE,
  PAGE_DEFAULT,
  CACHE_EXPIRE,
  HTTP_STATUS,
  BIZ_CODE
}
```

#### components/empty/ — 空状态组件

**empty.json**
```json
{
  "component": true
}
```

**empty.js**
```javascript
Component({
  properties: {
    // 提示文字
    message: {
      type: String,
      value: '暂无数据'
    },
    // 图片类型: network | data | search | cart
    type: {
      type: String,
      value: 'data'
    },
    // 按钮文字（为空则不显示按钮）
    buttonText: {
      type: String,
      value: ''
    }
  },

  methods: {
    /** 按钮点击事件 */
    onButtonClick() {
      this.triggerEvent('buttonclick')
    }
  }
})
```

**empty.wxml**
```xml
<view class="empty-container">
  <image 
    class="empty-image" 
    src="/images/empty-{{type}}.png" 
    mode="aspectFit"
    wx:if="{{type}}"
  />
  <view class="empty-message">{{message}}</view>
  <view 
    class="empty-button" 
    wx:if="{{buttonText}}" 
    bindtap="onButtonClick"
  >
    {{buttonText}}
  </view>
</view>
```

**empty.wxss**
```css
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-image {
  width: 240rpx;
  height: 240rpx;
  margin-bottom: 32rpx;
}

.empty-message {
  font-size: 28rpx;
  color: #999;
  line-height: 1.6;
}

.empty-button {
  margin-top: 32rpx;
  padding: 16rpx 48rpx;
  font-size: 28rpx;
  color: #fff;
  background-color: #07c160;
  border-radius: 44rpx;
}
```

#### components/loading/ — 加载组件

**loading.json**
```json
{
  "component": true
}
```

**loading.js**
```javascript
Component({
  properties: {
    // 加载提示文字
    text: {
      type: String,
      value: '加载中...'
    },
    // 是否全屏遮罩
    fullScreen: {
      type: Boolean,
      value: false
    }
  }
})
```

**loading.wxml**
```xml
<view class="loading-container {{fullScreen ? 'loading-fullscreen' : ''}}">
  <view class="loading-spinner"></view>
  <view class="loading-text" wx:if="{{text}}">{{text}}</view>
</view>
```

**loading.wxss**
```css
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
}

.loading-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 999;
}

.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid #e0e0e0;
  border-top-color: #07c160;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  margin-top: 20rpx;
  font-size: 26rpx;
  color: #999;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

#### components/modal/ — 弹窗组件

**modal.json**
```json
{
  "component": true
}
```

**modal.js**
```javascript
Component({
  properties: {
    // 是否显示
    show: {
      type: Boolean,
      value: false
    },
    // 标题
    title: {
      type: String,
      value: '提示'
    },
    // 内容
    content: {
      type: String,
      value: ''
    },
    // 确认按钮文字
    confirmText: {
      type: String,
      value: '确定'
    },
    // 取消按钮文字
    cancelText: {
      type: String,
      value: '取消'
    },
    // 是否显示取消按钮
    showCancel: {
      type: Boolean,
      value: true
    }
  },

  methods: {
    /** 确认 */
    onConfirm() {
      this.triggerEvent('confirm')
    },
    /** 取消 */
    onCancel() {
      this.triggerEvent('cancel')
    },
    /** 阻止冒泡 */
    noop() {}
  }
})
```

**modal.wxml**
```xml
<view class="modal-mask" wx:if="{{show}}" bindtap="onCancel">
  <view class="modal-container" catchtap="noop">
    <view class="modal-title" wx:if="{{title}}">{{title}}</view>
    <view class="modal-content">{{content}}</view>
    <view class="modal-footer">
      <view 
        class="modal-btn modal-btn-cancel" 
        wx:if="{{showCancel}}" 
        bindtap="onCancel"
      >
        {{cancelText}}
      </view>
      <view class="modal-btn modal-btn-confirm" bindtap="onConfirm">
        {{confirmText}}
      </view>
    </view>
  </view>
</view>
```

**modal.wxss**
```css
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-container {
  width: 580rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.modal-title {
  padding: 48rpx 48rpx 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  text-align: center;
  color: #333;
}

.modal-content {
  padding: 16rpx 48rpx 48rpx;
  font-size: 28rpx;
  line-height: 1.6;
  color: #666;
  text-align: center;
}

.modal-footer {
  display: flex;
  border-top: 1rpx solid #eee;
}

.modal-btn {
  flex: 1;
  padding: 28rpx 0;
  font-size: 32rpx;
  text-align: center;
}

.modal-btn-cancel {
  color: #999;
  border-right: 1rpx solid #eee;
}

.modal-btn-confirm {
  color: #07c160;
  font-weight: 500;
}
```

#### components/toast/ — 轻提示组件

**toast.json**
```json
{
  "component": true
}
```

**toast.js**
```javascript
Component({
  properties: {
    // 是否显示
    show: {
      type: Boolean,
      value: false
    },
    // 提示文字
    message: {
      type: String,
      value: ''
    },
    // 类型: success | error | info | warning
    type: {
      type: String,
      value: 'info'
    },
    // 显示时长（毫秒）
    duration: {
      type: Number,
      value: 2000
    }
  },

  observers: {
    'show': function(val) {
      if (val) {
        this._timer && clearTimeout(this._timer)
        this._timer = setTimeout(() => {
          this.triggerEvent('close')
        }, this.data.duration)
      }
    }
  },

  lifetimes: {
    detached() {
      this._timer && clearTimeout(this._timer)
    }
  }
})
```

**toast.wxml**
```xml
<view class="toast-container {{show ? 'toast-show' : ''}}" wx:if="{{show}}">
  <view class="toast-content toast-{{type}}">
    <image 
      class="toast-icon" 
      wx:if="{{type !== 'info'}}"
      src="/images/icon-{{type}}.png" 
    />
    <view class="toast-message">{{message}}</view>
  </view>
</view>
```

**toast.wxss**
```css
.toast-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2000;
  opacity: 0;
  transition: opacity 0.3s;
}

.toast-show {
  opacity: 1;
}

.toast-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 48rpx;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 16rpx;
  min-width: 200rpx;
}

.toast-icon {
  width: 56rpx;
  height: 56rpx;
  margin-bottom: 16rpx;
}

.toast-message {
  font-size: 28rpx;
  color: #fff;
  text-align: center;
  line-height: 1.5;
}
```

### 验证方式
1. 所有工具函数模块可正常 `require` 引入
2. 通用组件在页面中注册后可正常渲染
3. request.js 在开发者工具 Network 中可见请求拦截日志

---

## 模块 3: 页面开发

### 目标
按 `app.json` 的 `pages` 顺序逐页生成，每个页面包含完整的四个文件。

### 文件清单（以单页面为例）

```
pages/{page-name}/
├── {page-name}.js      # 页面逻辑
├── {page-name}.json    # 页面配置
├── {page-name}.wxml    # 页面模板
└── {page-name}.wxss    # 页面样式
```

### 页面生成流程

1. **读取 app.json** — 获取 `pages` 数组
2. **按顺序逐页生成** — 确保首页（pages[0]）最先创建
3. **分析页面间跳转关系** — 从需求中提取导航逻辑
4. **生成每个页面** — 四个文件完整输出

### 代码模板

#### 页面 JS 模板

```javascript
/**
 * @description {页面描述}
 */
const { request, get, post } = require('../../utils/request')

Page({
  /** 页面数据 */
  data: {
    loading: true,         // 加载状态
    list: [],              // 列表数据
    page: 1,               // 当前页码
    pageSize: 10,          // 每页条数
    hasMore: true,         // 是否有更多数据
    isEmpty: false         // 是否为空
  },

  /** 页面加载（仅首次） */
  onLoad(options) {
    this.fetchData()
  },

  /** 页面显示（每次） */
  onShow() {},

  /** 页面隐藏 */
  onHide() {},

  /** 页面卸载 */
  onUnload() {},

  /** 下拉刷新 */
  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true })
    this.fetchData().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  /** 触底加载更多 */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 })
      this.fetchData(true)
    }
  },

  /**
   * 获取数据
   * @param {boolean} [append=false] - 是否追加模式
   */
  async fetchData(append = false) {
    if (!append) {
      this.setData({ loading: true })
    }

    try {
      const res = await get('/api/{endpoint}', {
        page: this.data.page,
        pageSize: this.data.pageSize
      })

      const newList = res.data.list || []
      this.setData({
        list: append ? [...this.data.list, ...newList] : newList,
        hasMore: newList.length >= this.data.pageSize,
        isEmpty: !append && newList.length === 0,
        loading: false
      })
    } catch (err) {
      console.error('获取数据失败:', err)
      this.setData({ loading: false })
    }
  },

  /**
   * 跳转到详情页
   * @param {Object} e - 事件对象
   */
  onItemTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  }
})
```

#### 页面 JSON 模板

```json
{
  "navigationBarTitleText": "{页面标题}",
  "enablePullDownRefresh": true,
  "usingComponents": {}
}
```

#### 页面 WXML 模板

```xml
<!-- 页面: {页面名称} -->
<view class="page-container">
  <!-- 加载态 -->
  <loading wx:if="{{loading}}" text="加载中..." />

  <!-- 空状态 -->
  <empty 
    wx:elif="{{isEmpty}}" 
    message="暂无数据" 
    type="data"
    buttonText="刷新重试"
    bind:buttonclick="fetchData"
  />

  <!-- 列表内容 -->
  <block wx:else>
    <view 
      class="list-item" 
      wx:for="{{list}}" 
      wx:key="id"
      data-id="{{item.id}}"
      bindtap="onItemTap"
    >
      <view class="item-title">{{item.title}}</view>
      <view class="item-desc">{{item.desc}}</view>
    </view>

    <!-- 加载更多 -->
    <view class="load-more" wx:if="{{hasMore}}">
      <loading text="加载更多..." />
    </view>
    <view class="no-more" wx:elif="{{list.length > 0}}">
      — 没有更多了 —
    </view>
  </block>
</view>
```

#### 页面 WXSS 模板

```css
/* 页面: {页面名称} */
.page-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: env(safe-area-inset-bottom);
}

.list-item {
  margin: 20rpx;
  padding: 32rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.item-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

.item-desc {
  font-size: 26rpx;
  color: #999;
  line-height: 1.5;
}

.load-more {
  padding: 40rpx 0;
}

.no-more {
  padding: 40rpx 0;
  text-align: center;
  font-size: 24rpx;
  color: #ccc;
}
```

### TabBar 页面特殊处理

TabBar 页面使用 `wx.switchTab` 跳转，不支持 `onLoad` 的 `options` 参数传值：
- 使用全局变量 `getApp().globalData` 传递数据
- 或在 `onShow` 中获取最新数据

### 页面跳转关系

| API | 场景 | 返回 |
|-----|------|------|
| `wx.navigateTo` | 普通页面跳转 | ✅ 可返回 |
| `wx.redirectTo` | 替换当前页面 | ❌ 不可返回 |
| `wx.switchTab` | 跳转 TabBar 页 | ❌ 不可返回 |
| `wx.reLaunch` | 重启到某页面 | ❌ 不可返回 |
| `wx.navigateBack` | 返回上一页 | — |

### 验证方式
1. 每个页面在开发者工具中可正常打开，无白屏
2. 页面跳转逻辑正确，无死循环
3. 下拉刷新和触底加载功能正常
4. 空状态和加载态展示正确

---

## 模块 4: 业务逻辑

### 目标
对接后端接口，实现数据流转和状态管理。

### 文件清单

```
services/
├── user.js            # 用户相关接口
├── {module}.js        # 其他业务模块接口
└── index.js           # 接口统一导出
```

### 代码模板

#### services/user.js

```javascript
/**
 * 用户相关接口
 */
const { get, post, put } = require('../utils/request')

/**
 * 获取用户信息
 * @returns {Promise<Object>}
 */
function getUserInfo() {
  return get('/user/info')
}

/**
 * 更新用户信息
 * @param {Object} data - 用户信息
 * @returns {Promise<Object>}
 */
function updateUserInfo(data) {
  return put('/user/info', data)
}

/**
 * 获取用户设置
 * @returns {Promise<Object>}
 */
function getUserSettings() {
  return get('/user/settings')
}

/**
 * 更新用户设置
 * @param {Object} data - 设置数据
 * @returns {Promise<Object>}
 */
function updateUserSettings(data) {
  return put('/user/settings', data)
}

module.exports = {
  getUserInfo,
  updateUserInfo,
  getUserSettings,
  updateUserSettings
}
```

#### services/index.js

```javascript
/**
 * 接口统一导出
 * 
 * 使用示例：
 *   const { userService } = require('../services')
 *   const res = await userService.getUserInfo()
 */

const userService = require('./user')
// const orderService = require('./order')
// const productService = require('./product')

module.exports = {
  userService
  // orderService,
  // productService
}
```

### 状态管理方案

微信小程序推荐使用 **全局数据 + 页面间通信** 的轻量方案：

```
App.globalData ←→ Page.data ←→ Component.properties
     ↑                              ↓
     └──── 事件总线 / Storage ───────┘
```

#### 简易事件总线（utils/eventBus.js）

```javascript
/**
 * 简易事件总线 — 跨页面/组件通信
 */

const events = {}

/**
 * 监听事件
 * @param {string} event - 事件名
 * @param {Function} callback - 回调函数
 * @returns {Function} 取消监听函数
 */
function on(event, callback) {
  if (!events[event]) {
    events[event] = []
  }
  events[event].push(callback)

  // 返回取消监听函数
  return () => off(event, callback)
}

/**
 * 取消监听
 * @param {string} event - 事件名
 * @param {Function} [callback] - 指定回调，不传则移除该事件所有监听
 */
function off(event, callback) {
  if (!events[event]) return
  if (callback) {
    events[event] = events[event].filter((cb) => cb !== callback)
  } else {
    delete events[event]
  }
}

/**
 * 触发事件
 * @param {string} event - 事件名
 * @param {...*} args - 传递参数
 */
function emit(event, ...args) {
  if (!events[event]) return
  events[event].forEach((callback) => {
    try {
      callback(...args)
    } catch (err) {
      console.error(`事件处理错误 [${event}]:`, err)
    }
  })
}

/**
 * 一次性监听
 * @param {string} event - 事件名
 * @param {Function} callback - 回调函数
 */
function once(event, callback) {
  const wrappedCallback = (...args) => {
    off(event, wrappedCallback)
    callback(...args)
  }
  on(event, wrappedCallback)
}

module.exports = {
  on,
  off,
  emit,
  once
}
```

### 数据流转规范

1. **接口调用**：统一通过 `services/` 模块调用，页面不直接使用 `request`
2. **数据缓存**：接口返回数据按需缓存到 `storage`，设置合理过期时间
3. **页面间传值**：
   - 简单参数 → URL query（`?id=xxx&type=yyy`）
   - 复杂对象 → `globalData` 或 `eventBus`
   - 持久化数据 → `storage`
4. **数据更新通知**：使用 `eventBus.emit('dataUpdated', { type, id })` 通知相关页面

### 验证方式
1. 接口模块可正常 `require`，函数签名与后端文档一致
2. 数据在页面间正确流转，无数据丢失
3. 事件总线消息可达，无内存泄漏（页面卸载时取消监听）

---

## 构建检查清单

每个模块构建完成后，执行以下检查：

- [ ] 所有文件已创建，无遗漏
- [ ] 文件编码为 UTF-8，无乱码
- [ ] `require` 路径正确，无引用错误
- [ ] 组件 `usingComponents` 已在页面 JSON 中注册
- [ ] `app.json` 的 `pages` 包含所有新增页面
- [ ] ESLint 检查通过
- [ ] 开发者工具编译无报错
- [ ] 真机预览无白屏/样式异常
