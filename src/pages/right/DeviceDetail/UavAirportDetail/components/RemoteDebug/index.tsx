import styles from './index.module.less'
import IconButton from '@/components/ui/button/IconButton'
import { Button, Popconfirm, Spin, Switch } from 'antd'
import icons from './icons'
import {
  CheckCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
  LoadingOutlined,
} from '@ant-design/icons'
import IconExpand from '@/assets/icons/jsx/IconExpand'
import { useBoolean } from 'ahooks'
import AppEmpty from '@/components/AppEmpty'
import IconClose from '@/assets/icons/jsx/IconClose'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'

const getValueLable = (identifier: string, map: any, data: any) => {
  const props = map[identifier] || {}
  const { dataType } = props || {}
  const { type, specs } = dataType || {}
  const value = data[identifier]
  if (type === 'struct') {
    return identifier
  } else if (type === 'enum') {
    return specs?.[value] || '-'
  } else if (type === 'float' || type === 'double' || type === 'int') {
    return `${value || '-'} ${specs?.unit}`
  }

  return null
}

type ServiceItemProps = {
  icon: (props: any) => JSX.Element
  title: string
  info: string
  loading?: boolean
  disabled?: boolean
  btnLabel?: string
  onClick?: () => unknown
}

const _ServiceItem: FC<ServiceItemProps> = ({
  icon: Icon,
  title,
  info,
  onClick,
  loading,
  disabled,
  btnLabel,
}) => {
  const { t } = useTranslation()

  return (
    <div className={styles.item}>
      <Icon
        style={{
          color: '#C7D1DC',
          width: '20px',
          height: '20px',
          fontSize: '20px',
        }}
      />
      <div className={styles.textBox}>
        <p className={styles.value}>{info}</p>
        <p className={styles.title}>{title}</p>
      </div>
      {!loading ? (
        btnLabel &&
        (title === t('device.uavDock.remoteDebug.cover.title') &&
        btnLabel === t('device.uavDock.remoteDebug.cover.open.title') ? (
          <Popconfirm
            title={t('device.uavDock.remoteDebug.cover.openWarning')}
            onConfirm={onClick}
          >
            <Button
              size="small"
              style={{
                width: '44px',
                padding: '0',
                backgroundColor: '#28323C',
                fontSize: '12px',
                height: '20px',
              }}
              disabled={disabled}
            >
              {btnLabel}
            </Button>
          </Popconfirm>
        ) : (
          <Button
            size="small"
            style={{
              width: '44px',
              padding: '0',
              backgroundColor: '#28323C',
              fontSize: '12px',
              height: '20px',
            }}
            disabled={disabled}
            onClick={onClick}
          >
            {btnLabel}
          </Button>
        ))
      ) : (
        <Spin
          style={{ width: '44px' }}
          indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />}
        />
      )}
    </div>
  )
}
const ServiceItem = memo(_ServiceItem)
ServiceItem.displayName = 'ServiceItem'

// ----------------------------------------------------------------------------

const statusMap: Record<string, string> = {
  sent: '已下发',
  in_progress: '执行中',
  ok: '执行成功',
  failed: '执行失败',
  canceled: '执行取消',
  timeout: '执行超时',
}

const colorMap: Record<string, string> = {
  ok: '#20a96a',
  failed: '#fe6869',
}

const processMap: Record<string, string> = {
  device_reboot: '机场重启',
  drone_open: '飞行器开启',
  drone_close: '飞行器关闭',
  device_format: '机场数据格式化',
  drone_format: '飞行棋数据格式化',
  cover_open: '打开舱盖',
  cover_close: '关闭舱盖',
  putter_open: '推杆展开',
  putter_close: '推杆闭合',
  charge_open: '打开充电',
  charge_close: '关闭充电',
}

const iconMap: Record<string, ReactNode> = {
  sent: <InfoCircleFilled style={{ color: '#c7d1dc' }} />,
  ok: <CheckCircleFilled style={{ color: '#20a96a' }} />,
  in_progress: <InfoCircleFilled style={{ color: '#c7d1dc' }} />,
  failed: <ExclamationCircleFilled style={{ color: '#fe6869' }} />,
  canceled: <InfoCircleFilled style={{ color: '#c7d1dc' }} />,
  timeout: <ExclamationCircleFilled style={{ color: '#fe6869' }} />,
}

type PropsType = {
  state: Record<string, any>
  data: API_DEVICE.domain.Device
  progress: any[]
  onClose?: () => void
}

