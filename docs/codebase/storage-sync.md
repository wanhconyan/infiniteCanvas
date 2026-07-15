# 存储与同步

## 存储分层

| 数据 | 位置 | 实现 |
| --- | --- | --- |
| AI/WebDAV 配置、主题 | 浏览器持久化 | Zustand persist |
| Agent 地址和少量面板配置 | localStorage | `use-agent-store.ts` |
| 画布项目 | IndexedDB，失败时回退 localStorage | `use-canvas-store.ts` |
| 素材列表 | IndexedDB，失败时回退 localStorage | `use-asset-store.ts` |
| 节点插件 | IndexedDB | `use-plugin-store.ts` |
| 图片 Blob | IndexedDB `image_files` | `image-storage.ts` |
| 视频、音频和其他 Blob | IndexedDB `media_files` | `file-storage.ts` |
| 图片/视频生成记录 | IndexedDB | 页面日志 store |
| 第三方提示词缓存 | IndexedDB `prompt_cache` | `services/api/prompts.ts` |

## 媒体引用与清理

业务对象保存 `storageKey`，运行时通过 `resolveImageUrl` 或 `resolveMediaUrl` 恢复 Blob URL。Blob URL 不能跨会话持久化。

常见前缀：`image:`、`video:`、`audio:`、`file:`、`video-reference:`、`audio-reference:`。

`cleanupUnusedImages` 和 `cleanupUnusedMedia` 根据业务数据中的 `storageKey` 删除未引用 Blob。调整节点、素材或日志结构时，要确保递归收集逻辑仍能发现引用。

## WebDAV

- `web/src/services/webdav-sync.ts`：浏览器直连 WebDAV，处理 MKCOL、PROPFIND、GET 和 PUT。
- `web/src/services/app-sync.ts`：画布、素材、图片日志、视频日志的领域同步和媒体传输。

同步域：`canvas`、`assets`、`image-workbench`、`video-workbench`。每个域维护独立 `manifest.json`，按 ID 和时间字段合并，再下载缺失媒体、写入本地、上传变化媒体和新 manifest。媒体并发数为 3。

项目已移除 Next.js WebDAV 代理；WebDAV 服务必须允许浏览器来源、方法和认证头。

## 导入导出

- 画布：`web/src/lib/canvas/canvas-export.ts`
- 素材：`web/src/pages/assets/asset-transfer.ts`
- 压缩：`web/src/lib/zip.ts`

导出包包含结构数据和媒体文件；导入后重新写入本地媒体 store。

## 修改落点

- 新持久化业务域：优先建立独立 localforage store，并评估加入 `app-sync.ts`。
- 新媒体类型：扩展文件存储、引用收集、WebDAV 后缀和导入导出。
- 修改合并规则：检查 `mergeById` 的时间字段。
- 修改 WebDAV 请求：检查目标服务 CORS、HTTPS 和认证方式。

## 注意事项

- `localStorage` 只用于极小配置，不用于业务列表、媒体或大 JSON。
- WebDAV 合并不是服务端事务，冲突按时间字段选择。
- 删除业务对象时要评估媒体是否仍被其他画布、素材或日志引用。
- 节点插件源码会缓存在浏览器本地，卸载时由插件 store 删除。
