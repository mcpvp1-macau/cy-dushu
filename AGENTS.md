# AGENTS

## What this app is

- `ja-dushu-front` is a React 18 + TypeScript + Vite SPA used as a UAV/robot and other device command-and-control console with mapping, video, action plans, alarms, and device management.
- UI stack: Ant Design (plus `@ant-design/x`), Tailwind (CSS vars in `src/assets/style/theme/root.less`), Zustand for state, React Query for data, i18n (zh/en), Cesium/Mapbox for geospatial, Sonner for toasts, Sentry for telemetry.
- Version markers: version of `package.json`.

## Runbook

- Install deps with pnpm (lockfiles for pnpm and npm exist; prefer pnpm): `pnpm install`.
- Dev servers map to different backends: `pnpm dev:82` (default), `dev:47`, `dev:103`, `dev:110`, `dev:105`, `dev:201`, `dev:240`, `dev:216`, `dev:235`, `dev:231`, `dev:idc`, `dev:yz`, `dev:wanglou`, `dev:zhongshan`, `dev:xiaoshan`, `dev:taixin`, `dev:changzhou`. Each loads a `vite-config/dev/config.*.ts` with proxy targets and optional `__DEV_MERGE_CONFIG__`.
- Build/type/lint: `pnpm build` (tsc then Vite), `pnpm skip-check-build` (no tsc), `pnpm ts`, `pnpm lint`. Preview: `pnpm preview --config ./vite-config/dev/config.82.ts`.
- Docker: `build:docker-*`/`push:*` tags to `registry.jingan.com:32008/ja` or Ali registry.
- Required runtime files: `public/js/config.js` (defines `window.config`), `public/iconfonts`, `public/js/JessibucaPro`, `public/js/daotong`. Cesium needs `VITE_CESIUM_ACCESS_TOKEN`.

## Configuration model

- `public/js/config.js` sets `window.config`; merged with `__DEV_MERGE_CONFIG__` from Vite dev configs inside `src/global/config.ts`. Key flags: `systemName`, `title`, `globalWs`, `loginUrl/loginHttps`, `defaultImageries`, `useTerrain`, `useHangzhouBanAreas`, `useGuizhouFarm`, `useGuizhouProjects`, `is72`, `isBinzhou`, `isXiaoshan`, `useUavAirportDoc/Upload/Logs`, `useFlightReporting`, `useTanqi`, `useFlight3D`, `robotDogMap`, `enableJessibucaMetrics`, `defaultTheme`, `uavHeightLimit`, `noFlyZoneDisplayStyle`, `usePayloadP3Upload`, `useRelayDevice`, `useMaintenanceStatusSwitch`, `accessKeyId/secretAccessKey`, `sentryDsn/sentryProjectId`, `bucketName`, etc.
- Networking: proxies in `vite-config/dev/config.*.ts` route `/proxyApi`, `/proxy4aApi`, `/proxyWsApi`, `/ws`, `/v3`, `/storage`, `/upload`, `/ja-map`, `/raster`, `/asr`, `/geoserver`, and Diting/Tanqi endpoints. Adjust when adding new services.

## Entry & layout

- `src/main.tsx` bootstraps: loads `instrument.ts` (Sentry), i18n, global styles, favicon swap, and React Query provider. If URL matches `/share/video/...`, it mounts a minimal router to `pages/share-video`; otherwise it runs `init-token.ts` to read `token` from query/localforage, redirects to 4A login on failure, prefetches user/menus/system info/device tree/vendor back URL (`useUserStore`), then renders the main router with React Query Devtools.
- `src/App.tsx` wraps everything in `AppThemeProvider` (antd theme + data-theme via `useThemeStore`). It provides Ant message/notification contexts, mounts `GlobalState` (websockets, device fetch, overlays, reconstruction, flight areas, device overlays, toast relay, relay modal), and `FixedWindowArea` for floating video/detail windows. Header + left navigator hide on share routes; Cesium global map + right sidebar render only when current route ID is NOT in the hide set (`control-room`, `sources`, `schedule`, `organization`, `backtracking`, `share`).
- Router (`src/router/index.tsx` + modules):
  - `/` `situation` (action list/detail, source lists by device type, event tab)
  - `/events`, `/event-resolve/:eventId`
  - `/action-record`
  - `/sources`
  - `/organization`
  - `/wayline` (list + editors: standard, area, swarm, robot dog, point-cloud 3D)
  - `/schedule` (action-plan list/table)
  - `/defence`
  - `/alarms`
  - `/documents` (tutorial pages, videos, upload)
  - `/backtracking` (device/action/control-room playback)
  - `/control-room/*` (uav, wanglou, robot dog/cluster, laser weapon, ugv, others)
  - `/share/control-room` (embedded read-only control room), `/share/video/:productKey/:deviceId/:videoId/:token`.

## State, data, and conventions