/** 远程调试 */
const RemoteDebug: FC<PropsType> = ({ state, onClose, data, progress }) => {
  const { t } = useTranslation()
  const deviceId = data.deviceId
  const productKey = (data.productKey || data.deviceModel?.productKey)!

  // 属性映射
  const propertiesMap = useMemo(() => {
    if (!data?.deviceModel) return {}
    const { deviceModel } = data
    const map: Record<string, any> = {}
    deviceModel?.properties?.forEach((item) => {
      map[item.identifier] = item
    })
    return map
  }, [data])

  // 控制执行进度的展开收起
  const [open, { toggle }] = useBoolean(false)

  const runService = usePostDeviceService(productKey, deviceId)

  const serviceItems: ServiceItemProps[] = useMemo(
    () => [
      {
        icon: icons.JCXT,
        title: t('device.uavDock.remoteDebug.jcxt.title'),
        info: getValueLable('modeCode', propertiesMap, state),
        disabled: state['modeCode'] !== 2 || state['deviceRebootProcess'] === 0,
        loading: state['deviceRebootProcess'] === 0,
        btnLabel: t('device.uavDock.remoteDebug.jcxt.restart.title'),
        onClick: () => runService('deviceReboot', {}),
      },
      {
        icon: icons.FXQ,
        title: t('device.uavDock.remoteDebug.uav.title'),
        info: (() => {
          switch (state['droneOpenProcess']) {
            case 0:
              return t('device.uavDock.remoteDebug.uav.booting.title')
            case 1:
              return t('device.uavDock.remoteDebug.uav.Halting.title')
            case 2:
              return t('device.uavDock.remoteDebug.uav.powerOn.title')
            case 3:
              return t('device.uavDock.remoteDebug.uav.powerDown.title')
            default:
              return '-'
          }
        })(),
        disabled:
          state['modeCode'] !== 2 || [0, 1].includes(state['droneOpenProcess']),
        loading: [0, 1].includes(state['droneOpenProcess']),
        btnLabel: (() => {
          switch (state['droneOpenProcess']) {
            case 2:
              return t('device.uavDock.remoteDebug.uav.on.title')
            case 3:
              return t('device.uavDock.remoteDebug.uav.off.title')
            default:
              break
          }
        })(),
        onClick: () => {
          runService('droneSwitch', {
            action: state['droneOpenProcess'] === 2 ? 2 : 1,
          })
        },
      },
      {
        icon: icons.CG,
        title: t('device.uavDock.remoteDebug.cover.title'),
        info: getValueLable('coverState', propertiesMap, state),
        disabled:
          state['modeCode'] !== 2 ||
          (state['coverState'] !== 0 && state['coverState'] !== 2),
        loading: [1, 3].includes(state['coverState']),
        btnLabel: (() => {
          switch (state['coverState']) {
            case 0:
              return t('device.uavDock.remoteDebug.cover.open.title')
            case 2:
              return t('device.uavDock.remoteDebug.cover.close.title')
            case 4:
              return t('common.error')
            default:
              break
          }
          return ''
        })(),
        onClick: () => {
          if (state['coverState'] === 0 || state['coverState'] === 2)
            runService('coverSwitch', {
              action: state['coverState'] === 0 ? 1 : 2,
            })
        },
      },
      {
        icon: icons.TG,
        title: t('device.uavDock.remoteDebug.putter.title'),
        info: getValueLable('putterState', propertiesMap, state),
        disabled:
          state['modeCode'] !== 2 || [1, 3, 4].includes(state['putterState']),
        loading: [1, 3].includes(state['putterState']),
        btnLabel: (() => {
          switch (state['putterState']) {
            case 0:
              return t('device.uavDock.remoteDebug.cover.open.title')
            case 2:
              return t('device.uavDock.remoteDebug.cover.close.title')
            case 4:
              return t('common.error')
            default:
              break
          }
          return state['putterState']
        })(),
        onClick: () => {
          if ([0, 2].includes(state['putterState']))
            runService('putterSwitch', {
              action: state['putterState'] === 0 ? 1 : 2,
            })
        },
      },
      {
        icon: icons.FXQCD,
        title: t('device.uavDock.remoteDebug.aircraftCharging.title'),
        info: (() => {
          if (!state.droneChargeState?.capacityPercent) {
            return '-'
          }
          let prefix = ''
          switch (state['droneChargeStatusProcess']) {
            case 0:
              prefix = t(
                'device.uavDock.remoteDebug.aircraftCharging.idle.title',
              )
              break
            case 1:
              prefix = t(
                'device.uavDock.remoteDebug.aircraftCharging.charging.title',
              )
              break
            case 2:
              prefix = t(
                'device.uavDock.remoteDebug.aircraftCharging.preparing.title',
              )
              break
            case 3:
              prefix = t(
                'device.uavDock.remoteDebug.aircraftCharging.poweringOff.title',
              )
          }
          return `${prefix} ${state.droneChargeState.capacityPercent}%`
        })(),
        disabled:
          state['modeCode'] !== 2 ||
          [2, 3].includes(state['droneChargeStatusProcess']),
        loading: [2, 3].includes(state['droneChargeStatusProcess']),
        btnLabel: (() => {
          switch (state['droneChargeStatusProcess']) {
            case 0:
              return t(
                'device.uavDock.remoteDebug.aircraftCharging.powerOn.title',
              )
            case 1:
              return t(
                'device.uavDock.remoteDebug.aircraftCharging.powerOff.title',
              )
            default:
              return ''
          }
        })(),
        onClick: () => {
          if (
            state['droneChargeStatusProcess'] === 0 ||
            state['droneChargeStatusProcess'] === 1
          )
            runService('chargeSwitch', {
              action: state['droneChargeStatusProcess'] === 0 ? 1 : 2,
            })
        },
      },
      {
        icon: icons.YJFC,
        title: t('device.uavDock.remoteDebug.goHome.title'),
        info: '-',
        disabled: state['modeCode'] !== 2,
        btnLabel: t('device.uavDock.remoteDebug.goHome.btn.title'),
        onClick: () => runService('returnHome', {}),
      },
      {
        icon: icons.JCCC,
        title: t('device.uavDock.dockStorage.title'),
        info:
          (
            (100 * (state?.storage?.used ?? 0)) /
            (state?.storage?.used ?? 1)
          ).toFixed(2) + '%',
        disabled: state['modeCode'] !== 2 || state['deviceFormatProcess'] === 1,
        loading: state['deviceFormatProcess'] === 1,
        btnLabel:
          state['deviceFormatProcess'] === 0
            ? t('device.uavDock.dockStorage.format.title')
            : t('device.uavDock.dockStorage.formatting.title'),
        onClick: () => {
          if (state['deviceFormatProcess'] === 0) runService('deviceFormat', {})
        },
      },
      {
        icon: icons.FXQCC,
        title: t('device.uavDock.aircraftStorage.title'),
        info: '-',
        disabled: state['modeCode'] !== 2 || state['droneFormatProcess'] === 1,
        loading: state['droneFormatProcess'] === 1,
        btnLabel:
          state['droneFormatProcess'] === 0
            ? t('device.uavDock.dockStorage.format.title')
            : t('device.uavDock.dockStorage.formatting.title'),
        onClick: () => {
          if (state['droneFormatProcess'] === 0) runService('droneFormat', {})
        },
      },
      {
        icon: icons.BGD,
        title: t('device.uavDock.supplementLight.title'),
        info: getValueLable('supplementLightState', propertiesMap, state),
        disabled: state['modeCode'] !== 2,
        btnLabel:
          state['supplementLightState'] === 0
            ? t('device.uavDock.remoteDebug.cover.open.title')
            : t('device.uavDock.remoteDebug.cover.close.title'),
        onClick: () =>
          runService('supplementLight', {
            action: state['supplementLightState'] === 0 ? 0 : 1,
          }),
      },
      {
        icon: icons.SGBJ,
        title: t('device.uavDock.alarmState.title'),
        info: getValueLable('alarmState', propertiesMap, state),
        disabled: state['modeCode'] !== 2,
        btnLabel:
          state['alarmState'] === 0
            ? t('device.uavDock.remoteDebug.cover.open.title')
            : t('device.uavDock.remoteDebug.cover.close.title'),
        onClick: () =>
          runService('alarmStateSwitch', {
            action: state['alarmState'] === 0 ? 1 : 0,
          }),
      },
    ],
    [t],
  )

  return (
    <div className={styles.remoteDebug}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span style={{ marginRight: '6px' }}>
            {t('device.uavDock.remoteDebug.title')}
          </span>
          <Switch
            size="small"
            disabled={[1, 3, 4].includes(state['modeCode'])}
            value={state['modeCode'] === 2}
            onClick={() => {
              runService('debugMode', {
                action: state['modeCode'] === 0 ? 0 : 1,
              })
            }}
          />
        </div>
        <div className={styles.close} onClick={onClose}>
          <IconButton>
            <IconClose style={{ fontSize: '18px' }} />
          </IconButton>
        </div>
      </div>
      <div className={styles.wrapper}>
        <div className={styles.content}>
          {serviceItems.map((item) => (
            <ServiceItem key={item.title} {...item} />
          ))}
        </div>
        <div className={styles.content2}>
          <div
            className={styles.progressHeader}
            style={{
              borderBottom: open
                ? '1px solid #37414d'
                : '1px solid transparent',
            }}
          >
            <p>{t('device.uavDock.remoteDebug.processProgress.title')}</p>
            <IconButton onClick={toggle}>
              <IconExpand
                style={{
                  fontSize: '14px',
                  transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
                  transition: 'transform 0.3s',
                }}
              />
            </IconButton>
          </div>
          {open && (
            <div className={styles.progressWrapper}>
              {progress?.length > 0 ? (
                progress.map((item, index) => (
                  <div
                    key={index}
                    style={{ color: colorMap[item.output.status] ?? '#c7d1dc' }}
                  >
                    <span style={{ marginRight: '6px' }}>
                      {iconMap[item.output.status]}
                    </span>
                    <span>{item.time?.format('MM-DD HH:mm:ss')}: </span>
                    <span>{processMap[item.name?.toLowerCase()]}</span>
                    <span>{statusMap[item.output.status]}</span>
                    {item.output.status === 'in_progress' && (
                      <span>{`(${item.output.progress.percent}%)`}</span>
                    )}
                  </div>
                ))
              ) : (
                <AppEmpty />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RemoteDebug
