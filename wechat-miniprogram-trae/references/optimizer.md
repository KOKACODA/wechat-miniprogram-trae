# Optimizer Agent — 微信小程序优化指南

> Trae SOLO 模式专用 | 体积 + 性能 + 体验 三维优化 | 每项：检测方式 → 方案 → 代码 → 收益

---

## 目录

1. [体积优化](#体积优化)
2. [性能优化](#性能优化)
3. [体验优化](#体验优化)
4. [优化报告模板](#优化报告模板)

---

## 体积优化

### 1.1 包体积分析

**检测方式：**
1. 读取 `project.config.json` 的 `miniprogramRoot` 确定小程序根目录
2. 使用开发者工具「详情 → 本地代码」查看包体积分布
3. 命令行分析：`cli open --project <path>` 后查看编译日志

**体积限制：**
- 主包 ≤ 2MB
- 单个分包 ≤ 2MB
- 总包 ≤ 20MB（使用分包加载时）

**Trae 自动检测脚本：**
```javascript
// scan-size.js — 扫描各目录体积（Node.js 脚本，可在 Trae 终端执行）
const fs = require('fs')
const path = require('path')

function getDirSize(dir) {
  let size = 0
  const items = fs.readdirSync(dir)
  for (const item of items) {
    const itemPath = path.join(dir, item)
    const stat = fs.statSync(itemPath)
    if (stat.isDirectory()) {
      size += getDirSize(itemPath)
    } else {
      size += stat.size
    }
  }
  return size
}

function scanProject(rootDir) {
  const dirs = ['pages', 'components', 'utils', 'services', 'images']
  console.log('=== 包体积分析 ===')
  let total = 0
  for (const dir of dirs) {
    const dirPath = path.join(rootDir, dir)
    if (fs.existsSync(dirPath)) {
      const size = getDirSize(dirPath)
      total += size
      console.log(`${dir}: ${(size / 1024).toFixed(1)} KB`)
    }
  }
  console.log(`总计: ${(total / 1024).toFixed(1)} KB`)
  console.log(`主包限制: 2048 KB | 剩余: ${((2048 * 1024 - total) / 1024).toFixed(1)} KB`)
}

scanProject(process.argv[2] || '.')
```

---

### 1.2 图片资源优化

**检测方式：** 扫描 `images/` 目录，识别大图文件

**优化方案：**

| 方案 | 适用场景 | 预期收益 |
|------|---------|---------|
| 压缩 PNG/JPG | 所有本地图片 | 体积减少 40-70% |
| WebP 转换 | 非透明图片 | 体积减少 25-35% |
| CDN 迁移 | > 50KB 的图片 | 主包体积直接减少 |
| CSS 渐变替代 | 简单背景图 | 完全移除图片文件 |
| 雪碧图 | 多个小图标 | 减少 HTTP 请求数 |

**Trae 自动执行：**
```bash
# 1. 压缩图片（使用 TinyPNG CLI 或类似工具）
npx tinypng-cli images/*.png

# 2. 将大图迁移到 CDN
# Trae 自动执行：
# - 上传图片到 CDN
# - 替换代码中的本地路径为 CDN URL
# - 删除本地图片文件
```

**代码示例 — CDN 图片替换：**
```xml
<!-- ❌ 本地图片 -->
<image src="/images/banner.png" mode="aspectFill" />

<!-- ✅ CDN 图片 -->
<image src="https://cdn.example.com/images/banner.png" mode="aspectFill" />
```

---

### 1.3 代码分包

**检测方式：** 分析页面依赖关系，计算各页面组体积

**分包策略：**

```
主包（≤ 2MB）
├── app.js / app.json / app.wxss
├── utils/ / services/
├── components/（通用组件）
└── pages/index/（首页 + TabBar 页面）

分包A（如：用户中心）
├── pages/profile/
├── pages/settings/
└── pages/address/

分包B（如：商品模块）
├── pages/product/
├── pages/cart/
└── pages/order/
```

**app.json 分包配置：**
```json
{
  "subpackages": [
    {
      "root": "packageUser",
      "name": "user",
      "pages": [
        "pages/profile/profile",
        "pages/settings/settings",
        "pages/address/address"
      ]
    },
    {
      "root": "packageProduct",
      "name": "product",
      "pages": [
        "pages/product/product",
        "pages/cart/cart",
        "pages/order/order"
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["user"]
    }
  }
}
```

**分包预下载配置：**
```json
{
  "preloadRule": {
    "pages/index/index": {
      "network": "wifi",
      "packages": ["product"]
    },
    "packageUser/pages/profile/profile": {
      "network": "all",
      "packages": ["product"]
    }
  }
}
```

**独立分包（极速启动）：**
```json
{
  "subpackages": [
    {
      "root": "packageLaunch",
      "name": "launch",
      "pages": [
        "pages/landing/landing"
      ],
      "independent": true
    }
  ]
}
```

**预期收益：** 主包体积减少 30-60%，首屏加载速度提升 40%+

---

### 1.4 无用代码清理

**检测方式：** 静态分析文件引用链

| 类型 | 检测方式 | 修复方案 |
|------|---------|---------|
| 未引用的页面 | `app.json` pages 与实际目录对比 | 移除未使用的页面配置和文件 |
| 未引用的组件 | 页面 JSON usingComponents 与组件目录对比 | 移除未注册的组件文件 |
| 未使用的工具函数 | 扫描 `require` 引用链 | 移除未引用的函数/模块 |
| 重复的样式 | CSS 规则对比 | 合并重复规则到公共样式 |
| 调试代码 | 正则匹配 `console.log` / `debugger` | 移除或替换为条件日志 |
| 未使用的 npm 包 | 扫描 `package.json` 与 `require` 对比 | 移除未使用的依赖 |

**Trae 自动执行：**
```bash
# 检测未使用的页面
# 对比 app.json 的 pages 与 pages/ 目录

# 检测未引用的组件
# 扫描所有页面 .json 的 usingComponents

# 移除 console.log
# npx eslint --fix --rule '{"no-console": "error"}' .
```

**预期收益：** 代码体积减少 5-15%

---

## 性能优化

### 2.1 setData 优化

**检测方式：** 扫描 `.js` 文件中所有 `setData` 调用

**常见问题与修复：**

#### 问题 1：频繁 setData
```javascript
// ❌ 频繁触发（如 scroll/touchmove 回调中）
onTouchMove(e) {
  this.setData({ x: e.touches[0].x, y: e.touches[0].y })
}

// ✅ 节流处理
onTouchMove: throttle(function(e) {
  this.setData({ x: e.touches[0].x, y: e.touches[0].y })
}, 16),

// 节流函数
function throttle(fn, delay) {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}
```

#### 问题 2：setData 传递整棵树
```javascript
// ❌ 传递整个列表
this.setData({ list: newList })

// ✅ 只传递变化的部分
this.setData({ [`list[${index}]`]: updatedItem })

// ✅ 列表追加
const addData = {}
newItems.forEach((item, i) => {
  addData[`list[${this.data.list.length + i}]`] = item
})
this.setData(addData)
```

#### 问题 3：setData 与界面渲染无关的数据
```javascript
// ❌ 与渲染无关的数据也放在 data 中
data: {
  list: [],
  scrollTop: 0,        // 仅用于逻辑判断
  requestData: {}       // 仅用于请求
}

// ✅ 与渲染无关的数据放在 this 上
data: {
  list: []
},

onLoad() {
  this.scrollTop = 0
  this.requestData = {}
}
```

**预期收益：** 渲染耗时减少 30-50%

---

### 2.2 列表渲染优化

**检测方式：** 扫描 `.wxml` 中 `wx:for` 和对应 `.js` 中的数据处理

**优化方案：**

#### 分页加载
```javascript
// pages/list/list.js
Page({
  data: {
    list: [],
    page: 1,
    hasMore: true,
    loading: false
  },

  async loadMore() {
    if (this.data.loading || !this.data.hasMore) return
    
    this.setData({ loading: true })
    try {
      const res = await get('/api/list', { 
        page: this.data.page, 
        pageSize: 10 
      })
      const newList = res.data.list || []
      this.setData({
        list: [...this.data.list, ...newList],
        page: this.data.page + 1,
        hasMore: newList.length >= 10,
        loading: false
      })
    } catch (err) {
      this.setData({ loading: false })
    }
  }
})
```

#### 虚拟列表（长列表 > 200 条）
```xml
<!-- 使用 recycle-view 自定义组件 -->
<recycle-view batch="{{batchSetRecycleData}}" id="recycleId">
  <view slot="before">列表头部</view>
  <recycle-item wx:for="{{recycleList}}" wx:key="id">
    <view class="list-item">{{item.title}}</view>
  </recycle-item>
  <view slot="after">列表底部</view>
</recycle-view>
```

> 需安装 `miniprogram-recycle-view` 组件：`npm install --save miniprogram-recycle-view`

**预期收益：** 列表渲染耗时减少 60-80%

---

### 2.3 启动优化

**检测方式：** 开发者工具 Performance 面板查看启动耗时

| 优化方案 | 配置方式 | 预期收益 |
|---------|---------|---------|
| 分包预下载 | `app.json` → `preloadRule` | 分包加载提前 1-2s |
| 独立分包 | `subpackages[].independent: true` | 启动速度提升 50%+ |
| 按需注入 | `app.json` → `"lazyCodeLoading": "requiredComponents"` | 启动耗时减少 20-30% |
| 减少首页数据量 | 首页只请求必要数据 | 渲染速度提升 30%+ |
| 首页骨架屏 | 添加骨架屏组件 | 感知速度提升 |
| 避免同步 API | `wx.getStorageSync` → `wx.getStorage` | 减少启动阻塞 |

**app.json 按需注入配置：**
```json
{
  "lazyCodeLoading": "requiredComponents"
}
```

---

### 2.4 渲染优化

**检测方式：** 开发者工具 Audit 面板 + Performance 分析

| 问题 | 检测方式 | 优化方案 |
|------|---------|---------|
| WXML 层级过深 | 审计工具 > 10 层 | 扁平化结构，减少嵌套 |
| 频繁重渲染 | setData 调用频率 | 合并 setData，减少调用次数 |
| 图片渲染卡顿 | 大图未压缩 | 压缩图片 + 懒加载 |
| CSS 动画卡顿 | 未使用 GPU 加速 | 使用 `transform` 替代 `top/left` |
| 自定义组件过多 | 组件实例数 > 100 | 合并简单组件，减少组件层级 |

**CSS 动画优化：**
```css
/* ❌ 触发 layout + paint */
.anim-bad {
  transition: top 0.3s, left 0.3s;
}

/* ✅ 仅触发 composite */
.anim-good {
  transition: transform 0.3s;
  will-change: transform;
}
```

---

## 体验优化

### 3.1 骨架屏

**适用场景：** 首页、列表页等首次加载耗时较长的页面

**代码模板：**

```xml
<!-- components/skeleton/skeleton.wxml -->
<view class="skeleton-container">
  <view class="skeleton-header">
    <view class="skeleton-avatar skeleton-animate"></view>
    <view class="skeleton-lines">
      <view class="skeleton-line skeleton-animate" style="width:60%"></view>
      <view class="skeleton-line skeleton-animate" style="width:40%"></view>
    </view>
  </view>
  <view class="skeleton-body">
    <view class="skeleton-rect skeleton-animate"></view>
    <view class="skeleton-rect skeleton-animate"></view>
    <view class="skeleton-rect skeleton-animate"></view>
  </view>
</view>
```

```css
/* components/skeleton/skeleton.wxss */
.skeleton-animate {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
}

.skeleton-line {
  height: 24rpx;
  border-radius: 4rpx;
  margin-bottom: 16rpx;
}

.skeleton-rect {
  height: 200rpx;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
}
```

**使用方式：**
```xml
<!-- 页面中 -->
<skeleton wx:if="{{loading}}" />
<view wx:else><!-- 真实内容 --></view>
```

**预期收益：** 用户感知等待时间减少 40%+

---

### 3.2 加载态

**组件化方案：** 使用 Builder 模块创建的 `loading` 组件

```xml
<!-- 页面级加载 -->
<loading wx:if="{{pageLoading}}" fullScreen text="页面加载中..." />

<!-- 局部加载 -->
<view class="section">
  <loading wx:if="{{sectionLoading}}" text="加载中..." />
  <block wx:else><!-- 内容 --></block>
</view>
```

---

### 3.3 错误态

**代码模板：**
```xml
<!-- components/error/error.wxml -->
<view class="error-container">
  <image class="error-image" src="/images/error-network.png" mode="aspectFit" />
  <view class="error-message">{{message}}</view>
  <view class="error-button" bindtap="onRetry">{{buttonText}}</view>
</view>
```

```javascript
// components/error/error.js
Component({
  properties: {
    message: { type: String, value: '网络异常，请稍后重试' },
    buttonText: { type: String, value: '重新加载' },
    type: { type: String, value: 'network' } // network | server | timeout
  },
  methods: {
    onRetry() {
      this.triggerEvent('retry')
    }
  }
})
```

---

### 3.4 空状态

使用 Builder 模块创建的 `empty` 组件，支持自定义图片类型和操作按钮。

```xml
<!-- 数据为空 -->
<empty type="data" message="暂无内容" buttonText="去看看" bind:buttonclick="goExplore" />

<!-- 搜索无结果 -->
<empty type="search" message="未找到相关内容" buttonText="换个关键词" bind:buttonclick="clearSearch" />

<!-- 购物车为空 -->
<empty type="cart" message="购物车空空如也" buttonText="去逛逛" bind:buttonclick="goShopping" />
```

---

## 优化报告模板

```
## 优化报告

### 体积优化
| 项目 | 优化前 | 优化后 | 收益 |
|------|--------|--------|------|
| 主包体积 | {n} KB | {n} KB | -{n}% |
| 图片资源 | {n} KB | {n} KB | -{n}% |
| 分包数量 | {n} | {n} | — |

### 性能优化
| 指标 | 优化前 | 优化后 | 收益 |
|------|--------|--------|------|
| 首屏渲染 | {n} ms | {n} ms | -{n}% |
| setData 频率 | {n}/s | {n}/s | -{n}% |
| 列表渲染 | {n} ms | {n} ms | -{n}% |

### 体验优化
| 优化项 | 状态 |
|--------|------|
| 骨架屏 | ✅ 已添加 / ❌ 未添加 |
| 加载态 | ✅ 已添加 / ❌ 未添加 |
| 错误态 | ✅ 已添加 / ❌ 未添加 |
| 空状态 | ✅ 已添加 / ❌ 未添加 |

### 建议下一步
1. {具体建议}
2. {具体建议}
```
