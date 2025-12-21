# ja-dushu-front

一款基于 React 18、TypeScript 与 Vite 的单页应用，用作无人机、机器人等设备的指挥调度控制台。UI 采用 Ant Design + Tailwind，集成 Cesium/Mapbox 地图，并通过 Zustand 与 React Query 管理状态和数据。

## 快速开始

### 前置条件
- Node.js（推荐使用 `pnpm`，以 `pnpm-lock.yaml` 为准）
- 全局安装 pnpm

### 安装依赖
```bash
pnpm install
```

### 开发调试
开发配置位于 `vite-config/dev`，不同脚本指向不同代理目标并可合并 `__DEV_MERGE_CONFIG__`：

- `pnpm dev` 或 `pnpm dev:82`（默认后端）
- 其他选项：`dev:47`、`dev:103`、`dev:110`、`dev:105`、`dev:201`、`dev:240`、`dev:216`、`dev:235`、`dev:231`、`dev:idc`、`dev:yz`、`dev:wanglou`、`dev:zhongshan`、`dev:xiaoshan`、`dev:taixin`、`dev:changzhou`

### 构建与检查
- 类型检查：`pnpm ts`
- 代码规范：`pnpm lint`
- 生产构建：`pnpm build`
- 预览构建（使用 config.82）：`pnpm preview --config ./vite-config/dev/config.82.ts`

## 运行时配置
- `public/js/config.js` 定义 `window.config`；开发模式会与 `src/global/config.ts` 中的 `__DEV_MERGE_CONFIG__` 合并。
- 常见字段包括 `systemName`、`title`、`globalWs`、登录地址、影像/地形开关、区域覆盖、S3 凭据、Sentry 设置等。Cesium 需要 `VITE_CESIUM_ACCESS_TOKEN`。
- 必需静态资源：`public/iconfonts`、`public/js/JessibucaPro`、`public/js/daotong`。

## 项目结构
重点目录：

- `src/main.tsx`：初始化 Sentry（`instrument.ts`）、i18n、全局样式与路由，负责 token 处理及分享视频入口。
- `src/App.tsx`：提供主题、全局消息/通知上下文，挂载 `GlobalState`（WebSocket、覆盖物、toast 转发等）与整体布局。
- `src/router/`：路由声明，覆盖态势、事件、行动记录、资源、组织、航线编辑、排班、防御、告警、文档、回溯、控制室及分享视图。
- `src/map/`：Cesium/Mapbox 组合，管理覆盖物、飞行区、重建层、密度图及全局地图交互。
- `src/pages/right/`：右侧面板，基于 `useRightMode` 展示设备详情、测量、事件、雷达、重建及 Tanqi 外层面板。
- `src/service/servers`：封装带拦截器的 Axios 客户端，涵盖控制中心、警企、4A、OTA、视频、VOD、Diting/Tanqi、MCP、地理搜索等服务。
- `src/store/`：Zustand 状态，覆盖用户/会话、WebSocket、地图设备、覆盖物、飞行区、重建、密度图、右侧模式、主题与 toast。
- `src/langs/`：国际化资源（`zh.yml`、`en.yml`）。
- `src/worker/`：Comlink 封装的 worker，用于面积航线求解与图片水印。
- `public/`：运行时需要的静态资源与配置。

## 开发规范
- 国际化：所有用户可见文案须使用 `t('key', { defaultValue })`，并同步新增到 `src/langs/zh.yml` 与 `src/langs/en.yml`。
- 空值安全：后端字段默认可空，使用可选链、默认值、类型守卫进行防御式访问。
- 自动导入：`plugins/auto-import.ts` 已注入常用 hooks/工具，不得重复手动导入已自动注入的标识符。
- 网络代理：开发代理覆盖 `/proxyApi`、`/proxy4aApi`、`/proxyWsApi`、`/ws`、`/v3`、`/storage`、`/upload`、`/ja-map`、`/raster`、`/asr`、`/geoserver` 及 Diting/Tanqi 端点；新增服务时需同步调整。

## 部署
提供 AMD64 与 ARM64 的 Docker 目标，可推送至私有或阿里镜像仓库：

- `build:docker-amd` / `push:amd`
- `build:docker-arm` / `push:arm`
- `build:docker-public` / `push:public`
- `build:docker-public-arm` / `push:public-arm`

## 其他说明
- 完成交付前必须通过 `pnpm ts` 与 `pnpm lint`。
- 运行时需确保 `public/js/config.js`、图标字体、JessibucaPro 与 Daotong 资源可用，以避免构建/运行错误。
