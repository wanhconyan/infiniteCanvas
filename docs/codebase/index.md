# 无限画布代码知识库

本目录是面向 AI 和开发者的代码导航层。处理需求时先读本页，再读对应模块文档；只有需要确认具体实现时才继续打开列出的源码文件。

## 当前架构

- `web/`：Vite + React + React Router 的静态浏览器应用。
- `canvas-agent/`：本机 Canvas Agent，提供 HTTP/SSE 桥接、Codex/Claude 适配和 MCP Server。
- `plugins/canvas/`：画布节点插件 SDK、示例插件和官方插件注册表构建。
- `plugins/infinite-canvas/`：Codex app 插件与打开画布技能。
- `docs/`：Fumadocs 文档站、用户文档和本代码知识库。
- `deploy/`、根目录 Docker/Nginx 文件：部署配置。
- 当前没有独立业务后端；AI、提示词和 WebDAV 请求均由浏览器直接发起。

## 模块索引

| 模块 | 文档 | 何时阅读 |
| --- | --- | --- |
| 整体架构 | [architecture.md](architecture.md) | 判断请求落点、理解跨模块调用链 |
| Web 应用与页面 | [web-app.md](web-app.md) | 修改路由、页面、导航、主题和全局配置 |
| 画布领域 | [canvas.md](canvas.md) | 修改节点、连线、生成流程、导入导出或插件节点 |
| AI 请求层 | [ai-generation.md](ai-generation.md) | 修改模型渠道、模型脚本和图片/视频/音频/文本请求 |
| 存储与同步 | [storage-sync.md](storage-sync.md) | 修改本地持久化、媒体文件、WebDAV、数据导入导出 |
| Canvas Agent | [canvas-agent.md](canvas-agent.md) | 修改全站 Agent、本地连接、SSE、MCP 和 Codex/Claude 适配 |
| 文档、插件与部署 | [docs-plugin-deploy.md](docs-plugin-deploy.md) | 修改文档站、两类插件、Docker、Vercel、Pages 或 Nginx |

## 按需求快速定位

- 新增或修改页面：先读 [web-app.md](web-app.md)。
- 画布节点、连线、快捷键、选区、缩放：先读 [canvas.md](canvas.md)。
- 节点插件：先读 [canvas.md](canvas.md)，再读 [docs-plugin-deploy.md](docs-plugin-deploy.md)。
- 生图、图生图、文本问答、视频、音频：先读 [ai-generation.md](ai-generation.md)，涉及画布再补读 [canvas.md](canvas.md)。
- 浏览器本地数据、素材、生成记录、WebDAV：先读 [storage-sync.md](storage-sync.md)。
- Codex 操作画布、本地 Agent 连接、MCP 工具：先读 [canvas-agent.md](canvas-agent.md)。
- 发布、部署、插件安装、文档站：先读 [docs-plugin-deploy.md](docs-plugin-deploy.md)。

## 使用规则

1. 先通过本索引选择模块，不要默认重新通读仓库。
2. 模块文档用于定位，不替代源码；修改前仍要读取文档列出的直接相关文件。
3. 涉及跨模块行为时，从模块文档中的调用链和修改落点继续追踪。
4. 架构、入口、数据结构或关键调用链变化时，同步更新对应模块文档和本索引。
5. `docs/content/docs/` 是用户文档；`docs/codebase/` 是开发和 AI 的代码知识库，两者不要混写。
