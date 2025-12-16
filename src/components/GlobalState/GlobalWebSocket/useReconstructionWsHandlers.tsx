import { useMemoizedFn } from 'ahooks'
import useReconstructionMapStore, {
  reconstructionMitt,
} from '@/store/map/useReconstructionMap.store'
import { useAppNotification } from '@/hooks/useNotification'
import { processEventImageDataEmitter } from '@/store/map/useReconstruction2DMap.store'
import { useTranslation } from 'react-i18next'

interface ImageData {
  id: number
  requestId: string
  actionId: number
  deviceId: string
  index: number
  imageUrl: string
  taskDone: boolean
  imageType: 'jpeg' | 'tiff'
  meta?: {
    absoluteAltitude: number
    gimbalPitch: number
    gimbalRoll: number
    gimbalYaw: number
    gpsLatitude: number
    gpsLongitude: number
    lenType: 'WIDE' | 'IR' | 'ZOOM'
    productName: string
    relativeAltitude: number
  }
}

export const useReconstructionWsHandlers = () => {
  const notificationApi = useAppNotification()
  const [t] = useTranslation()
  const requestAndUpdateLayerList = useReconstructionMapStore(
    (s) => s.requestAndUpdateLayerList,
  )

  const handleReconstructionTaskEnd = useMemoizedFn((message: unknown) => {
    requestAndUpdateLayerList()
    const overlayIdRaw =
      typeof message === 'object' && message
        ? (message as { overlayId?: string | number | null })?.overlayId ?? undefined
        : undefined
    const overlayId =
      typeof overlayIdRaw === 'number'
        ? overlayIdRaw
        : typeof overlayIdRaw === 'string'
          ? Number(overlayIdRaw)
          : undefined
    if (typeof overlayId === 'number' && !Number.isNaN(overlayId)) {
      reconstructionMitt.emit('reconstructionTaskEnd', overlayId)
    }
    notificationApi.success({
      message: t('mapLayer.reconstructionMap.create.success'),
      duration: 0,
      style: {
        backgroundColor: '#15B371',
        padding: '8px 0',
        width: '280px',
        borderRadius: '4px',
      },
      icon: <></>,
    })
  })

  const handle2DResult = useMemoizedFn((message: ImageData) => {
    processEventImageDataEmitter.emit('processEventImageData', message)
  })

  return {
    handle2DResult,
    handleReconstructionTaskEnd,
  }
}
