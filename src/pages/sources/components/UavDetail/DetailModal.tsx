import { FC, memo } from 'react'
import XModal from '@/components/XModal'
import { getUavDocDetail } from '@/service/modules/device'
import { useQuery } from '@tanstack/react-query'
import { Tooltip } from 'antd'

type PropsType = {
  sn: string
  open: boolean
  onClose: () => void
}

const DetailModal: FC<PropsType> = memo(({ sn, open, onClose }) => {
  const { data } = useQuery({
    queryKey: ['uavDocDetail', sn],
    queryFn: async () => {
      const res = await getUavDocDetail(sn)
      return res.data
    },
  })

  const fields = [
    {
      label: '设备名称',
      value: data?.deviceName,
    },
    {
      label: '设备编号',
      value: data?.rcSn,
    },
    {
      label: '设备SN',
      value: data?.sn,
    },
    {
      label: '设备型号',
      value: data?.deviceType,
    },
    {
      label: '固件版本号',
      value: data?.firmwareVersion,
    },
    {
      label: '设备厂商',
      value: data?.manufacturer,
    },
    {
      label: '点位俗称',
      value: data?.placeName,
    },
    {
      label: '行政区划',
      value: data?.administrativeDivision,
    },
    {
      label: '监控点类型',
      value: data?.monitorPointType,
    },
    {
      label: 'IP地址',
      value: data?.ip,
    },
    {
      label: '摄像机类型',
      value: data?.cameraType,
    },
    {
      label: '摄像机编码格式',
      value: data?.cameraCodeFormat,
    },

    {
      label: '安装地址',
      value: data?.address,
    },
    {
      label: '设备状态',
      value: data?.status,
    },
    {
      label: '对应存储设备通道',
      value: data?.deviceChannel,
    },
    {
      label: '经度',
      value: data?.longitude ? Number(data?.longitude)?.toFixed(6) : '-',
    },
    {
      label: '纬度',
      value: data?.latitude ? Number(data?.latitude)?.toFixed(6) : '-',
    },
  ]
  return (
    <XModal
      width={830}
      title={'详情'}
      open={open}
      footer={false}
      onClose={onClose}
      mask={true}
      maskClosable={true}
    >
      <div className="flex flex-wrap gap-2 pb-2">
        {fields.map((item) => (
          <div key={item.label} className="flex min-w-[240px]">
            <div>{item.label}：</div>
            <div className="max-w-[200px] text-ellipsis overflow-hidden whitespace-nowrap">
              <Tooltip title={item.value}>{item.value || '-'}</Tooltip>
            </div>
          </div>
        ))}
      </div>
    </XModal>
  )
})

DetailModal.displayName = 'DetailModal'

export default DetailModal
