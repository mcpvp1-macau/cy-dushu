import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type Track = { lng: number; lat: number; alt: number }

type StateType = {
  /** 无人机 */
  uavDevices: API_DEVICE.domain.Device[]
  /** 无人机机库 */
  airportDevices: API_DEVICE.domain.Device[]
  /** 望楼设备 */
  wangloutDevices: API_DEVICE.domain.Device[]
  /** 其他设备 (机场等) */
  otherDevices: API_DEVICE.domain.Device[]
  /** 所有设备 */
  allDevices: API_DEVICE.domain.Device[]
  /** 所有设备 */
  allDevicesMap: { [key: string]: API_DEVICE.domain.Device[] }
  /** 机器人狗 */
  robotDogDevices: API_DEVICE.domain.Device[]
  /** 无人机状态 */
  uavStates: {
    [deviceId: string]: {
      longitude: number
      latitude: number
      altitude: number
      height: number
      uavYaw: number
      gimbalYaw: number
      gimbalPitch: number
      lensType: string
      zoomFactor: number
      cameraType: string
    }
  }
  /** 无人机轨迹 */
  uavTracks: { [deviceId: string]: { path: Track[]; useCallback: boolean } }
  /** 设备 (非活) 轨迹 */
  deviceInActiveTracks: { [deviceId: string]: Track[][] }
  /** 扫描区域 */
  scanAreas: {
    [deviceId: string]: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>
  }
  /** 扫描区域是否启用 */
  scanAreasEnable: {
    [deviceId: string]: boolean
  }
  /** 视频跟踪 */
  followedVideos: {
    [deviceId: string]: { productKey: string; videoId: string }
  }
  /** 视频投射 */
  projectedVideos: {
    [deviceId: string]: {
      videoElement: HTMLVideoElement | null
    }
  }
}

type ActionsType = {
  updateUavDevices: (uavDevices: StateType['uavDevices']) => void
  updateAirportDevices: (airportDevices: StateType['airportDevices']) => void
  updateWangloutDevices: (wangloutDevices: StateType['wangloutDevices']) => void
  updateOtherDevices: (otherDevices: StateType['otherDevices']) => void
  updateAllDevices: (allDevices: StateType['allDevices']) => void
  updateAllDevicesMap: (allDevicesMap: StateType['allDevicesMap']) => void
  updateRobotDogDevices: (robotDogDevices: StateType['robotDogDevices']) => void
  /** 更新无人机轨迹 */
  updateUavTracks: (uavTracks: StateType['uavTracks']) => void
  /** 更新设备 (非活) 轨迹 */
  updateDeviceInActiveTracks: (
    deviceInActiveTracks: StateType['deviceInActiveTracks'],
  ) => void
  /** 更新无人机状态 */
  updateUavStates: (uavStates: StateType['uavStates']) => void
  updateScanAreas: (scanAreas: StateType['scanAreas']) => void
  updateFollowedVideos: (followedVideos: StateType['followedVideos']) => void
  updateProjectedVideos: (projectedVideos: StateType['projectedVideos']) => void
  updateScanAreasEnable: (scanAreasEnable: StateType['scanAreasEnable']) => void
}

const useMapDevicesStore = create<StateType & ActionsType>()(
  devtools(
    (set) => ({
      uavDevices: [],
      airportDevices: [],
      wangloutDevices: [],
      otherDevices: [],
      allDevices: [],
      allDevicesMap: {},
      robotDogDevices: [],
      uavTracks: {},
      deviceInActiveTracks: {},
      uavStates: {},
      scanAreas: {},
      scanAreasEnable: {},
      followedVideos: {},
      projectedVideos: {},
      updateUavDevices: (uavDevices) => {
        set({ uavDevices }, false, 'updateUavDevices')
      },
      updateAirportDevices: (airportDevices) => {
        set({ airportDevices }, false, 'updateAirportDevices')
      },
      updateWangloutDevices: (wangloutDevices) => {
        set({ wangloutDevices }, false, 'updateWangloutDevices')
      },
      updateOtherDevices: (otherDevices) => {
        set({ otherDevices }, false, 'updateOtherDevices')
      },
      updateAllDevices: (allDevices) => {
        set({ allDevices }, false, 'updateAllDevices')
      },
      updateAllDevicesMap: (allDevicesMap) => {
        set({ allDevicesMap }, false, 'updateAllDevices')
      },
      updateRobotDogDevices: (robotDogDevices) => {
        set({ robotDogDevices }, false, 'updateRobotDogDevices')
      },
      updateUavTracks: (uavTracks) => {
        set({ uavTracks }, false, 'updateUavTracks')
      },
      updateDeviceInActiveTracks: (deviceInActiveTracks) => {
        set({ deviceInActiveTracks }, false, 'updateDeviceInActiveTracks')
      },
      updateUavStates: (uavStates) => {
        set({ uavStates }, false, 'updateUavStates')
      },
      updateScanAreas: (scanAreas) => {
        set({ scanAreas }, false, 'updateScanAreas')
      },
      updateFollowedVideos: (followedVideos) => {
        set({ followedVideos }, false, 'updateFollowedVideos')
      },
      updateProjectedVideos: (projectedVideos) => {
        set({ projectedVideos }, false, 'updateProjectedVideos')
      },
      updateScanAreasEnable: (scanAreasEnable) => {
        set({ scanAreasEnable }, false, 'updateScanAreasEnable')
      },
    }),
    {
      name: 'map-devices',
      enabled: import.meta.env.DEV,
    },
  ),
)

export default useMapDevicesStore
