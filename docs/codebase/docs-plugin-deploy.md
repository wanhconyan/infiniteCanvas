# 文档、插件与部署

## 文档站

- `docs/content/docs/`：用户 MDX 文档。
- `docs/content/docs/meta.json`：顶层导航。
- `docs/src/app/docs/`：Fumadocs 页面。
- `docs/src/lib/source.ts`：内容源。
- `docs/src/app/api/search/route.ts`：文档搜索。
- `docs/index.md`：仓库内文档入口。
- `docs/codebase/`：代码知识库，不进入用户内容目录。

## 画布节点插件

路径：`plugins/canvas/`

- `sdk/`：`@infinite-canvas/plugin-sdk` 类型、JSX runtime 和构建助手。
- `template/`：新插件模板。
- `markdown/`、`svg/`、`html/`、`panorama/`、`sticky-note/`：独立示例/官方插件。
- `registry/`：集中构建官方插件和 `official-plugins.json`。

每个插件独立构建为 ESM。前端加载流程在 `web/src/lib/canvas/plugin-loader.ts`，官方清单解析在 `plugin-registry.ts`。插件产物可从 URL 安装；本地 `web/public/plugins/index.json` 用于自动发现；`VITE_DEV_PLUGINS` 用于开发热加载。

官方插件由 `.github/workflows/publish-plugins.yml` 构建并发布到 `plugins-dist` 分支，默认通过 jsDelivr 清单加载。

## Codex app 插件

路径：`plugins/infinite-canvas/`

- `.codex-plugin/plugin.json`：插件清单。
- `skills/open-canvas/SKILL.md`：打开在线或本地画布并传递连接信息。
- `README.md`：安装和排查。

Canvas MCP 工具由 `@basketikun/canvas-agent` 提供。修改启动参数、工具名或连接 URL 时，要同步插件技能和 Agent 文档。

## Web 应用部署

根 `Dockerfile`：

1. Bun 阶段构建 `web/dist`。
2. Nginx Alpine 托管静态文件。
3. 根 `nginx.conf` 将未知路由回退到 `/index.html`。
4. 容器只包含 Web 应用，不包含 Canvas Agent。

其他入口：

- `.github/workflows/github-pages.yml`：版本 tag 发布静态站点。
- `vercel.json`、`web/vercel.json`：Vercel SPA 配置。
- `docker-compose.yml`、`docker-compose.local.yml`：容器运行。
- `render.yaml`：Render。
- `deploy/nginx/`：项目自有域名反向代理和 CORS 配置。

## 发布边界

- 根 `VERSION` 和 `CHANGELOG.md` 管理 Web 项目版本。
- `canvas-agent/package.json` 有独立 npm 版本。
- 画布官方插件由版本 tag 触发单独构建发布。
- 文档站有独立包，但不作为产品版本来源。

## 修改落点

- 新用户文档：更新 `docs/content/docs/` 和对应 `meta.json`。
- 新代码知识：更新 `docs/codebase/` 和总索引。
- 新节点插件：从 `plugins/canvas/template/` 开始，并更新 registry（若为官方插件）。
- 修改 Codex 插件：同步 manifest、技能、README 和 Canvas Agent。
- 修改 Docker/Vercel/Pages：必须保留 SPA 路由回退。

## 注意事项

- 节点插件代码在页面内执行，可访问浏览器本地配置，只安装可信来源。
- Docker 静态镜像不启动 `127.0.0.1:17371` 的 Canvas Agent。
- 部署后 AI、提示词和 WebDAV 的目标服务仍需允许浏览器 CORS。
