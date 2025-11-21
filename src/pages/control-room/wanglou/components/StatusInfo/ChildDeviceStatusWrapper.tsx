import IconButton from '@/components/ui/button/IconButton'
import Icon from '@/components/Icon'
import { Tooltip, Typography } from 'antd'
import useConfig from './useConfig'
import { WanglouDeviceProductMap } from './config'

type PropsType = {
  data: API_DEVICE.domain.Device
  state: Record<string, any>
}

const ChildDeviceStatusItem: React.FC<PropsType> = memo(({ data, state }) => {
  const getDeviceInfo = useMemoizedFn(() => {
    const device = data
    return {
      ...(device?.properties || {}),
      status: device?.status,
      ...(state || {}),
    }
  })

  const { wanglouDeviceInfo } = useConfig()
  const infoList = useMemo(
    () => wanglouDeviceInfo[WanglouDeviceProductMap[data.productKey]],
    [data.productKey],
  )
  const properties = useMemo(() => getDeviceInfo(), [state])
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap p-[10px] gap-0">
      {infoList?.map(
        ({ label, propertyName, formatter, warnConfig, getValue }) => {
          const value = getValue
            ? getValue(properties)
            : properties[propertyName]
          const text =
            (value && formatter ? formatter(value, properties) : value) ?? '-'
          const isShowCusWaring = warnConfig?.showCusWaring?.(
            properties[warnConfig?.warningName || ''],
          )
          const showWarning = isShowCusWaring || warnConfig?.enable?.(value)

          return (
            <div className="w-1/2 flex pl-[12px]" key={propertyName + label}>
              <Tooltip title={label} placement="topLeft">
                <div className="text-[12px] w-[80px] text-left text-ellipsis overflow-hidden whitespace-nowrap">
                  {`${label}${'：'}`}
                </div>
              </Tooltip>
              <Tooltip title={text} placement="topLeft">
                <Typography.Text
                  style={{
                    flex: showWarning ? undefined : 1,
                    fontSize: 12,
                  }}
                  ellipsis
                  className="text-white text-sm"
                >
                  {text}
                </Typography.Text>
              </Tooltip>
              {showWarning && (
                <IconButton
                  style={{ marginLeft: 8 }}
                  toolTipProps={{
                    title:
                      warnConfig?.tooltip ||
                      properties[warnConfig?.warningName || ''] ||
                      t('device.status.def'),
                  }}
                >
                  <Icon id="icon-tishi" className="text-[#F29D49]" />
                </IconButton>
              )}
            </div>
          )
        },
      )}
    </div>
  )
})

export default ChildDeviceStatusItem
