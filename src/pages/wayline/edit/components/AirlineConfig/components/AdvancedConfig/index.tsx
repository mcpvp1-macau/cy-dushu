import { Select } from 'antd'
import { pick } from 'lodash'
import { moreFormItems } from './constant'
import { CaretDownOutlined } from '@ant-design/icons'
import XCard from '@/components/ui/XCard'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'

type PropsType = unknown

/** 航线高级设置 */
const AdvancedConfig: FC<PropsType> = () => {
  const setAirlineConfig = useAirlineConfigStore((s) => s.updateAirlineConfig)
  const advancedConfig = useAirlineConfigStore((s) =>
    pick(
      s.airlineConfig,
      moreFormItems.map((e) => e.key),
    ),
  )

  const { t } = useTranslation()

  const displayFormItems = useMemo(() => {
    if (globalConfig.env === 'xiaoshan') {
      return moreFormItems.map((item) =>
        item.key === 'finishAction'
          ? { ...item, options: item.options.filter((option) => option.value === 'GO_HOME') }
          : item,
      )
    }

    return moreFormItems
  }, [])

  return (
    <XCard
      className="w-full overflow-hidden"
      title={t('common.advancedSetting')}
      collapsible
    >
      <div
        className="overflow-hidden"
        style={{ marginTop: '8px', marginBottom: '-12px' }}
      >
        {displayFormItems.map((item) => (
          <div className="mb-3" key={item.key}>
            <p className="text-sm mb-2">
              {t(`wayline.advancedSetting.${item.key}.title`)}
            </p>
            <Select
              className="w-[300px]"
              options={item.options.map((e) => ({
                value: e.value,
                label: t(
                  `wayline.advancedSetting.${item.key}.${e.value}.title`,
                ),
              }))}
              suffixIcon={<CaretDownOutlined />}
              value={advancedConfig[item.key]}
              onChange={(value) => {
                setAirlineConfig({
                  ...useAirlineConfigStore.getState().airlineConfig,
                  [item.key]: value,
                })
              }}
            />
          </div>
        ))}
      </div>
    </XCard>
  )
}

/** 航线高级设置 */
const memorizedCpn = memo(AdvancedConfig)
memorizedCpn.displayName = 'AdvancedConfig'

export default memorizedCpn
