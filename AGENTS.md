# AGENTS

## What this app is

- `ja-dushu-front` is a React 18 + TypeScript + Vite SPA used as a UAV/robot and other device command-and-control console with mapping, video, action plans, alarms, and device management.
- UI stack: Ant Design (plus `@ant-design/x`), Tailwind (CSS vars in `src/assets/style/theme/root.less`), Zustand for state, React Query for data, i18n (zh/en), Cesium/Mapbox for geospatial, Sonner for toasts, Sentry for telemetry.
- Version markers: version of `package.json`.

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

## International

- All user-facing strings must use `t('key', { defaultValue: 'default string' })` from `react-i18next`. Add new keys to `src/langs/zh.yml` and `src/langs/en.yml`. Avoid hardcoding strings in components.

## Null-Safe Data Handling

- Must treat all backend fields as potentially null or undefined, and MUST use optional chaining (?.), null checks, default values (??), and type guards to ensure safe, robust access to API data.

## Auto Import Rules

This project uses automatic imports configured in `plugins/auto-import.ts`.

Before adding or modifying imports:

- Check `plugins/auto-import.ts`.
- Any identifiers declared there MUST NOT be manually imported.

Do NOT add explicit import statements for symbols that are already auto-imported.

## Code Style

## Code tidying requirements:

- Group related statements into logical blocks and separate blocks with blank lines.
- Ensure naming and early returns make the flow clear.
- Add concise Chinese comments for: business rules, edge cases, and any non-trivial reasoning.

### React Hooks

- Do not use `useCallback`. Use `useMemoizedFn` from `ahooks` instead.

## Verification Checklist (Required)

Before finishing the task, you MUST:

1. Run `pnpm ts` and fix all TypeScript errors.
2. Run `pnpm lint` and fix all lint issues.

Only after both commands pass successfully may you provide the final answer.
