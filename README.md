# 微信小程序开发全流程 — Trae 指令

## 项目识别

检测到以下文件之一即识别为微信小程序项目：
- `app.json` — 小程序全局配置
- `project.config.json` — 项目配置

若未检测到，优先询问用户是否需要初始化新项目。

---

## SOLO 模式工作流

Trae SOLO 模式下，AI 自动代理执行，每个阶段完成后暂停等待用户确认再进入下一阶段。

### 🔧 Builder Agent — 构建阶段
→ 读取 `references/builder.md` 执行

触发场景：
- 用户要求创建新项目 / 新页面 / 新组件
- 用户描述功能需求需要编码实现
- 项目初始化

### 🔍 Reviewer Agent — 审查阶段
→ 读取 `references/reviewer.md` 执行

触发场景：
- 用户要求代码审查 / review
- 代码提交前检查
- 阶段性完成后自动触发

### ⚡ Optimizer Agent — 优化阶段
→ 读取 `references/optimizer.md` 执行

触发场景：
- 用户要求优化性能 / 体积
- 包体积超限（主包 > 2MB）
- 页面加载缓慢 / setData 频繁
- 审核前优化

### 🚀 Publisher Agent — 发布阶段
→ 读取 `references/publisher.md` 执行

触发场景：
- 用户要求上传 / 发布 / 提审
- 版本发布流程

---

## Trae 特殊指令

### 编码规范
- 所有文件 UTF-8 编码，中文注释
- 使用 SOLO 模式自动执行，每个阶段完成后暂停确认
- 文件创建使用 Trae 的文件操作 API
- 保存后自动触发开发者工具预览（若已配置）
- 组件化优先，页面与组件分离
- `wx.request` 使用 Promise + 拦截器封装

### 命名规范
- 文件名：kebab-case（如 `user-profile`）
- 变量/函数：camelCase（如 `getUserInfo`）
- 常量：UPPER_SNAKE_CASE（如 `API_BASE_URL`）
- 组件名：PascalCase（如 `UserProfile`）
- 页面目录：kebab-case

### 开发原则
1. **组件化优先**：可复用 UI 抽成组件，页面只负责数据与逻辑
2. **单一职责**：每个文件不超过 300 行，超过则拆分
3. **类型安全**：使用 JSDoc 标注函数参数和返回值类型
4. **错误兜底**：所有异步操作必须有 try-catch，所有请求必须有错误处理
5. **性能意识**：避免不必要的 setData，列表使用分页加载

### 阶段转换规则
```
Builder → Reviewer → Optimizer → Publisher
   ↑                                  |
   └──────── 迭代修改 ←───────────────┘
```
- 每个阶段完成后输出摘要，等待用户确认
- 用户可跳过某阶段（如"跳过优化直接发布"）
- 发现重大问题可回退到上一阶段

---

## 常见报错速查

→ 读取 `references/pitfalls.md` 查找对应错误的自动修复方案
