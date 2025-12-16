import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconVisible from '@/assets/icons/jsx/IconVisible'
import IconNotVisible from '@/assets/icons/jsx/IconNotVisible'
import IconFlightArea from '@/assets/icons/jsx/IconFlightArea'
import IconToLocation from '@/assets/icons/jsx/IconToLocation'
import IconButton from '@/components/ui/button/IconButton'
import { useAppMsg } from '@/hooks/useAppMsg'
import { bigFlyEmitter } from '@/map/GlobalMap/BigFlyListener'
import { deleteFlightArea } from '@/service/modules/flightArea'
import { LoadingOutlined } from '@ant-design/icons'
import queryClient from '@/global/query-client'
import { useFlightAreaConfigStore } from '@/store/map/useFlightArea.store'
import { FLY_TO_DURATION_SECONDS, getRectangleFromPositions } from '@/utils/mapUtils'

import OverflowText from '@/components/ui/OverflowText'

type PropsType = {
  data: API_LAYER_OVERLAY.domain.Overlay
}

const FlightAreaItemConfig: FC<PropsType> = memo((props) => {
  const data = props.data

  const { t } = useTranslation()

  const flightAreaTypeMap = {
    ELECTRONIC_FENCE: t('flightArea.type.electronicFence.title'),
    NO_FLY_ZONE: t('flightArea.type.noFly.title'),
    AI_COUNT_ZONE: t('flightArea.type.countZone.title'),
    NO_COUNT_ZONE: t('flightArea.type.noCountZone.title'),
  }

  const msgApi = useAppMsg()
  const [loading, setLoading] = useState(false)

  const handleDelte = async (overlayId: number) => {
    setLoading(true)
    try {
      await deleteFlightArea([overlayId])
      msgApi.success(t('message.success.delete'))
      queryClient.invalidateQueries({
        queryKey: ['getFlightAreaList'],
      })
    } finally {
      setLoading(false)
    }
  }

  const hiddenOverlayIds = useFlightAreaConfigStore((s) => s.hiddenOverlayIds)
  const updateHiddenOverlayIds = useFlightAreaConfigStore(
    (s) => s.updateHiddenOverlayIds,
  )

  const overlayRectangle = useMemo(
    () => getRectangleFromPositions(data.overlayPositions, data.overlayType),
    [data.overlayPositions, data.overlayType],
  )

  return (
    <li>
      <div className="flex justify-between">
        <div className="flex gap-2 overflow-hidden">
          <IconFlightArea className="text-primary" />
          <OverflowText className="flex-1 truncate mr-3">
            {data.overlayName}
          </OverflowText>
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

              {data.layerId !== -1 && (
                <IconButton
                  className="scale-90"
                  onClick={() => handleDelte(data.overlayId)}
                >
                  <IconDelete />
                </IconButton>
              )}
            </>
          )}
        </div>
      </div>
      <div className="mt-1 ml-5 ">
        <div className="text-xs inline-flex items-center gap-1 h-[18px] p-1 px-2 rounded-md bg-gray-600">
          {flightAreaTypeMap[data.overlayExtType]}
        </div>
      </div>
    </li>
  )
})

FlightAreaItemConfig.displayName = 'FlightAreaItemConfig'

export default FlightAreaItemConfig
