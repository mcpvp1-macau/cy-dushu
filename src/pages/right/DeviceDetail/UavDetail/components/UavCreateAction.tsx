import IconSetting from '@/assets/icons/jsx/IconSetting'
import IconButton from '@/components/ui/button/IconButton'
import { LoadingOutlined } from '@ant-design/icons'
import { memo, type FC } from 'react'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import { getCameraByType } from '@/service/modules/airline'

type PropsType = unknown

const UavCreateAction: FC<PropsType> = memo(() => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)
  const [loading, setLoading] = useState(false)
  const { actionId } = useParams()
  const navigate = useNavigate()

  const createAction = async () => {
    if (!deviceDetail) {
      return
    }
    try {
      setLoading(true)
      let { longitude, latitude } =
        useGlobalWsStore.getState().deviceRealtimeProperties[
          deviceDetail!.deviceId
        ].properties
      longitude ??= deviceDetail.properties.longitude
      latitude ??= deviceDetail.properties.latitude

      const { data } = await getCameraByType(
        deviceDetail.properties.gimbalType || 'H20T',
      )
      const camera = data
      let params = `?actionId=${actionId}`
      params += `&deviceId=${deviceDetail.deviceId}`
      params += `&name=${encodeURIComponent(deviceDetail.deviceName)}航线任务`
      if (longitude || latitude) {
        params += `&takeoffRef=${encodeURIComponent(
          JSON.stringify([longitude, latitude, 0]),
        )}`
      }
      if (camera) {
        params += `&camera=${encodeURIComponent(JSON.stringify(camera))}`
      }
      navigate(`/airline/edit` + params)
    } finally {
      setLoading(false)
    }
  }

  return (
    <IconButton
      className="text-sm"
      toolTipProps={{ title: '行动配置' }}
      onClick={createAction}
    >
      {loading ? <LoadingOutlined /> : <IconSetting />}
    </IconButton>
  )
})

UavCreateAction.displayName = 'UavCreateAction'

export default UavCreateAction
