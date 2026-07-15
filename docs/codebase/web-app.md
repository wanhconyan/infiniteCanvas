# Web 应用与页面

## 应用入口

- `web/src/main.tsx`：加载全局 CSS、Provider 和 Router。
- `web/src/router.tsx`：全部页面路由。
- `web/src/layouts/user-layout.tsx`：顶部导航、业务内容和全站 Agent 面板。
- `web/src/components/layout/app-providers.tsx`：Ant Design、查询缓存和主题 Provider。
- `web/src/components/layout/client-root-init.tsx`：处理 URL/iframe 传入的 Sub2API 配置。
- `web/src/components/layout/app-top-nav.tsx`：主导航、Agent 和设置入口。
- `web/src/constant/navigation-tools.ts`：主业务导航定义。

## 页面模块

| 路由 | 入口 | 主要职责 |
| --- | --- | --- |
| `/` | `web/src/pages/home/index.tsx` | 首页 |
| `/canvas` | `web/src/pages/canvas/index.tsx` | 画布项目列表、新建、导入和删除 |
| `/canvas/:id` | `web/src/pages/canvas/project.tsx` | 具体画布编辑器 |
| `/image` | `web/src/pages/image/index.tsx` | 图片生成、参考图和历史记录 |
| `/video` | `web/src/pages/video/index.tsx` | 视频生成、轮询和历史记录 |
| `/prompts` | `web/src/pages/prompts/index.tsx` | 第三方提示词检索与预览 |
| `/assets` | `web/src/pages/assets/index.tsx` | 本地素材管理 |
| `/config` | `web/src/pages/config/index.tsx` | 渠道、模型、偏好、WebDAV 和 Codex 配置 |

## 全局状态

- `use-config-store.ts`：AI 渠道、带能力的模型对象、生成参数和 WebDAV 配置。
- `use-agent-store.ts`：全站 Agent 连接、面板、消息、线程和画布上下文。
- `use-theme-store.ts`：浅色/深色主题。
- `use-asset-store.ts`：文本和媒体素材。
- `use-user-store.ts`：本地用户形态。
- `stores/canvas/`：画布项目、画布 UI 和节点插件。

## 提示词模块

`services/api/prompts.ts` 在浏览器中直接拉取多个 GitHub Raw 数据源，解析后缓存到 localforage 的 `prompt_cache` store，缓存时长一小时。列表筛选、分页和标签收集也在该服务中完成，不再经过项目服务端。

## 修改落点

- 新增页面：在 `web/src/pages/` 新建入口，并更新 `router.tsx`；需要主导航时再改 `navigation-tools.ts`。
- 修改全局主题：优先改主题 token、`AppProviders` 或 `styles/globals.css`。
- 修改设置项：从 `app-config-modal.tsx` / 配置页追到 `use-config-store.ts`。
- 修改页面私有逻辑：保留在对应页面目录。
- 修改外部请求：统一放入 `web/src/services/api/`。

## 注意事项

- 页面文案使用中文。
- 业务列表和媒体使用 localforage/IndexedDB，不写入 `localStorage`。
- `ClientRootInit` 支持查询参数和父窗口消息导入配置，调整渠道结构时必须检查。
- 全站 Agent 挂在布局层，路由切换不应中断连接。
