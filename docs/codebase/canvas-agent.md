# Canvas Agent

## 组成

`canvas-agent` 是独立 npm 包 `@basketikun/canvas-agent`，Node.js 18+。

| 文件 | 职责 |
| --- | --- |
| `src/index.ts` | CLI 入口；默认 HTTP，`mcp` 参数启动 MCP stdio |
| `src/http-server.ts` | HTTP API、SSE、鉴权、CORS、Codex/Claude 路由 |
| `src/canvas-session.ts` | 网页连接、快照、工具转换和结果配对 |
| `src/mcp-server.ts` | MCP SDK 注册工具并转发到 HTTP Agent |
| `src/schemas.ts` | 工具名称、描述和 Zod 入参 |
| `src/tools.ts` | 工具校验、快照压缩和默认位置 |
| `src/agents.ts` | Codex app-server、Claude Code 和线程管理 |
| `src/config.ts` | URL、token、Origin、站点工作区和 prompt |

## HTTP 与 SSE

默认监听 `127.0.0.1:17371`。`GET /health` 和 `GET /config` 用于发现与连接；`GET /events` 建立 SSE；`POST /canvas/state`、`POST /canvas/result` 和 `POST /api/tools` 处理画布工具。`/agent/codex/*` 和 Claude 路由负责编程 Agent 会话。

token 可通过查询参数或 `x-canvas-agent-token` 传入。网页 Origin 受本机配置约束。

## 网页端

- `web/src/components/agent/agent-panel.tsx`：布局右侧的全站面板容器。
- `web/src/components/canvas/canvas-local-agent-panel.tsx`：连接、聊天、线程、附件、SSE 和工具确认 UI。
- `web/src/stores/use-agent-store.ts`：全站连接与会话状态。
- `web/src/lib/agent/agent-site-tools.ts`：站点导航等非画布工具。
- `web/src/lib/canvas/canvas-agent-ops.ts`：画布操作协议。

全站面板不随路由卸载。进入画布页时，画布页向 store 注册 `canvasContext`；离开后仅站点工具可用。

## MCP 调用链

MCP 客户端
→ `mcp-server.ts`
→ `POST /api/tools`
→ `CanvasSession.callTool`
→ SSE `tool_call`
→ 网页执行站点工具或画布 op
→ `POST /canvas/result`
→ 返回 MCP 结果。

读取工具使用最近一次网页上报快照；写工具最终转换为 `CanvasAgentOp[]`。

## 修改落点

- 新 MCP 工具：更新 `schemas.ts`、`CanvasSession.callTool` 和网页执行映射。
- 新站点工具：更新 Agent schema、`agent-site-tools.ts` 和工具标签。
- 新画布 op：更新 `canvas-agent-ops.ts`、页面执行逻辑、Agent 转换和插件上下文。
- 修改连接安全：读 `http-server.ts` 的 CORS/鉴权和 `config.ts`。
- 修改 Codex 线程：读 `agents.ts` 与 `/agent/codex/*`。

## 注意事项

- HTTP Agent 与 MCP Server 是两个入口；MCP Server 依赖 HTTP Agent。
- Agent 保存最近一次网页上报快照，不是持久化数据库。
- 写操作由网页执行，Agent 不直接修改浏览器状态。
- 默认 Local URL 是 `http://127.0.0.1:17371`；`ERR_CONNECTION_REFUSED` 通常表示 HTTP Agent 未启动或端口不一致。
