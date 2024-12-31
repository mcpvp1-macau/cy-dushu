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

  const { t } = useTranslation()

  return (
    <XCard title={t('common.advancedSetting')} collapsible>
      <div
        className="w-full overflow-hidden"
        style={{ marginTop: '8px', marginBottom: '-12px' }}
      >
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
            <Form.Item
              key={item.key}
              label={t(`wayline.advancedSetting.${item.key}.title`)}
              name={item.key}
            >
              <Select
                className="max-w-[300px]"
                options={item.options.map((e) => ({
                  value: e.value,
                  label: t(
                    `wayline.advancedSetting.${item.key}.${e.value}.title`,
                  ),
                }))}
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
