import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type StateType = {
  /** 无人机 */
  uavDevices: API_DEVICE.domain.Device[]
  /** 无人机机库 */
  airportDevices: API_DEVICE.domain.Device[]
  /** 望楼设备 */
  wangloutDevices: API_DEVICE.domain.Device[]
  /** 其他设备 (机场等) */
  otherDevices: API_DEVICE.domain.Device[]
}

type ActionsType = {
  updateUavDevices: (uavDevices: StateType['uavDevices']) => void
  updateAirportDevices: (airportDevices: StateType['airportDevices']) => void
  updateWangloutDevices: (wangloutDevices: StateType['wangloutDevices']) => void
  updateOtherDevices: (otherDevices: StateType['otherDevices']) => void
}

const useMapDevicesStore = create<StateType & ActionsType>()(
  devtools(
    (set) => ({
      uavDevices: [],
      airportDevices: [],
      wangloutDevices: [],
      otherDevices: [],
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
    }),
    {
      name: 'map-devices',
      enabled: import.meta.env.DEV,
    },
  ),
)

export default useMapDevicesStore
