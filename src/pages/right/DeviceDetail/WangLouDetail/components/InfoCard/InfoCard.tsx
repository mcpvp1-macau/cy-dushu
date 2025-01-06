import { Tabs } from 'antd'
import CarInfoCard from './WangLouInfoCard'
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
  const items = [
    {
      label: deviceName,
      key: deviceId,
      children: <CarInfoCard data={data} />,
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
    <div className="w-[350px] p-[10px]">
      <Tabs
        defaultActiveKey="1"
        tabPosition={'top'}
        items={items}
        popupClassName={styles.tabs}
        tabBarExtraContent={{
          right: (
            <>
              <IconSetting
                className="hover:text-[#447dcf] cursor-pointer"
                onClick={onClick}
              />
            </>
          ),
        }}
      />
      <InitParams open={open} setOpen={setOpen} data={data} />
    </div>
  )
})

InfoCard.displayName = 'InfoCard'

export default InfoCard
