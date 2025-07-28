import { getGimbalInfo } from '@/constant/uav/gimbalV2'
import { createJSONStorage, persist } from 'zustand/middleware'
import mitt from 'mitt'
import { create } from 'zustand'

export type ProcessedResultType = {
  lon: number
  lat: number
  alt: number
  yaw: number
  pitch: number
  roll: number
  focal: number
  width: number
  aspectRatio: number
  zoomFactor: number
  imgUrl: string
  imgType: 'jpeg' | 'tiff' // 图片类型
  layer?: string // 图层名称，tiff 时有
  bboxMinX?: number // tiff 时有
  bboxMinY?: number // tiff 时有
  bboxMaxX?: number // tiff 时有
  bboxMaxY?: number // tiff 时有
}

type StateType = {
  reconstruction2DList: API_RECONSTRUCTION.Reconstruction2DListItem[]
  /** 过程中的照片结果 (边飞边建) */
  processedResults: ProcessedResultType[]
  hiddenReconstruction2DSet: Set<number>
}

type ActionsType = {
  updateReconstruction2DList: (
    data: API_RECONSTRUCTION.Reconstruction2DListItem[],
  ) => void
  /** 更新过程中的照片结果 */
  updateProcessedResults: (results: ProcessedResultType[]) => void
  updateHiddenReconstruction2DSet: (set: Set<number>) => void
}

const useReconstruction2DMapStore = create<StateType & ActionsType>()(
  persist(
    (set) => ({
      processedResults: [],
      reconstruction2DList: [],
      hiddenReconstruction2DSet: new Set(),
      updateReconstruction2DList: (data) => set({ reconstruction2DList: data }),
      updateProcessedResults: (results) =>
        set({
          processedResults: results,
        }),
      updateHiddenReconstruction2DSet: (st) => {
        set({
          hiddenReconstruction2DSet: st,
        })
      },
    }),
    {
      storage: createJSONStorage(() => localStorage, {
        replacer: (key: string, value: any) => {
          if (key === 'hiddenReconstruction2DSet') {
            return Array.from(value)
          }
          if (key === 'reconstruction2DList') {
            return []
          }
          if (key === 'processedResults') {
            return []
          }
          return value
        },
        reviver: (key: string, value: any) => {
          if (key === 'hiddenReconstruction2DSet') {
            return new Set(value)
          }
          return value
        },
      }),
      name: 'reconstruction-2d-map',
    },
  ),
)

export interface ProcessEventImageData {
  requestId: string
  actionId: number
  deviceId: string
  index: number
  imageUrl: string // 图片地址
  taskDone: boolean // 是否已完成，为true时imageUrl为合成的大图
  imageType: 'jpeg' | 'tiff' // jpeg/tiff
  meta?: {
    // 图片格式为 tiff 时为空
    absoluteAltitude: number
    gimbalPitch: number
    gimbalRoll: number
    gimbalYaw: number
    gpsLatitude: number
    gpsLongitude: number
    lenType: 'WIDE' | 'IR' | 'ZOOM' // WIDE/IR/ZOOM
    productName: string // 有镜头型号使用镜头型号，没有镜头使用无人机型号，如 H30T,ZH20T,M30T,M3TD,M4TD
    relativeAltitude: number
  }
}

export const processEventImageDataEmitter = mitt<{
  processEventImageData: ProcessEventImageData
}>()

/**
 * 监听实时处理结果
 * @param filterFn 过滤函数，返回true时才会处理
 */
export const useListenRealProcessedResults = (
  filterFn: (deviceId: string, actionId: number) => boolean,
) => {
  const queryClient = useQueryClient()

  const fn = (data: ProcessEventImageData) => {
    if (!filterFn(data.deviceId, data.actionId)) {
      return
    }

    const processedResults =
      useReconstruction2DMapStore.getState().processedResults

    const gimbalInfo = getGimbalInfo(data.meta?.productName ?? 'M4TD')
    const lenInfo =
      data.meta?.lenType === 'IR'
        ? gimbalInfo.ir ?? gimbalInfo.wide
        : gimbalInfo.wide

    const newResult: ProcessedResultType = {
      lon: data.meta?.gpsLongitude ?? 0,
      lat: data.meta?.gpsLatitude ?? 0,
      alt: data.meta?.absoluteAltitude ?? 0,
      yaw: data.meta?.gimbalYaw ?? 0,
      pitch: data.meta?.gimbalPitch ?? 0,
      roll: data.meta?.gimbalRoll ?? 0,
      focal: lenInfo.focal,
      width: lenInfo.width,
      aspectRatio: lenInfo.width / lenInfo.height,
      zoomFactor: 1,
      imgUrl: data.imageUrl,
      imgType: data.imageType,
    }

    if (data.imageType === 'jpeg') {
      useReconstruction2DMapStore
        .getState()
        .updateProcessedResults([...processedResults, newResult])
    } else if (data.imageType === 'tiff') {
      // tiff 说明前面的 jepg 都已经处理合成过了
      useReconstruction2DMapStore.getState().updateProcessedResults([newResult])
      if (data.taskDone) {
        queryClient.invalidateQueries({
          queryKey: ['reconstruction2dList'],
        })
      }
    }
  }

  useEffect(() => {
    processEventImageDataEmitter.on('processEventImageData', fn)

    return () => {
      processEventImageDataEmitter.off('processEventImageData', fn)
      // 清空处理结果
      useReconstruction2DMapStore.getState().updateProcessedResults([])
    }
  }, [])
}

export default useReconstruction2DMapStore
