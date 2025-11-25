import {
  memo,
  useEffect,
  useMemo,
  type ButtonHTMLAttributes,
  type FC,
} from 'react'
import clsx from 'clsx'
import { Dropdown, Tooltip } from 'antd'
import { useMemoizedFn, useRafInterval } from 'ahooks'
import IconTurnLeft from '@/assets/icons/jsx/uav/IconTurnLeft'
import { Btn } from '@/pages/control-room/rebot-dog/components/ControlButtons/type'
import IconUp from '@/assets/icons/jsx/IconUp'
import IconLeft from '@/assets/icons/jsx/IconLeft'
import IconTurnRight from '@/assets/icons/jsx/uav/IconTurnRight'
import IconDown from '@/assets/icons/jsx/IconDown'
import IconRight from '@/assets/icons/jsx/IconRight'
import { useKeyDownGroup } from '@/hooks/useKeyDownGroup'
import IconTurnRight2 from '@/assets/icons/jsx/IconTurnRight2'
import IconTurnDown from '@/assets/icons/jsx/IconTurnDown'
import IconTurnLeft2 from '@/assets/icons/jsx/IconTurnLeft2'
import IconTurnOn from '@/assets/icons/jsx/IconTurnOn'
import IconTurnLeft3 from '@/assets/icons/jsx/IconTurnLeft'
import IconTurnRight3 from '@/assets/icons/jsx/IconTurnRight'
import { useRebotDogClusterStore } from '@/store/control-room/useRebotDogCluster.store'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import { AppstoreOutlined } from '@ant-design/icons'
import SitDown from '@/pages/control-room/rebot-dog/components/ControlButtons/assets/sitDown.svg'
import LayDown from '@/pages/control-room/rebot-dog/components/ControlButtons/assets/layDown.svg'
import StandUp from '@/pages/control-room/rebot-dog/components/ControlButtons/assets/standUp.svg'
import { usePostDeviceServiceHandler } from '@/hooks/device/usePostDeviceService'
import XForm from '@/components/XForm'
import { useForm } from 'antd/es/form/Form'

const keyFilter = ['q', 'w', 'e', 'a', 's', 'd', 'u', 'i', 'o', 'j', 'k', 'l']

