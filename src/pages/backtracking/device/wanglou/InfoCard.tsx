import { Tabs } from 'antd'
import styles from './InfoCard.module.less'
import InfoCardItem from './InfoCardItem'
import { shouldJson } from '@/utils/json'

type PropsType = {
  data: API_DEVICE.domain.Device
  curAttr: Record<string, any>
}

const InfoCard: React.FC<PropsType> = memo(({ data, curAttr }) => {
  const { childDevice } = data

  const properties = curAttr ? shouldJson(curAttr?.properties) : {}
  const items = [
    {
      label: data.deviceName,
      key: data.deviceId,
      children: (
        <InfoCardItem
          deviceId={data.deviceId}
          data={properties?.[data.deviceId]}
          device={data}
        />
      ),
    },
    ...(childDevice?.map((item) => {
      return {
        label: item.deviceName || item.name,
        key: item.deviceId,
        children: (
          <InfoCardItem
            deviceId={item.deviceId}
            data={properties?.[item.deviceId]}
            device={item}
            key={item.deviceId}
          />
        ),
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
      />
    </div>
  )
})

export default InfoCard
