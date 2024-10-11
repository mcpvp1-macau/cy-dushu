import { ReactNode, memo, useMemo, type FC } from 'react'
import styles from './index.module.less'
import IconButton from '@/components/ui/button/IconButton'
import { Button, Popconfirm, Spin, Switch, message } from 'antd'
import icons from './icons'
import {
  CheckCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
  LoadingOutlined,
} from '@ant-design/icons'
// import DownIcon from '@/components/Icon/DownIcon'
import IconExpand from '@/assets/icons/jsx/IconExpand'
import { useBoolean } from 'ahooks'
import { postDeviceService } from '@/service/modules/device'
import dayjs from 'dayjs'
// import { getValueLable } from '@/utils/thingModel'
import AppEmpty from '@/components/AppEmpty'
import IconClose from '@/assets/icons/jsx/IconClose'

const getValueLable = (identifier: string, map: any, data: any) => {
  const props = map[identifier] || {}
  const { dataType } = props || {}
  const { type, specs } = dataType || {}
  const value = data[identifier]
  if (type === 'struct') {
    return identifier
  } else if (type === 'enum') {
    return specs?.[value] || '--'
  } else if (type === 'float' || type === 'double' || type === 'int') {
    return `${value || '--'} ${specs?.unit}`
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
        title === '舱盖' && btnLabel === '打开' ? (
          <Popconfirm
            title="开盖前请确认机场周边环境，无障碍物或人员靠近"
            okText="确定"
            cancelText="取消"
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
        )
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
  const [messageApi, contextHolder] = message.useMessage()
  const deviceId = data.deviceId
  const productKey = data.productKey || data.deviceModel?.productKey

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

  const runService = async (identifier: string, params: any) => {
    const key = dayjs().valueOf()
    if (productKey && deviceId) {
      messageApi.open({
        key,
        type: 'loading',
        content: '操作中...',
      })
      const { code } = await postDeviceService(
        productKey,
        deviceId,
        identifier,
        params,
      )
      if ('SUCCESS' === code) {
        messageApi.open({
          key,
          type: 'success',
          content: '操作成功',
          duration: 2,
        })
      } else {
        messageApi.open({
          key,
          type: 'error',
          content: '操作失败',
          duration: 2,
        })
      }
    }
  }

  const serviceItems: ServiceItemProps[] = [
    {
      icon: icons.JCXT,
      title: '机场系统',
      info: getValueLable('modeCode', propertiesMap, state),
      disabled: state['modeCode'] !== 2 || state['deviceRebootProcess'] === 0,
      loading: state['deviceRebootProcess'] === 0,
      btnLabel: state['deviceRebootProcess'] === 0 ? '重启中' : '重启',
      onClick: () => runService('deviceReboot', {}),
    },
    {
      icon: icons.FXQ,
      title: '飞行器',
      info: (() => {
        switch (state['droneOpenProcess']) {
          case 0:
            return '开机中'
          case 1:
            return '关机中'
          case 2:
            return '已开机'
          case 3:
            return '已关机'
          default:
            return '-'
        }
      })(),
      disabled:
        state['modeCode'] !== 2 || [0, 1].includes(state['droneOpenProcess']),
      loading: [0, 1].includes(state['droneOpenProcess']),
      btnLabel: (() => {
        switch (state['droneOpenProcess']) {
          case 0:
            return '开机中'
          case 1:
            return '关机中'
          case 2:
            return '关机'
          case 3:
            return '开机'
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
      title: '舱盖',
      info: getValueLable('coverState', propertiesMap, state),
      disabled:
        state['modeCode'] !== 2 ||
        (state['coverState'] !== 0 && state['coverState'] !== 2),
      loading: state['coverState'] === 1 || state['coverState'] === 3,
      btnLabel: (() => {
        switch (state['coverState']) {
          case 0:
            return '打开'
          case 1:
            return '打开中'
          case 2:
            return '关闭'
          case 3:
            return '关闭中'
          case 4:
            return '舱盖状态异常'
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
      title: '推杆',
      info: getValueLable('putterState', propertiesMap, state),
      disabled:
        state['modeCode'] !== 2 || [1, 3, 4].includes(state['putterState']),
      loading: [1, 3].includes(state['putterState']),
      btnLabel: (() => {
        switch (state['putterState']) {
          case 0:
            return '打开'
          case 1:
            return '打开中'
          case 2:
            return '关闭'
          case 3:
            return '关闭中'
          case 4:
            return '推杆状态异常'
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
      title: '飞行器充电',
      info: (() => {
        let prefix = ''
        switch (state['droneChargeStatusProcess']) {
          case 0:
            prefix = '空闲'
            break
          case 1:
            prefix = '充电中'
            break
          case 2:
            prefix = '准备中'
            break
          case 3:
            prefix = '断电中'
        }
        return `${prefix}${
          state['droneChargeState']?.['capacityPercent'] || '-'
        }%`
      })(),
      disabled:
        state['modeCode'] !== 2 ||
        state['droneChargeStatusProcess'] === 2 ||
        state['droneChargeStatusProcess'] === 3,
      loading:
        state['droneChargeStatusProcess'] === 2 ||
        state['droneChargeStatusProcess'] === 3,
      btnLabel: (() => {
        switch (state['droneChargeStatusProcess']) {
          case 0:
            return '充电'
          case 1:
            return '结束'
          case 2:
            return '准备中'
          case 3:
            return '断电中'
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
      title: '一键返航',
      info: '-',
      disabled: state['modeCode'] !== 2,
      btnLabel: '返航',
      onClick: () => runService('returnHome', {}),
    },
    {
      icon: icons.JCCC,
      title: '机场存储',
      info:
        (
          (100 * (state?.storage?.used ?? 0)) /
          (state?.storage?.used ?? 1)
        ).toFixed(2) + '%',
      disabled: state['modeCode'] !== 2 || state['deviceFormatProcess'] === 1,
      loading: state['deviceFormatProcess'] === 1,
      btnLabel: state['deviceFormatProcess'] === 0 ? '格式化' : '格式化中',
      onClick: () => {
        if (state['deviceFormatProcess'] === 0) runService('deviceFormat', {})
      },
    },
    {
      icon: icons.FXQCC,
      title: '飞行器存储',
      info: '-',
      disabled: state['modeCode'] !== 2 || state['droneFormatProcess'] === 1,
      loading: state['droneFormatProcess'] === 1,
      btnLabel: state['droneFormatProcess'] === 0 ? '格式化' : '格式化中',
      onClick: () => {
        if (state['droneFormatProcess'] === 0) runService('droneFormat', {})
      },
    },
    {
      icon: icons.BGD,
      title: '补光灯',
      info: getValueLable('supplementLightState', propertiesMap, state),
      disabled: state['modeCode'] !== 2,
      btnLabel: state['supplementLightState'] === 0 ? '开启' : '关闭',
      onClick: () =>
        runService('supplementLight', {
          action: state['supplementLightState'] === 0 ? 0 : 1,
        }),
    },
    {
      icon: icons.SGBJ,
      title: '声光报警',
      info: getValueLable('alarmState', propertiesMap, state),
      disabled: state['modeCode'] !== 2,
      btnLabel: state['alarmState'] === 0 ? '开启' : '关闭',
      onClick: () =>
        runService('alarmStateSwitch', {
          action: state['alarmState'] === 0 ? 1 : 0,
        }),
    },
  ]

  return (
    <div className={styles.remoteDebug}>
      {contextHolder}
      <div className={styles.header}>
        <div className={styles.title}>
          <span style={{ marginRight: '6px' }}>远程调试</span>
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
            <p>执行进度</p>
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
