# 整体架构

## 运行形态

无限画布是本地优先的静态浏览器应用：

1. Vite 构建 React 单页应用，React Router 管理浏览器路由。
2. 浏览器保存画布、素材、生成记录、插件、API Key 和模型配置。
3. 浏览器直接请求 AI 接口、GitHub Raw 提示词源和 WebDAV。
4. Canvas Agent 是可选本机进程，用于连接网页与 Codex、Claude Code、MCP 客户端。
5. 节点插件以远程 ESM 源码加载，在宿主页面内注册节点定义。

## 顶层目录

| 路径 | 职责 |
| --- | --- |
| `web/src/main.tsx` | 浏览器入口和全局 Provider |
| `web/src/router.tsx` | React Router 路由表 |
| `web/src/pages/` | 页面入口 |
| `web/src/layouts/` | 页面布局 |
| `web/src/components/` | 全局和画布 UI |
| `web/src/stores/` | Zustand 状态 |
| `web/src/services/api/` | AI、提示词和模型脚本请求 |
| `web/src/services/` | 媒体存储、WebDAV 和应用同步 |
| `web/src/lib/canvas/` | 画布工具、Agent op、节点和插件运行时 |
| `canvas-agent/src/` | 本机 HTTP Agent、MCP Server 和 CLI 适配 |
| `plugins/canvas/` | 节点插件 SDK、源码和注册表 |
| `plugins/infinite-canvas/` | Codex app 插件 |
| `docs/content/docs/` | 用户文档 |

## 核心调用链

### 页面启动

`main.tsx`
→ `AppProviders`
→ `RouterProvider`
→ `UserLayout`
→ `AppTopNav` + 全站 `AgentPanel`
→ 业务页面。

### AI 生成

页面或画布
→ `useConfigStore`
→ `resolveModelRequestConfig` / 可选模型脚本
→ `services/api/image.ts`、`video.ts`、`audio.ts`
→ 用户配置的远端接口
→ 本地媒体存储
→ 页面日志、素材或画布节点。

### 画布持久化

`pages/canvas/project.tsx`
→ `useCanvasStore.updateProject`
→ Zustand persist
→ `localForageStorage`
→ IndexedDB，失败时回退 `localStorage`。

### 节点插件

`ensurePluginsLoaded`
→ 读取插件 store、本地清单、开发环境 URL
→ 动态导入 ESM
→ `activatePlugin`
→ `node-registry`
→ 创建菜单、节点渲染和画布上下文。

### 本地 Agent

Codex/MCP 客户端
→ `canvas-agent`
→ HTTP/SSE
→ 全站 `CanvasLocalAgentPanel`
→ 站点工具或画布 `applyOps`
→ HTTP 回传结果。

## 关键约束

- 没有服务端账号体系或业务数据库。
- API Key 保存在浏览器本地，AI 请求由前端直连。
- 画布、素材、日志和插件默认保存在浏览器本地。
- 静态托管必须把未知路由回退到 `index.html`。
- 远程节点插件在页面上下文执行，只应安装可信来源。