- State: Heavy use of Zustand stores with devtools/persist (often enabled only in dev). Key stores: `useUser.store.ts` (token/user/menu/system config/device tree/vendor back URL), `useGlobalWebSocket.store.ts` (realtime status/targets/logs/action item status), `useMapDevices.store.ts` (device lists, states, tracks, videos), `useLayerAndOverlay.store.ts`, `useFlightArea.store.ts`, `useReconstructionMap.store.ts`, `useDensityMap.store.ts`, `useRightMode.store.ts` (right-panel mode/detail), `useTheme.store.ts`, `useToast.ts`, context stores for control-room variants, etc.
- Data fetching: React Query with defaults in `src/global/query-client.ts` (no refetch on window focus, retry up to 3 with backoff; skips retry for `LiqunAxios` `common` or `dbApi` errors). Prefer `useQueryClient()` from auto-imports.
- Auto-imports (`plugins/auto-import.ts`) inject React hooks, `useTranslation`, React Query hooks, `globalConfig`, `dayjs` (`@/utils/pkg-transport`), `localforage` as `local`, etc. Avoid duplicating those imports.
- API layer: `src/service/servers` defines `LiqunAxios` clients with interceptors (`withToken`, `withInternational`, `unAuthorized` redirect/logout, `shouldShowError`). Main bases: `serverControlCenter` (`/proxyApi/otherService/${systemName}/controlServer`), `serverJingqi` (jingqiServer), `server4A` (auth/menus/user/system), plus servers for OTA, video, vod, Diting/Tanqi (`/ditingTanqiServer`), MCP, human-loop, geo search, etc. Response typing via `Responses<T>` (`common` expects `{code,message,data}` success code `SUCCESS`).
- WebSocket: `components/GlobalState/GlobalWebSocket.tsx` connects to `${globalConfig.globalWs}://${location.host}/ws/${username}` with 10s heartbeat (`src/constant/websocket.ts`). Handles device properties/online status (with inactive track capture), radar targets, density maps, event/alarm pushes, action logs, temporary detect results, action item status, dialog responses, reconstruction completion, flight area warnings, 2D reconstruction updates, relay notifications, SHJH approvals, overlay share notices; invalidates React Query caches as needed; clears old radar targets periodically.
- Messaging/toasts: `hooks/useAppMsg` + `msgMitt` for Ant `message`; `useNotification.ts` for Ant notifications; `components/GlobalState/GlobalToast` exposes `globalToastEmitter` (Sonner).
- Theme/i18n: `useThemeStore` persists mode (`light`/`dark`/`system`/`jh-police`) and sets `data-theme`; Ant theme tokens from `src/config/theme-config.ts`. i18n resources in `src/langs/{zh,en}.yml`, default from `localStorage('lang')` or zh; header toggles language.

## Maps, overlays, and media

- `src/map/CesiumMap` builds the Cesium viewer (2D/3D toggle, optional terrain, imagery from `globalConfig.defaultImageries`, custom overlays for Hangzhou/Guizhou/Shanghai/Binzhou/Xiaoshan). Toolbar components: map space/layers, overlay manager, flight area config, reconstruction (3D/2D) toggles.
- `src/map/GlobalMap` composes Cesium services: device markers/tracks, global pick/right-click handlers, overlay & flight area display/editing (geometry drawing, measurement, flight area creation), target points, events, wayline editing/viewing, reconstruction layers, density map, picture-on-map, position picker, bottom safe area, etc.
- `GlobalState/MapDevices` hydrates device stores via `getAllDeviceListV3`; `LayerAndOverlay` + `Overlay` fetch layers/overlays; `ReconstructionMap` fetches reconstruction groups/overlays/2D results; `FlightArea` loads flight-area groups; `DeviceOverlays` loads per-device overlays.
- Right-side panels (`src/pages/right`) switch on `useRightMode` to show device detail, point/geometry drawers, measuring, event detail, radar targets, reconstruction/flight-area/device overlay detail, plus an outer Tanqi panel (`RightOuterEnum.TANQI`).
- Video: `pages/share-video` streams via `Jessibuca`/`xgplayer` using AK tokens (`verifyToken`); share route refreshes stream on stale TS. Device media upload via `useUploadMinio` to `/upload/{bucket}` (needs `globalConfig.bucketName` or defaults).
- Workers/WASM: `src/worker/area_wayline_solution.ts` wraps `wasm/area_wayline` for polygon area waylines (Comlink); `worker/watermark_image.ts` adds watermark text. Top-level await + wasm handled in Vite config.

## Observability & auth

- Sentry initializes in `src/instrument.ts` if `globalConfig.sentryDsn` is set, with username/token tags and replay enabled.
- Auth: `init-token.ts` reads `?token` to localforage and strips it from the URL; `useUserStore.logout` redirects to `loginUrl?systemName=...&fallback=...`. 4A APIs live under `/proxyApi`.

## UX chrome

- Header (`src/components/Header`) hosts POI search, theme switch, language toggle, fullscreen, optional vendor back link (from `backurl` param), settings, user menu. Navigator (`src/components/Navigator`) filters menu icons based on `menus`/`menuMap` from 4A. `Update` modal shows release notes when `globalConfig.version` changes. Context menu on the page is disabled in `index.html`.

## Adding/changing code

- Prefer using existing stores/query keys; invalidate caches instead of manual refetch loops.
- If adding routes that should hide the Cesium map, include the route ID in `hidenSet` in `src/App.tsx`.
- New API clients should reuse `LiqunAxios` servers or add new ones with interceptors. Remember to update dev proxy configs for new backends.
- Keep imports minimal because of auto-import; most React hooks, `useQuery*`, `useTranslation`, `dayjs`, and `globalConfig` are already injected.
- For map features, consider both 2D/3D paths, respect `globalConfig` toggles (terrain, regional layers), and reuse right-panel modes (`RightModeEnum`).
- When dealing with uploads or media, ensure `bucketName`, `accessKeyId/secretAccessKey`, and proxy targets in `config.js` are correct; Jessibuca metrics toggle via `enableJessibucaMetrics`.
