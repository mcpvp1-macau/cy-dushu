import { expose } from 'comlink'

import { get_polygon_area_wayline } from '@/wasm/area_wayline/area_wayline'

const WaylineAreaPath = {
  solve: get_polygon_area_wayline,
}

export type WorkerAPI = typeof WaylineAreaPath

expose(WaylineAreaPath)
