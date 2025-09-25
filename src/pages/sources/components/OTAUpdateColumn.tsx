import {
  DJIOtaStatusEnum,
  UpdateStatusEnum,
  UpdateStatusMap,
} from '@/enum/device'
import { updateOtaDevice, updateOtaDeviceDJI } from '@/service/modules/device'
import { LoadingOutlined } from '@ant-design/icons'
import { Button } from 'antd'

type PropsType = {
  data: API_DEVICE.domain.DeviceOTAItem
  type: 'DJI' | 'BOX'
  onRefresh: () => void
}

const OTAUpdateRender: React.FC<{
  otaInfo: {
    status: string | undefined
    newVersionName: string | undefined
  }
  onUpdateDevice: () => Promise<void>
}> = ({ otaInfo, onUpdateDevice }) => {
  const [statusState, setStatusState] = useState(otaInfo?.status)

  const currentStatus = statusState || otaInfo?.status

  const handleUpdateDevice = async () => {
    // await updateOtaDevice({ deviceId })
    await onUpdateDevice()
  }

  if (!currentStatus) {
    return '-'
  }

  if (currentStatus === UpdateStatusEnum.NO_UPGRADE) {
    return <div>{UpdateStatusMap[currentStatus]}</div>
  }

  if (
    currentStatus === UpdateStatusEnum.WAITING_UPGRADE ||
    currentStatus === DJIOtaStatusEnum.UPGRADE
  ) {
    return (
      <div className="flex gap-2">
        <div>新版本:{otaInfo?.newVersionName} </div>
        <Button size="small" onClick={handleUpdateDevice}>
          更新
        </Button>
      </div>
    )
  }

  if (currentStatus === UpdateStatusEnum.FAILED) {
    return (
      <div className="flex gap-2">
        <div className="text-[#fe4348]">{UpdateStatusMap[currentStatus]}</div>
        <Button size="small" onClick={handleUpdateDevice}>
          重试
        </Button>
      </div>
    )
  }

  if (currentStatus === UpdateStatusEnum.SUCCESS) {
    return (
      <div className="text-[#4fbb30]">{UpdateStatusMap[currentStatus]}</div>
    )
  }

  if (currentStatus === DJIOtaStatusEnum.UPGRADE_ING) {
    return (
      <div className="text-[#006ff9] flex items-center gap-2">
        <div>升级中</div>
        <LoadingOutlined />
      </div>
    )
  }

  return (
    <div className="flex gap-2 text-[#006ff9]">
      <div>{UpdateStatusMap[currentStatus]}</div>
      <LoadingOutlined />
    </div>
  )

  return '-'
}

const OTAUpdateColumn: FC<PropsType> = memo(({ data, type, onRefresh }) => {
  const { deviceId } = data
  const { otaInfo, djiOtaInfo } = data

  const info = {
    status: djiOtaInfo?.djiOtaStatus,
    newVersionName: djiOtaInfo?.latestFirmwareVersion,
  }

  const ota = {
    status: otaInfo?.status,
    newVersionName: otaInfo?.newVersionName,
  }

  // const queryClient = useQueryClient()

  const onUpdateDevice = async () => {
    if (type === 'DJI') {
      // await updateOtaDevice({ deviceId })
      await updateOtaDeviceDJI({
        deviceSn: djiOtaInfo.deviceSn,
        deviceName: djiOtaInfo.deviceName,
        latestFirmwareVersion: djiOtaInfo?.latestFirmwareVersion,
      })
    } else {
      await updateOtaDevice({ deviceId })
    }
    // queryClient.invalidateQueries({ queryKey: ['getAllDeviceList'] })
    onRefresh()
  }

  return (
    <OTAUpdateRender
      otaInfo={type === 'DJI' ? info : ota}
      onUpdateDevice={onUpdateDevice}
    />
  )
})

OTAUpdateColumn.displayName = 'OTAUpdateColumn'

export default OTAUpdateColumn
