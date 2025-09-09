import { InputNumber } from 'antd'
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
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import { useCurrentAirpoint } from '@/store/wayline/uav-airline/select'
import AppEmpty from '@/components/AppEmpty'
import CameraModeSet from './CameraModeSet'
import Loudspeaker from './Loudspeaker'
import StartRecord from './StartRecord'

interface Props {
  activeOperator: string
}

const ActionConfig: React.FC<Props> = (props) => {
  const { t } = useTranslation()
  const { activeOperator } = props
  const currentAirpoint = useCurrentAirpoint()
  const editCurrentAirPoint = useAirlineConfigStore(
    (s) => s.updateCurrentAirpoint,
  )
  const globalSpeed = useAirlineConfigStore((s) => s.airlineConfig.speed)

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
    type: 'pointX' | 'pointY' | 'pointZ' | 'speed',
    value: number,
  ) => {
    const updateCurrentAirpoint =
      useAirlineConfigStore.getState().updateCurrentAirpoint
    updateCurrentAirpoint({
      [type]: value,
    })
    useAirlineConfigStore.getState().calcUavByCurrentAirpoint()
  }

  const getActionComponent = () => {
    if (!action) {
      return <AppEmpty className="m-0 mt-3" />
    }
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
    if (action?.type === 'CAMERA_MODE_SET') {
      return (
        <CameraModeSet
          config={action.config ?? { cameraMode: '0' }}
          onChange={onChange}
        />
      )
    }
    if (action?.type === 'SPEAKER_PLAY') {
      return (
        <Loudspeaker
          config={
            action.config ?? {
              action: 'start',
              mode: 'single',
              volumn: 100,
              text: '',
            }
          }
          onChange={onChange}
        />
      )
    }
    if (action?.type === 'START_RECORD') {
      return (
        <StartRecord
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
    return (
      <AppEmpty
        className="m-0 mt-3"
        description={t('wayline.action.noSupportEdit')}
      />
    )
  }

  return (
    <>
      {getActionComponent()}

      <div className="h-[1px] my-3 bg-ground-5"></div>
      <div>
        <div className="my-2">{t('common.height')} (m)</div>
        <InputNumber
          value={Number(currentAirpoint?.pointZ.toFixed(2) ?? 0)}
          className="w-full"
          onChange={(value: number | null) =>
            value &&
            onChangePosition(
              'pointZ',
              limitNum(
                value,
                -globalConfig.uavHeightLimit,
                globalConfig.uavHeightLimit,
              ),
            )
          }
        />
      </div>
      <div>
        <div className="my-2">{t('common.longitude')}</div>
        <InputNumber
          value={Number(currentAirpoint?.pointX.toFixed(6) ?? 0)}
          className="w-full"
          onChange={(value: number | null) =>
            value && onChangePosition('pointX', value)
          }
        />
      </div>
      <div>
        <div className="my-2">{t('common.latitude')}</div>
        <InputNumber
          value={Number(currentAirpoint?.pointY.toFixed(6))}
          className="w-full"
          onChange={(value: number | null) =>
            value && onChangePosition('pointY', value)
          }
        />
      </div>
      <div>
        <div className="my-2">{t('common.speed')} (m/s)</div>
        <InputNumber
          value={Number(currentAirpoint?.speed?.toFixed(2) ?? globalSpeed)}
          className="w-full"
          min={1}
          max={15}
          onChange={(value: number | null) =>
            value && onChangePosition('speed', value)
          }
        />
      </div>
    </>
  )
}

export default ActionConfig
