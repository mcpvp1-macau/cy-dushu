import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconNotVisible from '@/assets/icons/jsx/IconNotVisible'
import IconVisible from '@/assets/icons/jsx/IconVisible'
import IconAddMark from '@/assets/icons/jsx/right-tools/IconAddMark'
import IconDrawArea from '@/assets/icons/jsx/right-tools/IconDrawArea'
import IconToLocation from '@/assets/icons/jsx/IconToLocation'
import IconButton from '@/components/ui/button/IconButton'
import { RightModeEnum } from '@/enum/right-mode'
import { useAppMsg } from '@/hooks/useAppMsg'
import { bigFlyEmitter } from '@/map/GlobalMap/BigFlyListener'
import { deleteOverlaies } from '@/service/modules/layer_overlay'
import useRightMode from '@/store/layout/useRightMode.store'
import { CotType } from '@/store/map/useDraw.store'
import { useMapLayerAndOverlayConfigStore } from '@/store/map/useLayerAndOverlay.store'
import { shouldJson } from '@/utils/json'
import * as Cesium from 'cesium'
import { LoadingOutlined } from '@ant-design/icons'

type PropsType = {
  data: API_LAYER_OVERLAY.domain.Overlay
}

const MapOverlayConfig: FC<PropsType> = memo(({ data }) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const msgApi = useAppMsg()
  const queryClient = useQueryClient()

  const rightMode = useRightMode((s) => s.rightMode)
  const rightDetailId = useRightMode((s) => s.detailId)

  const handleDelte = async () => {
    setLoading(true)
    try {
      await deleteOverlaies([data.overlayId])
      msgApi.success(t('message.success.delete'))
      if (
        rightMode === RightModeEnum.OVERLYA_DETAIL &&
        rightDetailId == String(data.overlayId)
      ) {
        useRightMode.setState({ rightMode: null })
      }
      await queryClient.invalidateQueries({
        queryKey: ['overlayList'],
        exact: false,
      })
    } finally {
      setLoading(false)
    }
  }

  const hiddenOverlayIds = useMapLayerAndOverlayConfigStore(
    (s) => s.hiddenOverlayIds,
  )
  const updateHiddenOverlayIds = useMapLayerAndOverlayConfigStore(
    (s) => s.updateHiddenOverlayIds,
  )

  const overlayRectangle = useMemo(() => {
    const positions = shouldJson<any>(data.overlayPositions)
    if (!positions) {
      return undefined
    }

    const coords: [number, number][] = []
    const collectCoords = (value: any) => {
      if (Array.isArray(value)) {
        if (
          value.length >= 2 &&
          Number.isFinite(Number(value[0])) &&
          Number.isFinite(Number(value[1]))
        ) {
          coords.push([Number(value[0]), Number(value[1])])
        }
        value.forEach(collectCoords)
        return
      }

      if (value && typeof value === 'object') {
        const lng = (value as any).lng ?? (value as any).lon ?? value.longitude
        const lat = (value as any).lat ?? value.latitude

        if (Number.isFinite(Number(lng)) && Number.isFinite(Number(lat))) {
          coords.push([Number(lng), Number(lat)])
        }

        Object.values(value).forEach(collectCoords)
      }
    }

    collectCoords(positions)

    if (!coords.length) {
      return undefined
    }

    const lngs = coords.map(([lng]) => lng)
    const lats = coords.map(([, lat]) => lat)

    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)

    const padding = 0.001

    return Cesium.Rectangle.fromDegrees(
      minLng - padding,
      minLat - padding,
      maxLng + padding,
      maxLat + padding,
    )
  }, [data.overlayPositions])

  return (
    <li key={data.overlayId} className="flex justify-between">
      <div className="flex gap-2">
        {data.cotType === CotType.POINT ? (
          <IconAddMark className="text-primary" />
        ) : (
          <IconDrawArea className="text-primary" />
        )}
        <p className="max-w-[210px] truncate">{data.overlayName}</p>
      </div>
      <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
        {loading ? (
          <LoadingOutlined />
        ) : (
          <>
            <IconButton
              onClick={() => {
                if (hiddenOverlayIds.has(data.overlayId)) {
                  hiddenOverlayIds.delete(data.overlayId)
                } else {
                  hiddenOverlayIds.add(data.overlayId)
                }
                updateHiddenOverlayIds(new Set(hiddenOverlayIds))
              }}
            >
              {hiddenOverlayIds.has(data.overlayId) ? (
                <IconNotVisible />
              ) : (
                <IconVisible />
              )}
            </IconButton>
            {overlayRectangle && (
              <IconButton
                onClick={() =>
                  bigFlyEmitter.emit('flyTo', {
                    destination: overlayRectangle,
                    duration: 1,
                  })
                }
              >
                <IconToLocation />
              </IconButton>
            )}
            {/* <IconButton className="scale-90" onClick={() => setOpen(true)}>
              <IconShare />
            </IconButton> */}
            <IconButton className="scale-90" onClick={handleDelte}>
              <IconDelete />
            </IconButton>
          </>
        )}
      </div>
    </li>
  )
})

MapOverlayConfig.displayName = 'MapOverlayConfig'

export default MapOverlayConfig
