import XCard from '@/components/ui/XCard'
import HNumber from '../../edit/components/HNumber'
import useAreaWaylineStore from '@/store/wayline/uav-area-wayline/useAreaWayline.store'
import { calcFovRadiation } from '@/utils/fov'
import { round } from 'lodash'
import { Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'

type PropsType = unknown

const GSDConfig: FC<PropsType> = memo(() => {
  const wideGSD = useAreaWaylineStore((s) => s.templateConfig.wideGSD)

  return (
    <XCard
      title={
        <div>
          GSD{' '}
          <Tooltip
            placement="right"
            title="GSD（Ground Sample Distance）指的是地面采样距离。在无人机测绘中，GSD是指像素大小，即每个像素代表的实际距离。GSD越小，图像分辨率越高，但数据量也会增加。调整GSD将影响航线高度等参数。"
          >
            <InfoCircleOutlined />
          </Tooltip>
        </div>
      }
    >
      <HNumber
        className="mt-3"
        value={wideGSD}
        unit="cm/px"
        negatives={[-1, -0.1]}
        positives={[0.1, 1]}
        onChange={(gsd) => {
          gsd = round(gsd, 1)
          const state = useAreaWaylineStore.getState()
          state.updateTemplateConfig({
            ...state.templateConfig,
            wideGSD: gsd,
          })
          const hFov = calcFovRadiation(4.5, 6.4, 1)
          const height = round(
            ((gsd / 100) * 4000) / (2 * Math.tan(hFov / 2)),
            1,
          )
          state.updateAirlineConfig({
            ...state.airlineConfig,
            height,
          })
        }}
      />
    </XCard>
  )
})

GSDConfig.displayName = 'GSDConfig'

export default GSDConfig
