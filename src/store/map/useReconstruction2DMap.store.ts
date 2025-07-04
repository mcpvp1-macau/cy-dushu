import { getGimbalInfo } from '@/constant/uav/gimbalV2'
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
}

type StateType = {
  reconstruction2DList: API_RECONSTRUCTION.Reconstruction2DListItem[]
  /** 过程中的照片结果 (边飞边建) */
  processedResults: ProcessedResultType[]
}

type ActionsType = {
  updateReconstruction2DList: (
    data: API_RECONSTRUCTION.Reconstruction2DListItem[],
  ) => void
  /** 更新过程中的照片结果 */
  updateProcessedResults: (results: ProcessedResultType[]) => void
}

// const g = getGimbalInfo('M4TD')

// const MOCK: ProcessedResultType[] = [
//   {
//     lon: 119.957709,
//     lat: 30.270891,
//     alt: 204,
//     yaw: -137.2,
//     pitch: -90,
//     roll: 0,
//     focal: g.wide.focal,
//     width: g.wide.width,
//     aspectRatio: g.wide.width / g.wide.height,
//     zoomFactor: 1,
//     imgUrl:
//       '/storage//ja-media-storage/cloud-sample/1892f8e7-fa36-4630-a919-570f445eb51c/Remote-Control/DJI_20250703144430_0001_V.jpeg',
//   },
//   {
//     lon: 119.956031,
//     lat: 30.270701,
//     alt: 204,
//     yaw: -123.7,
//     pitch: -90,
//     roll: 0,
//     focal: g.wide.focal,
//     width: g.wide.width,
//     aspectRatio: g.wide.width / g.wide.height,
//     zoomFactor: 1,
//     imgUrl:
//       '/storage//ja-media-storage/cloud-sample/9c104f9b-a60b-4dd9-80c9-e4991083b998/Remote-Control/DJI_20250703163501_0001_V.jpeg',
//   },
//   {
//     lon: 119.959669,
//     lat: 30.271087,
//     alt: 203.9,
//     yaw: 83.1,
//     pitch: -90,
//     roll: 0,
//     focal: g.wide.focal,
//     width: g.wide.width,
//     aspectRatio: g.wide.width / g.wide.height,
//     zoomFactor: 1,
//     imgUrl:
//       '/storage//ja-media-storage/cloud-sample/9c104f9b-a60b-4dd9-80c9-e4991083b998/Remote-Control/DJI_20250703163625_0003_V.jpeg',
//   },
//   {
//     lon: 119.957634,
//     lat: 30.272419,
//     alt: 204,
//     yaw: -52.5,
//     pitch: -90,
//     roll: 0,
//     focal: g.wide.focal,
//     width: g.wide.width,
//     aspectRatio: g.wide.width / g.wide.height,
//     zoomFactor: 1,
//     imgUrl:
//       '/storage//ja-media-storage/cloud-sample/9c104f9b-a60b-4dd9-80c9-e4991083b998/Remote-Control/DJI_20250703163718_0004_V.jpeg',
//   },
// ]

const useReconstruction2DMapStore = create<StateType & ActionsType>()(
  (set) => ({
    processedResults: [],
    reconstruction2DList: [],
    updateReconstruction2DList: (data) => set({ reconstruction2DList: data }),
    updateProcessedResults: (results) =>
      set({
        processedResults: results,
      }),
  }),
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
    }

    useReconstruction2DMapStore
      .getState()
      .updateProcessedResults([...processedResults, newResult])
  }

  useEffect(() => {
    processEventImageDataEmitter.on('processEventImageData', fn)

    return () => {
      processEventImageDataEmitter.off('processEventImageData', fn)
    }
  }, [])
}

export default useReconstruction2DMapStore
