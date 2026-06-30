"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { App } from "antd";

import { fetchChannelModels } from "@/services/api/image";
import { createModelChannel, filterModelsByCapability, modelOptionsFromChannels, normalizeModelOptionValue, useConfigStore, type AiConfig, type ModelChannel } from "@/stores/use-config-store";

const SUB2API_PARENT_ORIGIN = "https://openapis.win";
const SUB2API_CHANNEL_ID = "sub2api";
const CANVAS_CONFIG_MESSAGE = "sub2api:infinite-canvas-config";
const CANVAS_READY_MESSAGE = "sub2api:infinite-canvas-ready";
const CANVAS_CONFIG_ACK_MESSAGE = "sub2api:infinite-canvas-config-ack";
const READY_POST_DURATION_MS = 5000;
const READY_POST_INTERVAL_MS = 500;

export function ClientRootInit({ children }: { children: ReactNode }) {
    const { message } = App.useApp();
    const handledConfigParams = useRef(false);
    const importedConfigSignature = useRef("");
    const replaceConfig = useConfigStore((state) => state.replaceConfig);
    const openConfigDialog = useConfigStore((state) => state.openConfigDialog);
    const setConfigDialogOpen = useConfigStore((state) => state.setConfigDialogOpen);

    function applyDirectConfig(baseUrl: string, apiKey?: string, models?: string[]) {
        const currentConfig = useConfigStore.getState().config;
        replaceConfig(withSub2apiChannel(currentConfig, baseUrl, apiKey || currentConfig.apiKey, models));
        setConfigDialogOpen(false);
    }

    async function importDirectConfig(baseUrl: string, apiKey?: string, refreshModels = false) {
        const signature = `${baseUrl}\n${apiKey || ""}`;
        if (importedConfigSignature.current === signature) return null;
        importedConfigSignature.current = signature;

        applyDirectConfig(baseUrl, apiKey);
        if (!refreshModels || !apiKey) return 0;

        const models = await fetchChannelModels(createModelChannel({ id: SUB2API_CHANNEL_ID, name: "Sub2API", baseUrl, apiKey, apiFormat: "openai" }));
        applyDirectConfig(baseUrl, apiKey, models);
        return models.length;
    }

    useEffect(() => {
        function handleMessage(event: MessageEvent) {
            if (event.origin !== SUB2API_PARENT_ORIGIN) return;
            const data = event.data as { type?: string; payload?: { baseUrl?: unknown; apiKey?: unknown } };
            if (data?.type !== CANVAS_CONFIG_MESSAGE) return;
            const baseUrl = typeof data.payload?.baseUrl === "string" ? data.payload.baseUrl.trim() : "";
            const apiKey = typeof data.payload?.apiKey === "string" ? data.payload.apiKey.trim() : "";
            if (!baseUrl || !apiKey) return;
            acknowledgeConfigMessage(event);
            void importDirectConfig(baseUrl, apiKey, true)
                .then((modelCount) => {
                    if (modelCount === null) return;
                    message.success(modelCount > 0 ? `已导入 Sub2API 绘图配置，并读取 ${modelCount} 个模型` : "已导入 Sub2API 绘图配置");
                })
                .catch((error) => {
                    message.warning(error instanceof Error ? `已导入密钥，读取模型失败：${error.message}` : "已导入密钥，读取模型失败");
                });
        }

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [message, replaceConfig, setConfigDialogOpen]);

    useEffect(() => {
        if (window.parent === window) return;

        const postReady = () => {
            window.parent.postMessage({ type: CANVAS_READY_MESSAGE }, SUB2API_PARENT_ORIGIN);
        };

        const stopAt = Date.now() + READY_POST_DURATION_MS;
        postReady();
        const timer = window.setInterval(() => {
            postReady();
            if (Date.now() >= stopAt) window.clearInterval(timer);
        }, READY_POST_INTERVAL_MS);

        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        if (handledConfigParams.current) return;
        const searchParams = new URLSearchParams(window.location.search);
        const baseUrl = searchParams.get("baseUrl") || searchParams.get("baseurl");
        const apiKey = searchParams.get("apiKey") || searchParams.get("apikey");
        if (!baseUrl && !apiKey) return;
        handledConfigParams.current = true;
        searchParams.delete("baseUrl");
        searchParams.delete("baseurl");
        searchParams.delete("apiKey");
        searchParams.delete("apikey");
        window.history.replaceState(null, "", `${window.location.pathname}${searchParams.size ? `?${searchParams}` : ""}${window.location.hash}`);
        if (!baseUrl) {
            openConfigDialog(false);
            message.warning("链接中的 API Key 已忽略，请填写自己的 API Key");
            return;
        }
        void importDirectConfig(baseUrl, apiKey || undefined, Boolean(apiKey))
            .then((modelCount) => {
                if (modelCount === null) return;
                message.success(modelCount && modelCount > 0 ? `已导入本地直连配置，并读取 ${modelCount} 个模型` : apiKey ? "已导入本地直连配置" : "已导入 Base URL");
            })
            .catch((error) => {
                message.warning(error instanceof Error ? `已导入本地直连配置，读取模型失败：${error.message}` : "已导入本地直连配置，读取模型失败");
            });
    }, [message, openConfigDialog, replaceConfig, setConfigDialogOpen]);

    return <>{children}</>;
}

function acknowledgeConfigMessage(event: MessageEvent) {
    if (!event.source || !("postMessage" in event.source)) return;
    (event.source as Window).postMessage({ type: CANVAS_CONFIG_ACK_MESSAGE }, event.origin);
}

function withSub2apiChannel(config: AiConfig, baseUrl: string, apiKey: string, models?: string[]) {
    const existingChannels = config.channels.length ? config.channels : [createModelChannel({ id: SUB2API_CHANNEL_ID, name: "Sub2API", baseUrl, apiKey })];
    const target = existingChannels.find((channel) => channel.id === SUB2API_CHANNEL_ID) || existingChannels[0];
    const nextChannel = createModelChannel({
        ...target,
        id: SUB2API_CHANNEL_ID,
        name: "Sub2API",
        baseUrl,
        apiKey,
        apiFormat: "openai",
        models: models ? models : target.models,
    });
    const channels = existingChannels.map((channel) => (channel.id === target.id ? nextChannel : channel));
    const nextConfig = withChannels(config, channels);
    return {
        ...nextConfig,
        channelMode: "local" as const,
        baseUrl,
        apiKey,
        apiFormat: "openai" as const,
    };
}

function withChannels(config: AiConfig, channels: ModelChannel[]): AiConfig {
    const models = modelOptionsFromChannels(channels);
    const imageModels = filterModelsByCapability(models, "image");
    const videoModels = filterModelsByCapability(models, "video");
    const textModels = filterModelsByCapability(models, "text");
    const audioModels = filterModelsByCapability(models, "audio");
    const imageModel = normalizeDefaultModel(normalizeModelOptionValue(config.imageModel || config.model, channels), imageModels);

    return {
        ...config,
        channels,
        models,
        imageModels,
        videoModels,
        textModels,
        audioModels,
        model: normalizeDefaultModel(normalizeModelOptionValue(config.model || imageModel, channels), imageModels),
        imageModel,
        videoModel: normalizeDefaultModel(normalizeModelOptionValue(config.videoModel, channels), videoModels),
        textModel: normalizeDefaultModel(normalizeModelOptionValue(config.textModel, channels), textModels),
        audioModel: normalizeDefaultModel(normalizeModelOptionValue(config.audioModel, channels), audioModels),
    };
}

function normalizeDefaultModel(value: string, options: string[]) {
    if (options.includes(value)) return value;
    return options[0] || value;
}
