import { InputNumber, Select } from 'antd'
import styles from './index.module.less'
import KSLX from '../../icons/KSLX'
import TZLX from '../../icons/TZLX'
import KSDSJGPZ from '../../icons/KSDSJGPZ'
import HNumber from '../../../HNumber'
import KSDJJGPZ from '../../icons/KSDJJGPZ'
import JSJGPZ from '../../icons/JSJGPZ'
import HoverTime from './HoverTime'
import AircraftHeading from './AircraftHeading'
import CameraPositionX from './CameraPositionX'
import CameraPositionY from './CameraPositionY'
import GetPicture from './GetPicture'
import ZoomFocalLength from './ZoomFocalLength'
import { limitNum } from '@/utils/math'
import OpenAI from './AlgorithmAction/OpenAI'
import CloseAI from './AlgorithmAction/CloseAI'
import LenChange from './LenChange'
import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'
import { useCurrentAirpoint } from '@/store/uav/uav-airline/select'

interface Props {
  activeOperator: string
}

const ActionConfig: React.FC<Props> = (props) => {
  const { activeOperator } = props
  const currentIndex = useAirlineConfigStore((s) => s.currentIndex)
  const currentAirpoint = useCurrentAirpoint()
  const setAirpointsConfig = useAirlineConfigStore(
    (s) => s.updateAirpointsConfig,
  )
  const editCurrentAirPoint = useAirlineConfigStore(
    (s) => s.updateCurrentAirpoint,
  )

  const actions = currentAirpoint?.actions || []

  const action = actions.find((item) => item.xid === activeOperator)

  const onChange = (config: any) => {
    editCurrentAirPoint({
      ...currentAirpoint,
      actions: actions.map((item) => {
        if (item.xid === activeOperator) {
          return {
            ...item,
            config,
          }
        }
        return item
      }),
    })
  }

  const onChangePosition = (
    type: 'pointX' | 'pointY' | 'pointZ',
    value: number,
  ) => {
    const airPointsConfig = useAirlineConfigStore.getState().airpointsConfig
    setAirpointsConfig(
      airPointsConfig.map((item, index) => {
        if (currentIndex === index) {
          return {
            ...item,
            [type]: value,
          }
        }
        return item
      }),
    )
  }

  const getActionComponent = () => {
    if (action?.type === 'HOVER') {
      return (
        <HoverTime
          config={action?.config ?? { hoverTime: 0 }}
          onChange={onChange}
        />
      )
    }
    if (action?.type === 'ROTATE_YAW') {
      return (
        <AircraftHeading
          config={action?.config ?? { aircraftHeading: 0 }}
          onChange={onChange}
        />
      )
    }
    if (action?.type === 'CAMERA_POSITION' && action.config.x !== undefined) {
      return <CameraPositionX config={action.config} onChange={onChange} />
    }
    if (action?.type === 'CAMERA_POSITION' && action.config.y !== undefined) {
      return (
        <CameraPositionY
          config={action?.config ?? { y: 0 }}
          onChange={onChange}
        />
      )
    }
    if (action?.type === 'GET_PICTURE') {
      return (
        <GetPicture
          config={
            action?.config ?? {
              payloadLensIndex: [],
              useGlobalPayloadLensIndex: 1,
            }
          }
          onChange={onChange}
        />
      )
    }
    if (action?.type === 'LEN_CHANGE') {
      return (
        <LenChange
          config={
            action?.config ?? {
              actionTiming: 'ARRIVE',
              videoType: 'wide',
            }
          }
          onChange={onChange}
        />
      )
    }
    if (action?.type === 'ZOOM') {
      return (
        <ZoomFocalLength
          config={
            action?.config ?? {
              focalLength: 2,
            }
          }
          onChange={onChange}
        />
      )
    }
    if (action?.type === 'OPEN_AI') {
      return <OpenAI config={action.config ?? {}} onChange={onChange} />
    }
    if (action?.type === 'CLOSE_AI') {
      return <CloseAI config={action.config ?? {}} onChange={onChange} />
    }
    if (action?.type === 'UNKNOWN') {
      return <div className="text-center mt-2">暂不支持编辑该动作</div>
    }
  }

  return (
    <>
      {getActionComponent()}
      {
        {
          开始录像: (
            <div>
              <div className={styles.subTitle}>
                <KSLX />
                <span className={styles.text}>开始录像</span>
              </div>
              <Select style={{ width: '100%' }} options={[]} />
            </div>
          ),
          停止录像: (
            <div>
              <div className={styles.subTitle}>
                <TZLX />
                <span className={styles.text}>停止录像</span>
              </div>
              <Select style={{ width: '100%' }} options={[]} />
            </div>
          ),
          开始等时间隔拍照: (
            <div>
              <div className={styles.subTitle}>
                <KSDSJGPZ />
                <span className={styles.text}>开始等时间隔拍照</span>
              </div>
              <HNumber
                value={10}
                unit="s"
                negatives={[-10, -1]}
                positives={[1, 10]}
              />
            </div>
          ),
          开始等距间隔拍照: (
            <div>
              <div className={styles.subTitle}>
                <KSDJJGPZ />
                <span className={styles.text}>开始等距间隔拍照</span>
              </div>
              <HNumber
                value={10}
                unit="m"
                negatives={[-10, -1]}
                positives={[1, 10]}
              />
            </div>
          ),
          结束间隔拍照: (
            <div>
              <div className={styles.subTitle}>
                <JSJGPZ />
                <span className={styles.text}>结束间隔拍照</span>
              </div>
              <HNumber
                value={10}
                unit="m"
                negatives={[-10, -1]}
                positives={[1, 10]}
              />
            </div>
          ),
        }['sb' as string]
      }

      <div
        style={{
          borderTop: '1px solid #37414d',
          width: '100%',
          height: 1,
          marginTop: 12,
        }}
      ></div>
      <div>
        <div className={styles.titleHeader}>
          <div className={styles.subTitle}>
            <span className={styles.text}>高度（m）</span>
          </div>
          <div>
            <span className={styles.important}></span>
          </div>
        </div>
        <InputNumber
          value={Number(currentAirpoint?.pointZ.toFixed(2) ?? 0)}
          className="w-full"
          onChange={(value: number | null) =>
            value && onChangePosition('pointZ', limitNum(value, 1, 500))
          }
        />
      </div>
      <div>
        <div className={styles.titleHeader}>
          <div className={styles.subTitle}>
            <span className={styles.text}>经度</span>
          </div>
          <div>
            <span className={styles.important}></span>
          </div>
        </div>
        <InputNumber
          value={Number(currentAirpoint?.pointX.toFixed(6) ?? 0)}
          className="w-full"
          onChange={(value: number | null) =>
            value && onChangePosition('pointX', value)
          }
        />
      </div>
      <div>
        <div className={styles.titleHeader}>
          <div className={styles.subTitle}>
            <span className={styles.text}>纬度</span>
          </div>
          <div>
            <span className={styles.important}></span>
          </div>
        </div>
        <InputNumber
          value={Number(currentAirpoint?.pointY.toFixed(6) ?? 0)}
          className="w-full"
          onChange={(value: number | null) =>
            value && onChangePosition('pointY', value)
          }
        />
      </div>
    </>
  )
}

export default ActionConfig
