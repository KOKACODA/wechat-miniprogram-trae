# Reviewer Agent — 微信小程序代码审查指南

> Trae SOLO 模式专用 | 自动化代码审查 | 输出格式化问题列表

---

## 目录

1. [审查流程](#审查流程)
2. [检查项清单](#检查项清单)
3. [严重程度定义](#严重程度定义)
4. [输出格式](#输出格式)
5. [自动修复能力](#自动修复能力)

---

## 审查流程

```
开始审查
   │
   ├── 1. 扫描项目结构 → 检查目录规范性
   │
   ├── 2. 逐文件审查 → 按检查项清单逐项检查
   │
   ├── 3. 汇总问题 → 按严重程度排序
   │
   ├── 4. 输出审查报告 → 格式化问题列表
   │
   └── 5. 自动修复 → 可自动修复的问题直接修复
```

### Trae 自动审查触发条件
- 代码提交前（Builder 阶段完成后自动触发）
- 用户要求审查（`review` / `审查` / `检查代码`）
- 新页面/组件创建后
- 每日定时审查（可选）

---

## 检查项清单

### 1. 目录结构规范性

| 检查项 | 说明 | 严重程度 |
|--------|------|---------|
| 目录结构是否符合规范 | pages / components / utils / services / images 分层清晰 | ⚠️ Warning |
| 页面目录是否完整 | 每个页面目录包含 .js / .json / .wxml / .wxss 四个文件 | 🔴 Error |
| 组件目录是否完整 | 每个组件目录包含 .js / .json / .wxml / .wxss 四个文件 | 🔴 Error |
| 文件命名是否一致 | 页面/组件目录名与内部文件名一致 | ⚠️ Warning |
| 图片资源是否合理 | 本地图片 < 200KB，大图使用 CDN | 💡 Info |

**标准目录结构：**
```
project/
├── app.js, app.json, app.wxss
├── project.config.json
├── sitemap.json
├── utils/           ← 工具库
├── services/        ← 接口服务
├── components/      ← 通用组件
├── pages/           ← 页面
├── images/          ← 静态图片
└── subpackages/     ← 分包（如有）
```

**Trae 检测方式：** 读取 `app.json` 获取 pages 列表，检查每个页面目录文件完整性。

---

### 2. 命名规范

| 检查项 | 正确示例 | 错误示例 | 严重程度 |
|--------|---------|---------|---------|
| 文件名：kebab-case | `user-profile` | `userProfile`, `UserProfile` | ⚠️ Warning |
| 变量/函数：camelCase | `getUserInfo` | `get_user_info`, `GetUserInfo` | ⚠️ Warning |
| 常量：UPPER_SNAKE_CASE | `API_BASE_URL` | `apiBaseUrl`, `api_base_url` | 💡 Info |
| 组件名：PascalCase | `UserProfile` | `user-profile`, `userProfile` | ⚠️ Warning |
| 自定义事件：kebab-case | `bind:item-click` | `bind:itemClick` | 💡 Info |

**Trae 检测方式：** 使用正则扫描 `.js` 和 `.wxml` 文件中的标识符。

---

### 3. 组件 Props 类型检查

| 检查项 | 说明 | 严重程度 |
|--------|------|---------|
| properties 是否定义 type | 所有 properties 必须声明 type | 🔴 Error |
| properties 是否有默认值 | 建议为 properties 设置 value | ⚠️ Warning |
| properties 是否有 observer | 复杂类型建议使用 observers 替代 observer | 💡 Info |
| 组件是否声明 component: true | .json 中必须设置 `"component": true` | 🔴 Error |

**错误示例：**
```javascript
// ❌ 缺少 type 定义
properties: {
  title: '默认标题'
}

// ✅ 正确写法
properties: {
  title: {
    type: String,
    value: '默认标题'
  }
}
```

**Trae 检测方式：** 扫描 `components/` 下所有 `.js` 文件的 `properties` 定义。

---

### 4. 请求错误处理完整性

| 检查项 | 说明 | 严重程度 |
|--------|------|---------|
| 异步操作是否有 try-catch | 所有 async 函数必须 try-catch | 🔴 Error |
| 请求失败是否有用户提示 | 网络错误/业务错误需展示提示 | 🔴 Error |
| 401 是否有重新登录处理 | token 过期需跳转登录 | 🔴 Error |
| 请求是否有超时设置 | 建议设置 timeout（默认 10s） | ⚠️ Warning |
| 并发请求是否有竞态处理 | 多次请求可能导致数据覆盖 | ⚠️ Warning |

**常见问题：**
```javascript
// ❌ 缺少错误处理
async fetchData() {
  const res = await get('/api/data')
  this.setData({ list: res.data })
}

// ✅ 完整错误处理
async fetchData() {
  try {
    const res = await get('/api/data')
    this.setData({ list: res.data, loading: false })
  } catch (err) {
    console.error('获取数据失败:', err)
    this.setData({ loading: false, error: true })
    wx.showToast({ title: '加载失败', icon: 'none' })
  }
}
```

**Trae 检测方式：** 扫描 `.js` 文件中的 `await` 调用，检查是否在 `try-catch` 内。

---

### 5. 隐私合规

| 检查项 | 说明 | 严重程度 |
|--------|------|---------|
| 用户信息收集是否有声明 | `getUserProfile` 调用前需弹窗说明用途 | 🔴 Error |
| 位置信息是否有使用说明 | `getLocation` 需在 `app.json` 声明 `requiredPrivateInfos` | 🔴 Error |
| 隐私协议是否配置 | `app.json` 需配置 `__usePrivacyCheck__` | 🔴 Error |
| 敏感信息是否明文存储 | 禁止明文存储密码、身份证号等 | 🔴 Error |
| 第三方数据共享是否有说明 | 数据共享需在隐私协议中声明 | ⚠️ Warning |

**app.json 隐私配置：**
```json
{
  "__usePrivacyCheck__": true,
  "requiredPrivateInfos": [
    "getLocation",
    "chooseLocation",
    "chooseAddress"
  ],
  "permission": {
    "scope.userLocation": {
      "desc": "你的位置信息将用于小程序位置接口的效果展示"
    }
  }
}
```

**Trae 检测方式：** 扫描 `app.json` 和 `.js` 文件中的隐私 API 调用。

---

### 6. 性能问题

| 检查项 | 说明 | 严重程度 |
|--------|------|---------|
| setData 数据量过大 | 单次 setData 数据 > 256KB | 🔴 Error |
| setData 频率过高 | 1 秒内 setData 超过 5 次 | 🔴 Error |
| setData 传递无用数据 | 传递了页面不使用的字段 | ⚠️ Warning |
| 列表渲染缺少 wx:key | `wx:for` 必须设置 `wx:key` | 🔴 Error |
| 大列表未分页 | 列表数据 > 100 条未分页加载 | ⚠️ Warning |
| 图片未设置懒加载 | 非首屏图片未设置 `lazy-load` | ⚠️ Warning |
| 图片未设置 mode | image 组件必须设置 mode 属性 | ⚠️ Warning |
| WXML 层级过深 | 嵌套层级 > 10 层 | 💡 Info |
| 频繁调用 wx.getSystemInfo | 建议全局缓存一次 | 💡 Info |

**setData 优化示例：**
```javascript
// ❌ 传递整个列表
this.setData({
  list: this.data.list.concat(newItems)
})

// ✅ 只传递新增数据
const addData = {}
newItems.forEach((item, index) => {
  addData[`list[${this.data.list.length + index}]`] = item
})
this.setData(addData)
```

**Trae 检测方式：**
- setData 频率：扫描 `.js` 文件中 `setData` 调用
- wx:key：扫描 `.wxml` 文件中 `wx:for` 是否配套 `wx:key`
- 图片懒加载：扫描 `.wxml` 中 `image` 组件属性

---

### 7. 安全问题

| 检查项 | 说明 | 严重程度 |
|--------|------|---------|
| token 存储方式 | 禁止明文存储在 URL / globalData | 🔴 Error |
| 用户输入是否校验 | 表单输入必须前端校验 | 🔴 Error |
| XSS 风险 | rich-text / wxs 渲染需防注入 | 🔴 Error |
| 敏感接口是否鉴权 | 用户相关接口必须传 token | 🔴 Error |
| 域名是否白名单 | request 域名必须在后台配置 | ⚠️ Warning |
| 代码中是否有硬编码密钥 | 禁止在代码中写 API Key / Secret | 🔴 Error |
| HTTPS 强制 | 所有网络请求必须 HTTPS | 🔴 Error |

**输入校验示例：**
```javascript
// ❌ 无校验
async onSubmit() {
  await post('/api/submit', { phone: this.data.phone })
}

// ✅ 前端校验
async onSubmit() {
  const { phone, name } = this.data
  
  if (!name || name.trim().length === 0) {
    return wx.showToast({ title: '请输入姓名', icon: 'none' })
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return wx.showToast({ title: '手机号格式错误', icon: 'none' })
  }
  
  await post('/api/submit', { phone, name: name.trim() })
}
```

**Trae 检测方式：**
- 硬编码密钥：正则匹配 `api[_-]?key|secret|password|token\s*[:=]`
- 输入校验：扫描表单提交函数是否有校验逻辑

---

### 8. 可访问性

| 检查项 | 说明 | 严重程度 |
|--------|------|---------|
| 图片是否有 aria-label | 装饰性图片设置 `aria-role="none"` | 💡 Info |
| 可点击区域是否足够大 | 最小点击区域 44×44pt | 💡 Info |
| 颜色对比度是否足够 | 文字与背景对比度 ≥ 4.5:1 | 💡 Info |
| 表单是否有 label | 输入框关联说明文字 | 💡 Info |

---

## 严重程度定义

| 级别 | 图标 | 含义 | 处理方式 |
|------|------|------|---------|
| 🔴 Error | 严重 | 必须修复，否则无法通过审核或存在安全隐患 | 阻断构建 |
| ⚠️ Warning | 警告 | 建议修复，影响性能或可维护性 | 警告提示 |
| 💡 Info | 建议 | 最佳实践，不影响功能 | 仅提示 |

---

## 输出格式

```
## 审查报告

### 统计
- 总文件数: {n}
- 🔴 Error: {n}  ⚠️ Warning: {n}  💡 Info: {n}

### 🔴 Error（必须修复）

[🔴] pages/index/index.js:42 — 缺少 try-catch 包裹异步操作 — 添加 try-catch 并处理错误
[🔴] components/modal/modal.js:15 — properties 缺少 type 定义 — 为所有 properties 添加 type 字段

### ⚠️ Warning（建议修复）

[⚠️] pages/list/list.wxml:28 — wx:for 缺少 wx:key — 添加 wx:key="id"
[⚠️] pages/detail/detail.js:67 — setData 传递了未使用的数据 — 只传递页面需要的字段

### 💡 Info（优化建议）

[💡] pages/index/index.wxml:5 — 图片未设置懒加载 — 添加 lazy-load 属性
[💡] app.wxss — 全局样式存在重复定义 — 合并重复的 CSS 规则
```

---

## 自动修复能力

Trae SOLO 模式下，以下问题可自动修复：

| 问题 | 自动修复方案 |
|------|-------------|
| `wx:for` 缺少 `wx:key` | 自动添加 `wx:key="id"` 或 `wx:key="index"` |
| properties 缺少 type | 根据 value 推断并添加 type |
| 缺少 try-catch | 自动包裹 try-catch 并添加错误提示 |
| 图片缺少 mode | 添加 `mode="aspectFit"` |
| 非首屏图片缺少 lazy-load | 添加 `lazy-load` 属性 |
| 文件编码非 UTF-8 | 自动转换为 UTF-8 |
| 缺少 `.gitignore` | 生成标准 `.gitignore` |
| 组件缺少 `component: true` | 在 .json 中添加 |

### 自动修复流程

```
1. 扫描问题 → 分类（可自动修复 / 需手动修复）
2. 可自动修复的问题 → 直接修复 → 输出修复日志
3. 需手动修复的问题 → 输出到审查报告
4. 所有自动修复完成后 → 重新审查 → 确认修复效果
```

### 不可自动修复的问题

以下问题需要开发者手动判断，Trae 仅提示：
- 业务逻辑错误
- 接口数据格式不匹配
- 交互流程不合理
- 隐私合规声明内容
- 域名白名单配置
