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
import { FLY_TO_DURATION_SECONDS, getRectangleFromPositions } from '@/utils/mapUtils'
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

  const overlayRectangle = useMemo(
    () => getRectangleFromPositions(data.overlayPositions, data.overlayType),
    [data.overlayPositions, data.overlayType],
  )

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
                    duration: FLY_TO_DURATION_SECONDS,
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
