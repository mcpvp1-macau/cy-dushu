import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import RadarChart from '@/components/RadarChart'
import { useRealOnlineStatus } from '@/store/useGlobalWebSocket.store'
import { StatusColorMap } from '@/enum/device'
import useConfig from '@/pages/control-room/wanglou/components/StatusInfo/useConfig'
import IconSetting from '@/assets/icons/jsx/IconSetting'
import IconButton from '@/components/ui/button/IconButton'
import RadarFormModal from './RadarFormModal'
import Radar from '@/components/RadarChart/Radar'
import { useOthersControlRoomStore } from '@/store/context-store/useOthersControlRoom.store'
import axios from 'axios'

type PropsType = {
  deviceId: string
}

const RadarMap: React.FC<PropsType> = ({ deviceId }) => {
  const detail = useDeviceDetailStore((s) => s.deviceDetail)

  console.info('de=====', detail)
  const modelName =
    detail?.deviceTags?.find(
      (item: { tagName: string }) => item.tagName === 'MODEL_NUMBER',
    )?.tagValue || '-'
  const status = useRealOnlineStatus(deviceId)
  const [open, setOpen] = useState(false)
  const { StatusMap } = useConfig()
  // TODO: MOCK DATA
  // const radarScanRange = scanRangeJson
  //   const radarScanRange = parseMapString(detail?.properties?.scanRangeJson)

  // const r = radarScanRange['r'] || 1000
  // const positions = radarScanRange['data'] || []

  const scanRangeProfile = useOthersControlRoomStore(
    (s) => s.state?.scanRangeProfile,
  )
  const queryClient = useQueryClient()
  const { data, refetch } = useQuery(
    {
      queryKey: ['scanRangeProfile', scanRangeProfile],
      queryFn: async () => {
        const res = await axios(
          `/storage/${scanRangeProfile}?timestamp=${dayjs().valueOf()}`,
        )
        return res.data
      },
      enabled: !!scanRangeProfile,
    },
    queryClient,
  )



  return (
    <div className="w-full h-full flex gap-4">
      <div className="h-full">
        <RadarChart id="radar-detail" width={150} height={150} max={data?.r || 1000}>
          <Radar
            center={{
              lng: detail?.properties?.longitude || 120,
              lat: detail?.properties?.latitude || 30,
            }} // 中心点
            radarRangeData={data?.data?.[0] || []} // 雷达范围
            angle={90} // 雷达范围获取时不是从正北开始，这里写90
          />
        </RadarChart>
      </div>
      <div className="w-full h-full flex flex-col justify-around gap-2">
        <div>
          <div className="text-xs">设备型号</div>
          <div className="text-white text-sm">{modelName}</div>
        </div>
        <div>
          <div className="text-xs">在线状态</div>
          <div className="text-sm">
            <span style={{ color: StatusColorMap[status!] }}>
              {StatusMap[status!] || '-'}
            </span>
          </div>
        </div>
        <div>
          <div className="text-xs">范围</div>
          <div className="text-white text-sm">
            {data?.r || 1000}m{' '}
            <span>
              <IconButton
                onClick={() => {
                  setOpen(true)
                }}
              >
                <IconSetting />
              </IconButton>
            </span>
          </div>
        </div>
      </div>
      {detail?.deviceModel?.productKey && detail?.deviceId && (
        <RadarFormModal
          open={open}
          setOpen={setOpen}
          radarScanRange={data || {}}
          productKey={detail?.deviceModel?.productKey}
          deviceId={detail?.deviceId}
          longitude={detail?.properties?.longitude}
          latitude={detail?.properties?.latitude}
          altitude={detail?.properties?.altitude}
          refetch={refetch}
        />
      )}
    </div>
  )
}

export default RadarMap
