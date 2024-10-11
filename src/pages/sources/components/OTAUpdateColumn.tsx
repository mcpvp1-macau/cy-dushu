import { UpdateStatusEnum, UpdateStatusMap } from '@/enum/device'
import { updateOtaDevice } from '@/service/modules/device'
import { LoadingOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { memo, type FC } from 'react'

type PropsType = {
  data: API_DEVICE.domain.DeviceListItem
}

const OTAUpdateColumn: FC<PropsType> = memo(({ data }) => {
  const { deviceId } = data
  const { otaInfo } = data

  const [statusState, setStatusState] = useState(otaInfo?.status)

  const currentStatus = statusState || otaInfo?.status

  const handleUpdateDevice = async () => {
    await updateOtaDevice({ deviceId })
  }

  if (!currentStatus) {
    return '-'
  }

  if (currentStatus === UpdateStatusEnum.NO_UPGRADE) {
    return <div>{UpdateStatusMap[currentStatus]}</div>
  }

  if (currentStatus === UpdateStatusEnum.WAITING_UPGRADE) {
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

  return (
    <div className="flex gap-2 text-[#006ff9]">
      <div>{UpdateStatusMap[currentStatus]}</div>
      <LoadingOutlined />
    </div>
  )

  return '-'
})

OTAUpdateColumn.displayName = 'OTAUpdateColumn'

export default OTAUpdateColumn
