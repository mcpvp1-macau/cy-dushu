import IconButton from '@/components/ui/button/IconButton'
import { LoadingOutlined } from '@ant-design/icons'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import { getCameraByType } from '@/service/modules/airline'
import IconAddAction from '@/assets/icons/jsx/IconAddAction'

type PropsType = unknown

const UavCreateAction: FC<PropsType> = memo(() => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)
  const [loading, setLoading] = useState(false)
  const { actionId } = useParams()
  const navigate = useNavigate()

  const { t } = useTranslation()

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
      params += `&name=${deviceDetail.deviceName} Wayline Task`
      if (longitude || latitude) {
        params += `&takeoffRef=${JSON.stringify([longitude, latitude, 0])}`
      }
      if (camera) {
        params += `&camera=${JSON.stringify(camera)}`
      }
      navigate(`/wayline/edit` + params)
    } finally {
      setLoading(false)
    }
  }

  return (
    <IconButton
      className="text-sm"
      tippyProps={{ content: t('action.add.title') }}
      onClick={createAction}
    >
      {loading ? <LoadingOutlined /> : <IconAddAction />}
    </IconButton>
  )
})

UavCreateAction.displayName = 'UavCreateAction'

export default UavCreateAction
