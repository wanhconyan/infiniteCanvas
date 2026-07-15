# AI 请求层

## 配置模型

`web/src/stores/use-config-store.ts` 是 AI 配置的全局入口。

- `ModelChannel`：渠道名称、Base URL、API Key、OpenAI/Gemini 格式和模型对象。
- `ChannelModel`：模型名、`image/video/text/audio` 能力和可选请求脚本。
- 模型选择值采用 `channelId::modelName`。
- `selectableModelsByCapability` 按模型对象能力实时筛选。
- `resolveModelRequestConfig` 把模型选择解析为具体渠道。
- `resolveModelScript` 返回模型自定义脚本。

本地 Sub2API/iframe 配置导入在 `components/layout/client-root-init.tsx`，调整渠道模型结构时要同步检查。

## 图片与文本

入口：`web/src/services/api/image.ts`

职责：

- OpenAI Responses API 文本流。
- Gemini `generateContent` / `streamGenerateContent`。
- OpenAI 兼容图片生成和编辑。
- Gemini 图片比例与尺寸参数。
- 图片尺寸、质量、比例和错误归一化。
- 获取渠道模型列表。
- 在模型配置脚本时调用 `model-plugin.ts`。

主要导出：`requestGeneration`、`requestEdit`、`requestImageQuestion`、`fetchChannelModels`。

## 模型脚本

`web/src/services/api/model-plugin.ts` 在浏览器中执行用户为模型配置的 JavaScript 请求脚本。图片、文本、视频和音频服务都会先检查 `resolveModelScript`，存在脚本时走脚本结果归一化，否则走内置协议。

脚本与远程节点插件一样具有较高权限，只应使用可信代码。

## 视频与音频

- `services/api/video.ts`：OpenAI 兼容视频任务、结果轮询、Seedance/Agent Plan 和模型脚本。
- `services/api/audio.ts`：OpenAI 兼容音频生成和模型脚本。
- Gemini 格式目前不用于音频和视频内置请求。
- 生成媒体通过 `storeGeneratedVideo` / `storeGeneratedAudio` 写入本地存储。

## 工作台日志

- 图片工作台：`web/src/pages/image/index.tsx`
- 视频工作台：`web/src/pages/video/index.tsx`
- IndexedDB stores：`image_generation_logs`、`video_generation_logs`

调整结果结构时要同步检查日志恢复和 WebDAV 同步。

## 提示词

`services/api/prompts.ts` 由浏览器直连 GitHub Raw，解析多个仓库并缓存到 IndexedDB，不存在项目内提示词 API Route。

## 修改落点

- 新协议：在服务层增加适配，不把协议判断散到页面。
- 新模型能力：更新 `ModelCapability`、渠道编辑 UI、选择器和请求服务。
- 新参数：更新 `AiConfig`、设置面板、画布 metadata、日志和请求 payload。
- 新脚本能力：更新 `model-plugin.ts` 的输入/输出归一化并保持 `AbortSignal`。

## 注意事项

- AI 请求使用浏览器中的 API Key，不经过项目后端。
- `buildApiUrl` 负责规范化 API 路径。
- 图片请求支持无参考图和多参考图编辑。
- 所有长请求应继续传递 `AbortSignal`。
