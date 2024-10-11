import { getDeviceDetail } from '@/service/modules/device'
import { createContext } from 'react'
import { createStore, useStore } from 'zustand'
import { devtools } from 'zustand/middleware'

type StateType = {
  deviceId: string
  productKey: string
  deviceDetail: API_DEVICE.domain.Device | null
  propsHave: Record<string, any>
  serviceHave: Record<string, any>
}

type ActionsType = {
  updateDeviceDetail: (deviceDetail: StateType['deviceDetail']) => void
}

export const createDeviceDetailStore = () => {
  const initalState: StateType = {
    deviceId: '',
    productKey: '',
    deviceDetail: null,
    propsHave: {},
    serviceHave: {},
  }

  return createStore<StateType & ActionsType>()(
    devtools(
      (set) => ({
        ...initalState,
        updateDeviceDetail: (deviceDetail: StateType['deviceDetail']) => {
          if (!deviceDetail) {
            set({ deviceDetail }, false, 'updateDeviceDetail')
            return
          }
          const { deviceModel } = deviceDetail
          const propsHave: StateType['propsHave'] = {}
          let serviceHave: StateType['serviceHave'] = {}
          if (deviceModel) {
            deviceModel.properties?.forEach((e) => {
              propsHave[e.identifier] = e
            })
            serviceHave = deviceModel.services ?? {}
          }
          set(
            {
              deviceDetail,
              propsHave,
              serviceHave,
              deviceId: deviceDetail.deviceId,
              productKey:
                deviceDetail.productKey ||
                deviceDetail.deviceModel?.productKey ||
                '',
            },
            false,
            'updateDeviceDetail',
          )
        },
      }),
      {
        name: 'device-detail-store',
        enabled: import.meta.env.DEV,
      },
    ),
  )
}

export type DeviceDetailStoreType = ReturnType<typeof createDeviceDetailStore>

export const DeviceDetailStoreContext =
  createContext<DeviceDetailStoreType | null>(null)

export const useDeviceDetailStore = <T>(
  select: (state: StateType & ActionsType) => T,
) => {
  const store = useContext(DeviceDetailStoreContext)!
  return useStore(store, select)
}

/** 创建 deviceDetailStore */
export const useCreateDeviceDetailStore = (deviceId: string) => {
  const deviceDetailStoreRef = useRef<DeviceDetailStoreType | null>(null)
  if (!deviceDetailStoreRef.current) {
    deviceDetailStoreRef.current = createDeviceDetailStore()
  }
  const queryClient = useQueryClient()
  const { isLoading } = useQuery(
    {
      queryKey: ['deviceDetail', deviceId],
      queryFn: async () => {
        const resp = await getDeviceDetail(deviceId)
        deviceDetailStoreRef.current!.getState().updateDeviceDetail(resp.data)
        return resp
      },
    },
    queryClient,
  )
  return {
    store: deviceDetailStoreRef.current,
    isLoading,
  }
}
