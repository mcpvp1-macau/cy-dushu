import IconControlRoom from '@/assets/icons/jsx/IconControlRoom'
import IconData from '@/assets/icons/jsx/IconData'
import IconDetail from '@/assets/icons/jsx/IconDetail'
import DeviceIcon from '@/components/device/DeviceIcon'
import OverflowText from '@/components/ui/OverflowText'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FIXED_WING_DEMO_TELEMETRY,
  FIXED_WING_HEALTH_STATES,
  getDefaultTaskCapability,
} from '@/demo/fixed-wing/constants'
import useFixedWingDemoStore from '@/demo/fixed-wing/useFixedWingDemo.store'
import { DisconnectOutlined } from '@ant-design/icons'
import { Button, Segmented, Tooltip } from 'antd'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import CloseableHeader from '../../components/CloseableHeader'
import { BaseDeviceDetailProps } from '../routes'

type PropsType = BaseDeviceDetailProps

const telemetry = FIXED_WING_DEMO_TELEMETRY

/** 信息行 (与标准无人机详情 UavInfoCard 保持一致) */
const I: FC<{ l: ReactNode; v: ReactNode; isfull?: boolean }> = ({
  l,
  v,
  isfull = false,
}) => (
  <li className={clsx('flex gap-1 overflow-hidden', isfull && 'col-span-2')}>
    <div className="whitespace-nowrap">{l}:</div>
    {v}
  </li>
)

/**
 * 固定翼无人机一级详情
 * 表现形式与标准无人机详情一致（信息列 + 页签 + 视频 + 进入驾驶舱），字段内容为固定翼特有
 */
const FixedWingDetail: FC<PropsType> = memo(
  ({ data, headerTools, headerProps, onClose }) => {
    const { t } = useTranslation()

    const deviceNo = useFixedWingDemoStore((s) => s.deviceNo)
    const taskCapability = useFixedWingDemoStore(
      (s) =>
        s.taskCapabilities[data.deviceId] ??
        getDefaultTaskCapability(data.deviceId),
    )
    const healthIndex = useFixedWingDemoStore((s) => s.healthIndex)
    const isHealthy = healthIndex === 0
    const healthText = FIXED_WING_HEALTH_STATES[healthIndex] ?? '正常'

    const [tab, setTab] = useState(0)

    return (
      <div className="overflow-y-hidden flex flex-col">
        <CloseableHeader
          onClose={onClose}
          rightTools={headerTools}
          {...headerProps}
        >
          <div className="flex gap-2 items-center">
            <DeviceIcon type="FIXED_WING" className="device-detail-icon" />
            <h6 className="text-highlight text-base">{data.deviceName}</h6>
            <Tooltip title={`健康状态：${healthText}`}>
              <span
                className={clsx(
                  'size-2 rounded-full',
                  isHealthy ? 'bg-green-500' : 'bg-red-500',
                )}
              />
            </Tooltip>
          </div>
        </CloseableHeader>

        <ScrollArea className="grow">
          <div className="px-3 mb-3">
            <Segmented
              block
              value={tab}
              options={[
                { label: t('common.detail'), value: 0, icon: <IconDetail /> },
                { label: t('common.data'), value: 1, icon: <IconData /> },
              ]}
              onChange={setTab}
            />
          </div>

          {tab === 0 ? (
            <>
              <ul className="p-2 mx-3 mr-[9px] card-border text-sm grid grid-cols-2 overflow-hidden">
                <I
                  l="编号"
                  v={
                    <OverflowText className="flex-1 truncate">
                      {deviceNo || '-'}
                    </OverflowText>
                  }
                />
                <I l="类型" v={<span>CY9A</span>} />
                <I l="油量" v={<span>{telemetry.fuel} %</span>} />
                <I
                  l="链路"
                  v={
                    <OverflowText className="flex-1 truncate">
                      {telemetry.linkType}
                    </OverflowText>
                  }
                />
                <I
                  l={t('common.longitude')}
                  v={<span>{telemetry.longitude.toFixed(5)}</span>}
                />
                <I
                  l={t('common.latitude')}
                  v={<span>{telemetry.latitude.toFixed(5)}</span>}
                />
                <I
                  l="无线电高度"
                  v={<span>{telemetry.radioHeight.toFixed(1)} m</span>}
                />
                <I
                  l="地速"
                  v={<span>{telemetry.groundSpeed.toFixed(1)} m/s</span>}
                />
                <I isfull l="可执行任务" v={<span>{taskCapability}</span>} />
              </ul>

              <section className="m-3 overflow-hidden rounded">
                <div className="aspect-video bg-black flex items-center justify-center rounded">
                  <span className="flex items-center gap-1.5 text-red-500 text-sm">
                    <DisconnectOutlined />
                    设备已离线
                  </span>
                </div>
              </section>

              <section className="mx-3 mr-[9px] my-3 flex gap-2">
                <Link
                  className="grow"
                  to={`/control-room/fixed-wing/${data.deviceId}`}
                >
                  <Button block className="h-7" icon={<IconControlRoom />}>
                    {t('device.enterControlRoom.title')}
                  </Button>
                </Link>
              </section>
            </>
          ) : (
            <div className="mx-3 mr-[9px] card-border p-6 text-center text-fore opacity-60 text-sm">
              暂无数据
            </div>
          )}
        </ScrollArea>
      </div>
    )
  },
)

FixedWingDetail.displayName = 'FixedWingDetail'

export default FixedWingDetail
