import { Tabs } from 'antd'
import DeviceInfoCard from './DeviceInfoCard'
import styles from './index.module.less'
import IconSetting from '@/assets/icons/jsx/IconSetting'
import InitParams from './InitParams'

type PropsType = {
  /** 详情数据 */
  data: API_DEVICE.domain.Device
} & Partial<{}>

const InfoCard: FC<PropsType> = memo(({ data }) => {
  const { deviceName, deviceId, childDevice } = data

  const [open, setOpen] = useState(false)

  const onClick = () => {
    setOpen(true)
  }

  const isHaveRadar = childDevice?.find((item) => item.deviceType === 'RADAR')
  const ishaveChild = !!childDevice?.length
  const items = [
    {
      label: deviceName,
      key: deviceId,
      children: <DeviceInfoCard data={data} deviceId={deviceId} />,
    },
    ...(childDevice?.map((item) => {
      return {
        label: item.deviceName || item.name,
        key: item.deviceId,
        children: <DeviceInfoCard data={item} deviceId={item.deviceId} />,
      }
    }) || []),
  ]
  return (
    <div className="w-[350px] p-3">
      {ishaveChild ? (
        <Tabs
          defaultActiveKey="1"
          tabPosition={'top'}
          items={items}
          popupClassName={styles.tabs}
          tabBarExtraContent={{
            right: (
              <>
                {isHaveRadar ? (
                  <IconSetting
                    className="hover:text-[#447dcf] cursor-pointer"
                    onClick={onClick}
                  />
                ) : null}
              </>
            ),
          }}
        />
      ) : (
        <DeviceInfoCard data={data} deviceId={deviceId} />
      )}
      {/** // TODO 暂时是子设备有雷达才需要 */}
      {isHaveRadar ? (
        <InitParams open={open} setOpen={setOpen} data={data} />
      ) : null}
    </div>
  )
})

InfoCard.displayName = 'InfoCard'

export default InfoCard
