# 画布领域

## 入口与分层

- `web/src/pages/canvas/index.tsx`：项目列表。
- `web/src/pages/canvas/project.tsx`：画布业务主组件，协调节点、连线、历史、生成、插件和 Agent。
- `web/src/types/canvas.ts`：节点、连线、视口和助手领域类型。
- `web/src/constant/canvas.ts`：内置节点默认规格。
- `web/src/stores/canvas/`：项目持久化、项目列表 UI 和插件状态。
- `web/src/components/canvas/`：画布、节点、工具栏、弹窗和生成面板。
- `web/src/lib/canvas/`：导出、尺寸、资源引用、Agent op、节点注册表和插件运行时。

## 核心数据

`CanvasProject` 保存节点、连线、聊天会话、背景、视口、标题和时间字段。节点通用结构是 `CanvasNodeData`，可变业务数据集中在 `CanvasNodeMetadata`。

内置节点注册在 `components/canvas/nodes/builtin-nodes.tsx`，包括文本、图片、视频、音频、生成配置和组。插件节点使用字符串类型 ID，由统一 `node-registry.ts` 管理。

## 渲染与交互

`project.tsx`
→ `InfiniteCanvas`
→ 连接线
→ `CanvasNode`
→ `getNodeDefinition`
→ 内置或插件节点内容。

节点尺寸继续使用 `canvas-node-size.ts` 和节点定义的 `defaultSize` / `keepAspectRatio`。创建菜单、小地图、资源输入和工具栏能力都从节点定义读取。

## 生成调用链

`CanvasNodePromptPanel`
→ 页面生成回调
→ `buildNodeGenerationContext`
→ 收集上游节点和资源引用
→ 调用文本、图片、视频或音频 API
→ 写入本地媒体
→ 新增或更新结果节点
→ 持久化项目。

相关文件：

- `components/canvas/canvas-node-generation.ts`
- `lib/canvas/canvas-resource-references.ts`
- `components/canvas/canvas-resource-mention-textarea.tsx`

## 节点插件

- `lib/canvas/node-registry.ts`：节点定义注册、查询和缺失插件占位。
- `lib/canvas/plugin-loader.ts`：安装、更新、启停和启动加载。
- `lib/canvas/plugin-runtime.ts`：宿主 React、CSS、事件和插件存储。
- `lib/canvas/plugin-node-context.ts`：向插件提供节点、连线、资源和 `applyOps`。
- `stores/canvas/use-plugin-store.ts`：插件源码、URL、开关和版本持久化。
- `components/canvas/canvas-plugin-manager-modal.tsx`：官方/第三方插件管理 UI。

插件 `applyOps` 和 Agent 共用 `CanvasAgentOp`，因此新增 op 时要同时检查插件上下文、页面执行逻辑和 Canvas Agent。

## Agent 操作

`lib/canvas/canvas-agent-ops.ts` 定义统一操作，包括增删改节点、连线、视口、选择和触发生成。画布页通过 `useAgentStore.setCanvasContext` 向全站 Agent 暴露当前快照和执行函数；离开画布后画布工具不可用。

## 修改落点

- 新内置节点：更新类型/默认规格、`builtin-nodes.tsx`、导入导出和 Agent schema。
- 新插件能力：更新插件类型、runtime/context、SDK 和示例。
- 新生成模式：更新配置面板、请求层、页面生成编排和 Agent 工具。
- 输入关系：先读节点生成和资源引用模块。
- 项目导入导出：读 `lib/canvas/canvas-export.ts` 与 `types/canvas-export.ts`。

## 风险点

- `project.tsx` 仍承担大量协调逻辑，修改时控制作用域。
- 删除节点要同步处理连线、选区、组关系和媒体引用。
- 禁用插件后节点数据必须保留，并显示缺失插件占位。
- 插件代码直接执行，不能把不可信 URL 当作普通数据加载。
