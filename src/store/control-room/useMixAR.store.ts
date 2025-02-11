import { Feature, GeoJsonProperties, Geometry } from 'geojson'
import { RBush } from 'geojson-rbush'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Viewer } from 'cesium'

/** UAV 属性 */
export type UavProperties = Partial<{
  altitude: number
  cameraType: number
  gimbalYaw: number
  gimbalPitch: number
  height: number
  latitude: number
  lensType: number
  longitude: number
  width: number
  zoomFactor: number
}>

/** Cesium 在地图上的四个角 */
export type GimbalPick = Partial<{
  leftBottom?: number[]
  leftTop?: number[]
  rightTop?: number[]
  rightBottom?: number[]
  center?: number[]
}>

/** AR */
export type ArFeature = {
  coodinates: number[][]
  properties?: any
  isClosed?: boolean
}

/** 起飞时的信息 */
export type StartInfo = {
  startAGL: number
  startHeight: number
}

type StateType = {
  enable: boolean
  uavProperties: UavProperties
  referenceLastAR: boolean
  referenceLastMap: boolean
  fov: number[][]
  features: Feature[]
  arData: ArFeature[]
  startInfo: StartInfo
  source_frame_height: number
  source_frame_width: number
  gimbalPick: GimbalPick
  rTree: RBush<Geometry, GeoJsonProperties> | null
  /** 航线信息 */
  airpointPositions: { pointX: number; pointY: number; pointZ: number }[]
  /** 航线 AR */
  airpointPositionsAR: number[][]
  /** 覆盖物 AR */
  overlaiesAR: number[][][]

  cesiumViewer: Viewer | null

  /** ====== 3D 虚实融合 ====== */
  roads: API_GEO_SERACH.res.RoadDataRes | null
  aois: API_GEO_SERACH.res.AOIDataRes | null
  pois: API_GEO_SERACH.res.POIDataRes | null
  overlaies: GeoJSON.FeatureCollection<Geometry, GeoJsonProperties> | null
  roadsRTree: RBush<GeoJSON.Geometry, GeoJsonProperties> | null
  aoisRTree: RBush<GeoJSON.Geometry, GeoJsonProperties> | null
  poisRTree: RBush<GeoJSON.Geometry, GeoJsonProperties> | null
  overlayRTree: RBush<GeoJSON.Geometry, GeoJsonProperties> | null
}

type ActionsType = {
  updateEnable: (enable: boolean) => void
  updateFeatures: (features: StateType['features']) => void
  updateState: (state: Partial<StateType>) => void
  updateUavProperties: (uavProperties: UavProperties) => void
  updateArData: (arData: StateType['arData']) => void
  updateStartInfo: (startInfo: StateType['startInfo']) => void
  updateGimbalPick: (gimbalPick: StateType['gimbalPick']) => void
  updateRTree: (rTree: StateType['rTree']) => void
  /** 更新航线信息 */
  updateAirpointPositions: (
    airpointPositions: StateType['airpointPositions'],
  ) => void
  /** 更新航线 AR */
  updateAirpointPositionsAR: (
    airpointPositionsAR: StateType['airpointPositionsAR'],
  ) => void
  updateOverlaiesAR: (overlaiesAR: StateType['overlaiesAR']) => void

  updateCeisumViewer: (cesiumViewer: StateType['cesiumViewer']) => void

  /** ====== 3D 虚实融合 ====== */
  updateRoads: (roads: StateType['roads']) => void
  updateAOIs: (aois: StateType['aois']) => void
  updatePOIs: (pois: StateType['pois']) => void
  updateOverlaies: (overlaies: StateType['overlaies']) => void
  updateRoadsRTree: (roadsRTree: StateType['roadsRTree']) => void
  updateAOIsRTree: (aoisRTree: StateType['aoisRTree']) => void
  updatePOIsRTree: (poisRTree: StateType['poisRTree']) => void
  updateOverlayRTree: (overlayRTree: StateType['overlayRTree']) => void
}

/** 虚实融合 */
const useMixARStore = create<StateType & ActionsType>()(
  devtools(
    (set) => ({
      enable: false,
      features: [],
      referenceLastAR: false,
      referenceLastMap: false,
      source_frame_height: 0,
      source_frame_width: 0,
      fov: [],
      uavProperties: {},
      gimbalPick: {},
      arData: [],
      startInfo: {
        startAGL: 0,
        startHeight: 0,
      },
      rTree: null,
      airpointPositions: [],
      airpointPositionsAR: [],
      overlaiesAR: [],
      roads: null,
      aois: null,
      pois: null,
      overlaies: null,
      roadsRTree: null,
      aoisRTree: null,
      poisRTree: null,
      overlayRTree: null,
      cesiumViewer: null,

      updateEnable: (enable) => {
        set({ enable, arData: [], features: [] }, false, 'updateEnable')
      },
      updateFeatures: (features) => {
        set({ features }, false, 'updateFeatures')
      },
      updateStartInfo: (startInfo) => {
        set({ startInfo }, false, 'updateStartInfo')
      },
      updateState: (state) => {
        set((prev) => ({ ...prev, ...state }), false, 'updateState')
      },
      updateUavProperties: (uavProperties) => {
        set(
          {
            uavProperties,
            source_frame_width: uavProperties.width ?? 0,
            source_frame_height: uavProperties.height ?? 0,
          },
          false,
          'updateUavProperties',
        )
      },
      updateGimbalPick: (gimbalPick) => {
        set({ gimbalPick }, false, 'updateGimbalPick')
      },
      updateArData: (arData) => {
        set({ arData }, false, 'updateArData')
      },
      updateRTree: (rTree) => {
        set({ rTree }, false, 'updateRTree')
      },
      updateAirpointPositions: (airpointPositions) => {
        set({ airpointPositions }, false, 'updateAirpointPositions')
      },
      updateAirpointPositionsAR: (airpointPositionsAR) => {
        set({ airpointPositionsAR }, false, 'updateAirpointPositionsAR')
      },
      updateOverlaiesAR: (overlaiesAR) => {
        set({ overlaiesAR }, false, 'updateOverlaiesAR')
      },
      updateRoads: (roads) => {
        set({ roads }, false, 'updateRoads')
      },
      updateAOIs: (aois) => {
        set({ aois }, false, 'updateAOIs')
      },
      updatePOIs: (pois) => {
        set({ pois }, false, 'updatePOIs')
      },
      updateOverlaies: (overlaies) => {
        set({ overlaies }, false, 'updateOverlaies')
      },
      updateRoadsRTree: (roadsRTree) => {
        set({ roadsRTree }, false, 'updateRoadsRTree')
      },
      updateAOIsRTree: (aoisRTree) => {
        set({ aoisRTree }, false, 'updateAOIsRTree')
      },
      updatePOIsRTree: (poisRTree) => {
        set({ poisRTree }, false, 'updatePOIsRTree')
      },
      updateCeisumViewer: (cesiumViewer) => {
        set({ cesiumViewer }, false, 'updateCeisumViewer')
      },
      updateOverlayRTree: (overlayRTree) => {
        set({ overlayRTree }, false, 'updateOverlayRTree')
      },
    }),
    {
      name: 'mix-ar-store',
      enabled: process.env.NODE_ENV === 'development' && false,
    },
  ),
)

export default useMixARStore