export const ClusterControlButtons: FC = memo(() => {
  const params = useRebotDogClusterStore((s) => s.params)
  const selectedCount = useRebotDogClusterStore((s) => s.selectedIds.length)
  const disabled = selectedCount === 0

  const buttons = useMemo(
    () =>
      [
        {
          value: { yawSpeed: params.speed },
          btn: 'Q',
          identifier: 'yawSpeed',
          icon: <IconTurnLeft />,
          method: 'service.moveDog.post',
          label: '左转',
        },
        {
          value: { xSpeed: params.speed },
          btn: 'W',
          identifier: 'xSpeed',
          icon: <IconUp />,
          method: 'service.moveDog.post',
          label: '前进',
        },
        {
          value: { yawSpeed: -params.speed },
          btn: 'E',
          identifier: 'yawSpeed',
          icon: <IconTurnRight />,
          method: 'service.moveDog.post',
          label: '右转',
        },
        {
          value: { ySpeed: params.speed },
          btn: 'A',
          identifier: 'ySpeed',
          icon: <IconLeft />,
          method: 'service.moveDog.post',
          label: '左移',
        },
        {
          value: { xSpeed: -params.speed },
          btn: 'S',
          identifier: 'xSpeed',
          icon: <IconDown />,
          method: 'service.moveDog.post',
          label: '后退',
        },
        {
          value: { ySpeed: -params.speed },
          btn: 'D',
          identifier: 'ySpeed',
          icon: <IconRight />,
          method: 'service.moveDog.post',
          label: '右移',
        },
        {
          value: { yaw: params.attitude },
          btn: 'U',
          identifier: 'yaw',
          icon: <IconTurnLeft3 />,
          method: 'service.moveDog.post',
          label: '左转头',
        },
        {
          value: { pitch: -params.attitude },
          btn: 'I',
          identifier: 'pitch',
          icon: <IconTurnOn />,
          method: 'service.moveDog.post',
          label: '抬头',
        },
        {
          value: { yaw: -params.attitude },
          btn: 'O',
          identifier: 'yaw',
          icon: <IconTurnRight3 />,
          method: 'service.moveDog.post',
          label: '右转头',
        },
        {
          value: { roll: -params.attitude },
          btn: 'J',
          identifier: 'roll',
          icon: <IconTurnLeft2 />,
          method: 'service.moveDog.post',
          label: '左歪头',
        },
        {
          value: { pitch: params.attitude },
          btn: 'K',
          identifier: 'pitch',
          icon: <IconTurnDown />,
          method: 'service.moveDog.post',
          label: '低头',
        },
        {
          value: { roll: params.attitude },
          btn: 'L',
          identifier: 'roll',
          icon: <IconTurnRight2 />,
          method: 'service.moveDog.post',
          label: '右歪头',
        },
      ] as Btn[],
    [params],
  )

  const dogControlInfo = useRebotDogClusterStore((s) => s.dogControlInfo)
  const updateDogControlInfo = useRebotDogClusterStore(
    (s) => s.updateDogControlInfo,
  )
  const updateActiveMouseBtn = useRebotDogClusterStore(
    (s) => s.updateActiveMouseBtn,
  )
  const handleUp = useMemoizedFn(() => {
    updateActiveMouseBtn(null)
  })

  const keyMap = useMemo(
    () => Object.fromEntries(buttons.map((e) => [e.btn.toLowerCase(), e])),
    [buttons],
  )

  const activeBtns = useKeyDownGroup({
    keyFilter: keyFilter,
    clearOnOtherKey: true,
  })

  useEffect(() => {
    const moveDogRes = {
      xSpeed: 0,
      ySpeed: 0,
      yawSpeed: 0,
      yaw: 0,
      pitch: 0,
      roll: 0,
    }

    activeBtns.forEach((e) => {
      const btn = keyMap[e]
      if (btn?.method === 'service.moveDog.post') {
        // @ts-ignore
        moveDogRes[btn.identifier] += btn.value[btn.identifier] ?? 0
      }
    })

    updateDogControlInfo(moveDogRes)
  }, [activeBtns.size, keyMap])

  const speedText = params.speed.toFixed(1)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs text-fore/70">
        已选 {selectedCount} 台，按键/鼠标可同步控制
      </div>
      <div
        className={clsx(
          'flex flex-col lg:flex-row items-center lg:items-start select-none font-[Consolas] gap-3',
          disabled && 'opacity-70',
        )}
      >
        <div className="flex flex-col gap-1">
          <div className="border border-solid rounded bg-ground-1 border-ground-5 flex overflow-hidden">
            {buttons.slice(0, 3).map((e) => (
              <Tooltip key={e.btn} title={e.label} placement="top">
                <ControlButton
                  disabled={disabled}
                  active={
                    (dogControlInfo[e.identifier] ?? 0) *
                      // @ts-ignore
                      (e.value[e.identifier] as number) >
                    0
                  }
                  onMouseDown={() => updateActiveMouseBtn(e)}
                  onMouseUp={handleUp}
                  onMouseLeave={handleUp}
                >
                  {e.icon}
                  {e.btn}
                </ControlButton>
              </Tooltip>
            ))}
          </div>
          <div className="flex justify-center gap-2 items-center text-green-500 text-shadow pointer-events-none">
            <span className="text-sm">
              SPD
              <br />
              m/s
            </span>
            <span className="text-lg">{speedText}</span>
          </div>
          <div className="border border-solid rounded bg-ground-1 border-ground-5 flex overflow-hidden">
            {buttons.slice(3, 6).map((e) => (
              <Tooltip key={e.btn} title={e.label} placement="top">
                <ControlButton
                  disabled={disabled}
                  active={
                    (dogControlInfo[e.identifier] ?? 0) *
                      // @ts-ignore
                      (e.value[e.identifier] as number) >
                    0
                  }
                  onMouseDown={() => updateActiveMouseBtn(e)}
                  onMouseUp={handleUp}
                  onMouseLeave={handleUp}
                >
                  {e.btn}
                  {e.icon}
                </ControlButton>
              </Tooltip>
            ))}
          </div>
        </div>
        <ClusterActionService disabled={disabled} />
        <div className="flex flex-col gap-1">
          <div className="border border-solid rounded bg-ground-1 border-ground-5 flex overflow-hidden">
            {buttons.slice(6, 9).map((e) => (
              <Tooltip key={e.btn} title={e.label} placement="top">
                <ControlButton
                  disabled={disabled}
                  active={
                    (dogControlInfo[e.identifier] ?? 0) *
                      // @ts-ignore
                      (e.value[e.identifier] as number) >
                    0
                  }
                  onMouseDown={() => updateActiveMouseBtn(e)}
                  onMouseUp={handleUp}
                  onMouseLeave={handleUp}
                >
                  {e.icon}
                  {e.btn}
                </ControlButton>
              </Tooltip>
            ))}
          </div>
          <div className="flex justify-center gap-2 items-center text-green-500 text-shadow pointer-events-none">
            <span className="text-lg">{'-'}</span>
            <span className="text-sm">
              ALT
              <br />m
            </span>
          </div>
          <div className="border border-solid rounded bg-ground-1 border-ground-5 flex overflow-hidden">
            {buttons.slice(9, 12).map((e) => (
              <Tooltip key={e.btn} title={e.label} placement="top">
                <ControlButton
                  disabled={disabled}
                  active={
                    (dogControlInfo[e.identifier] ?? 0) *
                      // @ts-ignore
                      (e.value[e.identifier] as number) >
                    0
                  }
                  onMouseDown={() => updateActiveMouseBtn(e)}
                  onMouseUp={handleUp}
                  onMouseLeave={handleUp}
                >
                  {e.btn}
                  {e.icon}
                </ControlButton>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})

export const ClusterControlSender: FC = memo(() => {
  const dogControlInfo = useRebotDogClusterStore((s) => s.dogControlInfo)
  const activeMouseBtn = useRebotDogClusterStore((s) => s.activeMouseBtn)
  const broadcast = useRebotDogClusterStore((s) => s.broadcastCommand)

  const dogPostInfo = useMemo(() => {
    let newVal: Record<string, number> = {}
    let hasValue = false
    for (const [k, v] of Object.entries(dogControlInfo)) {
      if (Math.abs(v ?? 0) < 1e-4) {
        continue
      }
      newVal[k] = v
      hasValue = true
    }
    if (activeMouseBtn && activeMouseBtn.method === 'service.moveDog.post') {
      newVal = {
        ...newVal,
        ...activeMouseBtn.value,
      }
      hasValue = true
    }
    return hasValue ? newVal : undefined
  }, [dogControlInfo, activeMouseBtn])

  useRafInterval(() => {
    broadcast('service.moveDog.post', dogPostInfo)
  }, dogPostInfo && 50)

  return null
})

ClusterControlSender.displayName = 'ClusterControlSender'

export const ClusterParams: FC = memo(() => {
  const [form] = useForm()
  const params = useRebotDogClusterStore((s) => s.params)
  const updateParams = useRebotDogClusterStore((s) => s.updateParams)

  useEffect(() => {
    form.setFieldsValue(params)
  }, [params])

  return (
    <div className="w-full max-w-[360px] bg-ground-1/70 rounded border border-ground-5 p-3 shadow-sm">
      <XForm
        className="w-full"
        layout="horizontal"
        size="small"
        colon={false}
        form={form}
        onChange={() => {
          const values = form.getFieldsValue()
          updateParams(values)
        }}
        items={[
          {
            label: '移动速度',
            name: 'speed',
            type: 'input-number',
            otherProps: {
              min: 0,
              max: 3.8,
              step: 0.1,
            },
          },
          {
            label: '姿态弧度',
            name: 'attitude',
            type: 'input-number',
            otherProps: {
              min: 0,
              max: 0.6,
              step: 0.1,
            },
          },
        ]}
      />
    </div>
  )
})

ClusterParams.displayName = 'ClusterParams'

const ClusterActionService: FC<{ disabled?: boolean }> = memo(
  ({ disabled }) => {
    const postService = usePostDeviceServiceHandler()
    const selectedDogs = useRebotDogClusterStore((s) =>
      s.dogs.filter((d) => s.selectedIds.includes(d.deviceId)),
    )

    const handleClick = useMemoizedFn(({ key }) => {
      selectedDogs.forEach((dog) =>
        postService(
          dog.productKey,
          dog.deviceId,
          key,
          undefined,
          dog.deviceName,
        ),
      )
    })

    return (
      <Dropdown
        placement="top"
        trigger={['click']}
        disabled={disabled}
        menu={{
          onClick: handleClick,
          items: [
            {
              key: 'actionSit',
              label: (
                <Tooltip title="坐下" placement="left">
                  <img className="size-5" src={SitDown} />
                </Tooltip>
              ),
            },
            {
              key: 'actionGetDown',
              label: (
                <Tooltip title="趴下" placement="left">
                  <img className="size-5" src={LayDown} />
                </Tooltip>
              ),
            },
            {
              key: 'actionStandUp',
              label: (
                <Tooltip title="站立" placement="left">
                  <img className="size-5" src={StandUp} />
                </Tooltip>
              ),
            },
          ],
        }}
      >
        <FloatIconButton className="scale-90" disabled={disabled}>
          <AppstoreOutlined />
        </FloatIconButton>
      </Dropdown>
    )
  },
)

ClusterActionService.displayName = 'ClusterActionService'

const ControlButton: FC<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    active?: boolean
  }
> = ({ active, ...props }) => {
  return (
    <button
      {...props}
      className={clsx(
        'flex flex-col gap-1 items-center p-1 px-2 hover:bg-primary hover:text-white',
        'disabled:opacity-50 disabled:hover:bg-ground-1 disabled:cursor-not-allowed',
        {
          'bg-primary text-white': active,
        },
      )}
    />
  )
}

ControlButton.displayName = 'ClusterControlButton'
