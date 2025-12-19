# ja-dushu-front

A React 18 + TypeScript + Vite single-page application that serves as a command-and-control console for UAVs, robots, and related devices. The UI combines Ant Design and Tailwind, integrates Cesium/Mapbox for geospatial views, and relies on Zustand and React Query for state and data management.

## Getting started

### Prerequisites
- Node.js (project uses `pnpm`; `pnpm-lock.yaml` is authoritative)
- pnpm installed globally

### Installation
```bash
pnpm install
```

### Development servers
Development configs live under `vite-config/dev`. Each script loads a different proxy target and optional `__DEV_MERGE_CONFIG__`:

- `pnpm dev` or `pnpm dev:82` (default backend)
- Other options: `dev:47`, `dev:103`, `dev:110`, `dev:105`, `dev:201`, `dev:240`, `dev:216`, `dev:235`, `dev:231`, `dev:idc`, `dev:yz`, `dev:wanglou`, `dev:zhongshan`, `dev:xiaoshan`, `dev:taixin`, `dev:changzhou`

### Building and checks
- Type-check: `pnpm ts`
- Lint: `pnpm lint`
- Production build: `pnpm build`
- Preview build (uses config.82): `pnpm preview --config ./vite-config/dev/config.82.ts`

## Runtime configuration
- `public/js/config.js` defines `window.config`; development merges with `__DEV_MERGE_CONFIG__` in `src/global/config.ts`.
- Common flags include `systemName`, `title`, `globalWs`, login URLs, imagery/terrain toggles, regional overlays, S3 credentials, and Sentry settings. Cesium requires `VITE_CESIUM_ACCESS_TOKEN`.
- Required static assets: `public/iconfonts`, `public/js/JessibucaPro`, `public/js/daotong`.

## Project structure
Key paths to explore:

- `src/main.tsx`: Bootstraps Sentry (`instrument.ts`), i18n, global styles, and the main router. Handles token initialization and share-video entry.
- `src/App.tsx`: Provides theming, global message/notification context, `GlobalState` side effects (websockets, overlays, toast relay), and layout composition.
- `src/router/`: Route declarations for situation awareness, events, action records, sources, organization, wayline editors, schedules, defence, alarms, documents, backtracking, control-room variants, and share views.
- `src/map/`: Cesium/Mapbox composition, overlay management, flight areas, reconstruction layers, density maps, and global map interactions.
- `src/pages/right/`: Right-side panels driven by `useRightMode` for device detail, measurement, events, radar, reconstruction, and Tanqi outer panel.
- `src/service/servers`: Axios clients with interceptors for auth, internationalization, and error handling. Main bases: control center, Jingqi, 4A, OTA, video, VOD, Diting/Tanqi, MCP, geo search, etc.
- `src/store/`: Zustand stores for user/session, websockets, map devices, overlays, flight areas, reconstruction, density maps, right-panel mode, theme, and toasts.
- `src/langs/`: i18n resources (`zh.yml`, `en.yml`).
- `src/worker/`: Comlink-wrapped workers for area wayline solutions and watermarking.
- `public/`: Static assets and configuration expected at runtime.

## Conventions
- Internationalization: All user-facing strings must use `t('key', { defaultValue })` and be added to both `src/langs/zh.yml` and `src/langs/en.yml`.
- Null-safety: Treat backend fields as nullable; use optional chaining, default values, and type guards.
- Auto-imports: `plugins/auto-import.ts` injects common hooks/utilities. Do not manually import identifiers already auto-imported.
- Networking: Dev proxies route `/proxyApi`, `/proxy4aApi`, `/proxyWsApi`, `/ws`, `/v3`, `/storage`, `/upload`, `/ja-map`, `/raster`, `/asr`, `/geoserver`, and Diting/Tanqi endpoints. Adjust when adding services.

## Deployment
Docker targets exist for AMD64 and ARM64 builds, pushing to private or Ali registries:

- `build:docker-amd` / `push:amd`
- `build:docker-arm` / `push:arm`
- `build:docker-public` / `push:public`
- `build:docker-public-arm` / `push:public-arm`

## Additional notes
- `pnpm ts` and `pnpm lint` must pass before completing work.
- Keep required files (`public/js/config.js`, icon fonts, JessibucaPro, Daotong assets) available at runtime to avoid build/runtime errors.
