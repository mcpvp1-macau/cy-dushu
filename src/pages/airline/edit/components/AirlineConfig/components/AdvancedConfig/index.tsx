import { memo, type FC } from 'react'
import { Form, Select } from 'antd'
import { pick } from 'lodash'
import { moreFormItems } from './constant'
import { CaretDownOutlined } from '@ant-design/icons'
import XCard from '@/components/ui/XCard'
import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'

type PropsType = unknown

/** 航线高级设置 */
const AdvancedConfig: FC<PropsType> = () => {
  const setAirlineConfig = useAirlineConfigStore((s) => s.updateAirlineConfig)
  const airlineConfig = useAirlineConfigStore((s) =>
    pick(
      s.airlineConfig,
      moreFormItems.map((e) => e.key),
    ),
  )

  return (
    <XCard title="高级设置" collapsible>
      <div style={{ marginTop: '8px', marginBottom: '-12px' }}>
        <Form
          layout="vertical"
          initialValues={pick(
            airlineConfig,
            moreFormItems.map((e) => e.key),
          )}
          onValuesChange={(vs) => {
            setAirlineConfig({
              ...useAirlineConfigStore.getState().airlineConfig,
              ...vs,
            })
          }}
        >
          {moreFormItems.map((item) => (
            <Form.Item key={item.key} label={item.label} name={item.key}>
              <Select
                options={item.options}
                suffixIcon={<CaretDownOutlined />}
              />
            </Form.Item>
          ))}
        </Form>
      </div>
    </XCard>
  )
}

/** 航线高级设置 */
const memorizedCpn = memo(AdvancedConfig)
memorizedCpn.displayName = 'AdvancedConfig'

export default memorizedCpn
