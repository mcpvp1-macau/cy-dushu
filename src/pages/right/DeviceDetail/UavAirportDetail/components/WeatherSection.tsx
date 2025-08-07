import IconTemperature1 from '@/assets/icons/jsx/weather/IconTemperature1'
import IconTemperature2 from '@/assets/icons/jsx/weather/IconTemperature2'
import IconWeather from '@/assets/icons/jsx/weather/IconWeather'
import IconWind from '@/assets/icons/jsx/weather/IconWind'
import { Tooltip } from 'antd'

type PropsType = {
  windSpeed?: number
  rainfall?: string
  temperature?: number
  environmentTemperature?: number
}

/** 天气 */
const UavAirportWeatherSection: FC<PropsType> = memo(
  ({ windSpeed, rainfall, temperature, environmentTemperature }) => {
    const { t } = useTranslation()

    return (
      <ul className="flex items-center justify-between text-sm">
        <li className="flex-1">
          <Tooltip title={t('device.uavDock.rainFall.title')}>
            <div className="flex gap-1">
              <IconWeather />
              <span className="ml-1">{rainfall || '-'}</span>
            </div>
          </Tooltip>
        </li>
        <li className="flex-1">
          <Tooltip title={t('device.uavDock.windSpeed.title')}>
            <div className="flex gap-1">
              <IconWind />
              <span className="ml-1">{windSpeed ?? '-'} m/s</span>
            </div>
          </Tooltip>
        </li>
        <li className="flex-1">
          <Tooltip title={t('device.uavDock.cabinTemperature.title')}>
            <div className="flex gap-1">
              <IconTemperature2 />
              <span className="ml-1 whitespace-nowrap">
                {temperature ?? '-'} °C
              </span>
            </div>
          </Tooltip>
        </li>
        <li className="flex-1">
          <Tooltip title={t('device.uavDock.externalTemperature.title')}>
            <div className="flex gap-1">
              <IconTemperature1 />
              <span className="ml-1">{environmentTemperature ?? '-'} °C</span>
            </div>
          </Tooltip>
        </li>
      </ul>
    )
  },
)

UavAirportWeatherSection.displayName = 'WeatherSection'

export default UavAirportWeatherSection
