import XCard from '@/components/ui/XCard'
import HNumber from '../../edit/components/HNumber'
import useAreaWaylineStore from '@/store/wayline/uav-area-wayline/useAreaWayline.store'
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
          gsd = round(gsd, 2)
          const state = useAreaWaylineStore.getState()
          state.updateTemplateConfig({
            ...state.templateConfig,
            wideGSD: gsd,
          })
          const c = state.cameraInfo
          const height =
            ((wideGSD / 100) * (c.focal * c.pixelWidth)) / c.sensorWidth
          state.updateAirlineConfig({
            ...state.airlineConfig,
            height: round(height, 1),
          })
        }}
      />
    </XCard>
  )
})

GSDConfig.displayName = 'GSDConfig'

export default GSDConfig
