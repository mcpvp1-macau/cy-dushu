import SignalStrength from '@/components/device/SignalStrength'
import IconButton from '@/components/ui/button/IconButton'
import { uavDisplayModeTransMap } from '@/constant/trans_map/uav_display_mode'
import { StatusColorMap } from '@/enum/device'
import { useAppMsg } from '@/hooks/useAppMsg'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { CopyOutlined } from '@ant-design/icons'
import { pick, round } from 'lodash'
import { useShallow } from 'zustand/react/shallow'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import { emtpyObject } from '@/constant/data'
import OverflowText from '@/components/ui/OverflowText'

const I: FC<{ l: ReactNode; v: ReactNode }> = ({ l, v }) => {
  return (
    <li className="w-1/2 flex gap-1 overflow-hidden">
      <div className="whitespace-nowrap">{l}:</div>
      {v}
    </li>
  )
}

type PropsType = {} & Partial<{
  modelNumber: string
  onlineStatus: string
  signalStrength: number
  displayMode: string
  electricity: number
  longitude: number
  latitude: number
  height: number
  horizontalSpeed: number
}>

const UavDetailInfoCard: FC<PropsType> = memo(
  ({
    modelNumber,
    onlineStatus,
    signalStrength,
    displayMode,
    electricity,
    longitude,
    latitude,
    height,
    horizontalSpeed,
  }) => {
    const { t, i18n } = useTranslation()
    const s = useUavControlRoomStore(
      useShallow((m) => {
        const s = m.state
        return pick(s, [
          'longitude',
          'latitude',
          'height',
          'altitude',
          'uavYaw',
          'uavPitch',
          'uavRoll',
          'gimbalYaw',
          'gimbalPitch',
          'horizontalSpeed',
        ])
      }),
    )

    const p = useDeviceDetailStore(
      (s) => s.deviceDetail?.properties ?? emtpyObject,
    )

    const msgApi = useAppMsg()
    const handleCopy = async () => {
      const texts = [
        [
          t('common.lonLat'),
          `${round(s.longitude ?? p.longitude ?? 0, 6) || '-'}, ${
            round(s.latitude ?? p.latitude ?? 0, 6) || '-'
          }`,
        ],
        [
          t('common.altitude'),
          `${round(s.altitude ?? p.altitude ?? 0, 1) || '-'} m`,
        ],
        [t('common.height'), `${round(s.height ?? p.height ?? 0, 1) || '-'} m`],
        [
          t('controlRoom.uav.header.hSpeed.title'),
          `${round(s.horizontalSpeed ?? p.horizontalSpeed ?? 0, 1) || '-'} m/s`,
        ],
        [
          t('controlRoom.uav.uavYaw.title'),
          `${round(s.uavYaw ?? p.uavYaw ?? 0, 1) || '-'}`,
        ],
        [
          t('controlRoom.uav.uavPitch.title'),
          `${round(s.uavPitch ?? p.uavPitch ?? 0, 1) || '-'}`,
        ],
        [
          t('controlRoom.uav.uavRoll.title'),
          `${round(s.uavRoll ?? p.uavRoll ?? 0, 1) || '-'}`,
        ],
        [
          t('controlRoom.uav.gimbalYaw.title'),
          `${round(s.gimbalYaw ?? p.gimbalYaw ?? 0, 1) || '-'}`,
        ],
        [
          t('controlRoom.uav.gimbalPitch.title'),
          `${round(s.gimbalPitch ?? p.gimbalPitch ?? 0, 1) || '-'}`,
        ],
      ]
      const text = texts.reduce((acc, [label, value]) => {
        return `${acc}${label}: ${value}\n`
      }, '')
      await navigator.clipboard.writeText(text)
      msgApi.success('复制飞参信息成功')
    }

    return (
      <ul className="p-2 mx-3 mr-[9px] card-border text-sm flex flex-wrap overflow-hidden">
        <I l={t('common.modelNumber')} v={modelNumber} />
        <I
          l={t('common.onlineStatus')}
          v={
            <p className="flex gap-2">
              <span style={{ color: StatusColorMap[onlineStatus!] }}>
                {onlineStatus ? t(`device.status.online.${onlineStatus}`) : '-'}
              </span>
              <SignalStrength value={signalStrength ?? 0} />
            </p>
          }
        />
        <I
          l={t('uav.displayMode.title')}
          v={
            <OverflowText className="flex-1 truncate">
              {uavDisplayModeTransMap[displayMode || '']?.[i18n.language] ||
                displayMode}
            </OverflowText>
          }
        />
        <I l={t('common.electricity')} v={`${electricity || 0} %`} />
        <I l={t('common.longitude')} v={longitude?.toFixed(5) || '-'} />
        <I
          l={t('common.latitude')}
          v={
            <div className="flex items-center gap-1">
              <span>{latitude?.toFixed(5) || '-'}</span>
              <IconButton
                tippyProps={{ content: '复制飞参信息' }}
                onClick={handleCopy}
              >
                <CopyOutlined />
              </IconButton>
            </div>
          }
        />
        <I l={t('common.height')} v={`${height?.toFixed(2) || 0} m`} />
        <I
          l={t('common.speed')}
          v={`${horizontalSpeed?.toFixed(2) || 0} m/s`}
        />
      </ul>
    )
  },
)

UavDetailInfoCard.displayName = 'UavDetailInfoCard'

export default UavDetailInfoCard
