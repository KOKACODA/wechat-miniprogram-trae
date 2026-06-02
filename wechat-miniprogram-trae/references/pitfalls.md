# 常见报错速查（Trae 版）

## 编译错误

| 错误 | 自动检测方式 | 修复方案 |
|------|-------------|---------|
| `file not found` | 扫描 app.json pages 与实际文件对比 | 自动补全缺失文件或修正路径 |
| JSON 语法错误 | jsonlint 扫描所有 .json | 自动去除注释/尾逗号/修正引号 |
| WXML 模板错误 | 编译日志正则匹配 `Template error` | 定位 `{{}}` 内无效表达式 |

## 运行时错误

| 错误 | 自动检测方式 | 修复方案 |
|------|-------------|---------|
| `setData call too frequently` | AST 分析 setData 调用频率 | 自动合并连续 setData 调用 |
| `url not in domain list` | 扫描代码中所有 request URL | 提示需配置的域名列表 |
| 内存溢出 | 运行时监控 `Maximum call stack` | 检测无限递归和循环引用 |
| `canvasToTempFilePath:fail` | 检查 canvas draw + toTempFilePath 时序 | 确保在 draw 回调中调用 |

## 真机差异

| 问题 | 自动检测方式 | 修复方案 |
|------|-------------|---------|
| iOS 日期格式 | 正则匹配 `new Date('xxxx-xx-xx')` | 自动替换 `-` 为 `/` |
| 安全区域遮挡 | 检测固定定位底部元素 | 自动添加 `padding-bottom: env(safe-area-inset-bottom)` |
| 安卓键盘弹起 | 检测 input + fixed 布局组合 | 建议使用 `softinputMode: adjustResize` |
| 自定义组件样式不生效 | 检测组件 WXSS 是否缺少 `externalClasses` | 自动添加外部样式类声明 |

## 审核被拒

| 拒绝原因 | 自动检测方式 | 修复方案 |
|---------|-------------|---------|
| 类目不符 | 对比 app.json 功能与注册类目 | 提示修改服务类目 |
| 功能不完整 | 扫描空函数/TODO/占位页 | 列出需完善的功能点 |
| 虚拟支付 | 检测 wx.requestPayment + 虚拟商品关键词 | iOS 端自动隐藏支付入口 |
| 诱导关注 | 正则匹配"关注""公众号"等关键词 | 移除相关文案和二维码 |
| 隐私声明缺失 | 检测是否使用隐私 API 但未声明 | 自动生成 privacy.json |

## 网络错误

| 错误 | 自动检测方式 | 修复方案 |
|------|-------------|---------|
| SSL 证书问题 | 检测 HTTPS 证书链 | 提示更新证书或检查 TLS 版本 |
| 请求超时 | 检测 timeout 配置 | 建议增大超时或添加重试机制 |
| 并发超限 | 统计同时 wx.request 调用数 | 自动实现请求队列 |
