import { getDensityStatistics } from '@/service/modules/db-api'
import mitt from 'mitt'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { getResolution } from 'h3-js'
import { dft } from '@/constant/time-fmt'

type StateType = {
  /** 历史 (丁串串) */
  densityMap: Map<
    string,
    {
      h3Code: string
      color: string
    }
  >
  /** 实时 (十七) */
  realDensityMap: Map<
    string,
    {
      h3Code: string
      color: string
    }
  >
  densityMapExpiration: number
}

type ActionsType = {
  updateDensityMap: (data: StateType['densityMap']) => void
  updateRealDensityMap: (data: StateType['realDensityMap']) => void
  updateDensityMapExpiration: (data: number) => void
}

const useDensityMapStore = create<StateType & ActionsType>()(
  devtools(
    (set) => ({
      densityMap: new Map(),
      realDensityMap: new Map(),
      densityMapExpiration: 60, // 默认 60 分钟
      updateDensityMap: (data) => {
        set({ densityMap: data }, false, 'updateDensityMap')
      },
      updateRealDensityMap: (data) => {
        set({ realDensityMap: data }, false, 'updateRealDensityMap')
      },
      updateDensityMapExpiration: (data) => {
        set({ densityMapExpiration: data }, false, 'updateDensityMapExpiration')
      },
    }),
    {
      name: 'densityMap',
      enabled: import.meta.env.DEV,
    },
  ),
)

export default useDensityMapStore

const resolutionMap = new Map<number, number>(
  [
    [15, 0.000000895],
    [14, 0.000006267],
    [13, 0.00004387],
    [12, 0.000307092],
    [11, 0.002149643],
    [10, 0.015047502],
    [9, 0.105332513],
    [8, 0.737327598],
    [7, 5.16129336],
    [6, 36.129062164],
    [5, 252.903858182],
    [4, 1770.347654491],
  ].map((e) => [e[0], e[1] * 1_000_000]),
)

/**
 * 根据人口密度计算颜色
 * @param count 人口数量
 * @param h3Resolution H3 分辨率
 * @returns 十六进制颜色代码
 */
export const getCrowdedColor = (
  count: number,
  h3Resolution: number,
): string => {
  // 面积 (m²)
  const area = resolutionMap.get(h3Resolution) ?? Number.MAX_VALUE
  // 人口密度 (人/m²)
  const density = count / area
  // 极度拥挤
  if (density >= 1) {
    return '#f92633' // 红色
  }
  // 拥挤
  if (density >= 0.7) {
    return '#ff5d00' // 橙色
  }
  // 稍微拥挤
  if (density >= 0.3) {
    return '#efa600' // 黄色
  }
  // 稀疏
  return '#00c151' // 绿色
}

/** 获取历史密集图 */
export const useGetDensityStatistics = (payload: {
  actionId?: number
  deviceId?: string
  expireTime?: number
}) => {
  const queryClient = useQueryClient()
  const { data } = useQuery(
    {
      queryKey: ['densityStatistics', payload],
      queryFn: () =>
        getDensityStatistics({
          ...payload,
          startTime: payload.expireTime
            ? dayjs().subtract(payload.expireTime, 'minute').format(dft)
            : '1970-01-01 00:00:00',
          endTime: dayjs().format(dft),
        }),
      select: (data) => data.data,
    },
    queryClient,
  )

  useEffect(() => {
    if (!data) {
      return
    }

    const densityMap = new Map<string, { h3Code: string; color: string }>()

    data.forEach((item) => {
      densityMap.set(item.h3Code, {
        h3Code: item.h3Code,
        color: getCrowdedColor(item.averageDensity, item.resolution),
      })
    })

    useDensityMapStore.getState().updateDensityMap(densityMap)

    return () => {
      useDensityMapStore.getState().updateDensityMap(new Map())
    }
  }, [data])
}

type Item = { h3Code: string; averageDensity: number }
type Payload = {
  deviceId: string
  data: Item[]
}
export const realDensityMapEmitter = mitt<{
  densityMap: Payload
}>()
/**
 * 监听实时密集图数据
 * @param filterFn 过滤函数，返回 true 时表示需要更新
 */
export const useListenRealDensityMap = (
  filterFn: (deviceId: string) => boolean,
) => {
  useEffect(() => {
    const fn = ({ data, deviceId }: Payload) => {
      if (!filterFn(deviceId)) {
        return
      }
      const realDensityMap = new Map<string, { h3Code: string; color: string }>(
        useDensityMapStore.getState().realDensityMap.entries(),
      )

      data.forEach((item) => {
        realDensityMap.set(item.h3Code, {
          h3Code: item.h3Code,
          color: getCrowdedColor(
            item.averageDensity,
            getResolution(item.h3Code),
          ),
        })
      })
      useDensityMapStore.getState().updateRealDensityMap(realDensityMap)
    }

    realDensityMapEmitter.on('densityMap', fn)
    return () => {
      realDensityMapEmitter.off('densityMap', fn)
      useDensityMapStore.getState().updateRealDensityMap(new Map())
    }
  }, [])
}
