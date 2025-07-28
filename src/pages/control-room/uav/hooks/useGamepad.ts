import { useLatest, useRafInterval, useThrottleFn, useUnmount } from 'ahooks'
import { useAppMsg } from '@/hooks/useAppMsg'
import { limitNum } from '@/utils/math'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { uavControlRoomZoomEmitter } from '../components/Zoom'
import { gimbalSwitchEmitter } from '../components/GimbalLeft/GimbalSwitch'

const keyMap_vendor0738_product2221 = new Map<number, string>([
  [0, 'resetGimbalYaw'], // 云台回中
  [1, 'takeoff'], // 一键起飞
  [2, 'takePhoto'], // 拍照
  [4, 'stopAll'], // 紧急停止
  [5, 'moveBottom'], // 降落
  [10, 'moveGimbalTop'], // 云台向上
  [11, 'moveGimbalRight'], // 云台向右
  [12, 'moveGimbalBottom'], // 云台向下
  [13, 'moveGimbalLeft'], // 云台向左
])

const axisMap_vendor0738_product2221 = new Map<number, string>([
  [0, 'moveUavHorizontal'], // 水平方向移动无人机 (-0.7, 0.7)
  [1, 'moveUavVertical'], // 垂直方向移动飞机 (-0.7, 0.7)
  [5, 'rotateUav'], // 旋转无人机方向 (-0.7, 0.7)
])

const keyMap_vendor0738_producta221 = new Map<number, string>([
  [1, 'goHome'], // 一键返航
  [7, 'switchModeBefore'], // 切换相机模式
  [8, 'switchModeAfter'], // 切换相机模式
  [9, 'scaleGimbalBig'], // 变焦放大
  [10, 'scaleGimbalSmall'], // 变焦缩小
])

const axisMap_vendor0738_producta221 = new Map<number, string>([
  [0, 'moveUavHeight'], // 高度 (-1, 1) 向上是 -1, 向下是 1
])

const LONG_PRESS_TIME = 2_000 // 长按时间

// 需要长按的按键们
const longPressButtons = new Set<string>(['takeoff', 'goHome'])

// 跳过已发送的按键们
const skipSendedButtons = new Set<string>([
  'moveGimbalTop',
  'moveGimbalRight',
  'moveGimbalBottom',
  'moveGimbalLeft',
  'scaleGimbalBig',
  'scaleGimbalSmall',
  'moveBottom',
])

type ButtonInfo = {
  ts: number // 时间戳
  value: number // 按键值
  sended: boolean // 是否已发送
}

/** 摇杆*/
const useGamepad = (
  productKey: string,
  deviceId: string,
  canMoveUav: boolean,
  isFly: boolean,
) => {
  const enableGamepad = useUavControlRoomStore((s) => s.enableGamepad)
  const enableGamepadRef = useLatest(enableGamepad)

  const buttonKeys = useRef<Map<string, ButtonInfo>>(new Map())
  const axisKeys = useRef<Map<string, number>>(new Map())
  const msgApi = useAppMsg()

  const postService = usePostDeviceService(productKey, deviceId)

  const { t } = useTranslation()

  const { updateUavControlInfo, updateGimbalControlInfo } =
    useUavControlRoomStore((s) => ({
      updateUavControlInfo: s.updateUavControlInfo,
      updateGimbalControlInfo: s.updateGimbalControlInfo,
    }))
  const canMoveRef = useLatest(canMoveUav)
  // 移动无人机
  const { run: moveUav } = useThrottleFn(
    () => {
      if (!enableGamepadRef.current) {
        return
      }
      if (!canMoveRef.current) {
        updateUavControlInfo({ x: 0, y: 0, z: 0, yaw: 0 })
        msgApi.destroy('uavMoveTop')
        msgApi.destroy('uavMoveBottom')
        return
      }
      const x = axisKeys.current.get('moveUavHorizontal') ?? 0
      const y = axisKeys.current.get('moveUavVertical') ?? 0
      let z = 0
      if (axisKeys.current.has('moveUavHeight')) {
        z = axisKeys.current.get('moveUavHeight')! - 0.35
      }
      // 经过偏移 z 的范围是 [-1.35, 0.65]
      const moveBottom = buttonKeys.current.get('moveBottom')
      const yaw = axisKeys.current.get('rotateUav') ?? 0
      // 如果值太小，不发送
      if (
        Math.abs(x) < 0.05 &&
        Math.abs(y) < 0.05 &&
        Math.abs(yaw) < 0.03 &&
        Math.abs(z) < 0.1 &&
        !moveBottom
      ) {
        updateUavControlInfo({ x: 0, y: 0, z: 0, yaw: 0 })
        msgApi.destroy('uavMoveTop')
        msgApi.destroy('uavMoveBottom')
        return
      }
      const data: Record<string, number> = {}
      if (Math.abs(x) >= 0.05) {
        data.x = 15 * Math.min(x, 1)
      }
      if (Math.abs(y) >= 0.05) {
        data.y = -15 * Math.min(y, 1) // -15 是因为摇杆向上是负数, 向下是正数
      }
      if (Math.abs(z) >= 0.1) {
        data.z = limitNum(-5 * z, -3, 5)
      }
      if (Math.abs(yaw) >= 0.05) {
        data.yaw = 13 * Math.min(yaw, 1)
      }
      if (isFly && data.z > 0) {
        msgApi.destroy('uavMoveBottom')
        msgApi.info({
          key: 'uavMoveTop',
          duration: 0,
          content: t('controlRoom.gamepad.uavIsAscending.msg'),
          className: 'ant-message-uav-move-top',
          style: {
            marginTop: '20px',
          },
        })
      } else if (isFly && data.z < 0) {
        msgApi.destroy('uavMoveTop')
        msgApi.info({
          key: 'uavMoveBottom',
          duration: 0,
          content: t('controlRoom.gamepad.uavIsDesending.msg'),
          className: 'ant-message-uav-move-bottom',
          style: {
            marginTop: '20px',
          },
        })
      } else {
        msgApi.destroy('uavMoveTop')
        msgApi.destroy('uavMoveBottom')
      }
      if (moveBottom) {
        data.z = -3
      }
      updateUavControlInfo({
        x: data.x ?? 0,
        y: data.y ?? 0,
        z: data.z ?? 0,
        yaw: data.yaw ?? 0,
      })
    },
    {
      wait: 50,
      trailing: false,
    },
  )
  // 移动云台
  const { run: moveGimbal } = useThrottleFn(
    () => {
      if (!enableGamepadRef.current) {
        return
      }
      let pitch = 0,
        yaw = 0
      pitch += buttonKeys.current.get('moveGimbalTop') ? 15 : 0
      pitch += buttonKeys.current.get('moveGimbalBottom') ? -15 : 0
      yaw += buttonKeys.current.get('moveGimbalRight') ? 15 : 0
      yaw += buttonKeys.current.get('moveGimbalLeft') ? -15 : 0
      if (pitch === 0 && yaw === 0) {
        updateGimbalControlInfo({ yaw: 0, pitch: 0 })
        return
      }
      updateGimbalControlInfo({ yaw, pitch })
    },
    { wait: 50, trailing: false },
  )

  // 调整焦距
  const { run: scaleGimbal } = useThrottleFn(
    (isBig = true) => {
      uavControlRoomZoomEmitter.emit('gamepadZoom', isBig)
    },
    { wait: 300, trailing: false },
  )

  const dodo = useMemo(
    () =>
      new Map<string, () => unknown>([
        // ['takeoff', () => toolsEmitter.emit('takeoff')], 夏老师说 一键起飞 不要了~
        ['takePhoto', () => postService('takePhoto')],
        ['stopAll', () => postService('stopAll')],
        ['goHome', () => postService('gohome')],
        ['resetGimbalYaw', () => postService('resetGimbal')],
        ['switchModeBefore', () => gimbalSwitchEmitter.emit('switch', -1)],
        ['switchModeAfter', () => gimbalSwitchEmitter.emit('switch', 1)],
        ['scaleGimbalBig', () => scaleGimbal(true)],
        ['scaleGimbalSmall', () => scaleGimbal(false)],
      ]),
    [postService],
  )

  // 鼠标松开事件
  const keyUpDo = useMemo(
    () =>
      new Map<string, () => unknown>([
        ['moveBottom', () => postService('stopAll')],
      ]),
    [],
  )

  useRafInterval(() => {
    if (!enableGamepadRef.current) {
      buttonKeys.current.clear()
      axisKeys.current.clear()
      return
    }
    // 收集按键信息
    for (const gamepad of navigator.getGamepads()) {
      if (!gamepad) {
        continue
      }
      const { axes, buttons, id } = gamepad
      const match = id.match(/\(([^)]+)\)/)
      if (!match) {
        continue
      }
      const padId = match[1]
      if (padId === 'Vendor: 0738 Product: 2221') {
        for (const [k, v] of keyMap_vendor0738_product2221.entries()) {
          const { value, pressed } = buttons[k] ?? {}
          if (pressed) {
            if (!buttonKeys.current.has(v)) {
              buttonKeys.current.set(v, {
                ts: Date.now(),
                value,
                sended: false,
              })
            }
          } else {
            if (buttonKeys.current.has(v)) {
              buttonKeys.current.delete(v)
              keyUpDo.get(v)?.()
            }
          }
        }
        for (const [k, v] of axisMap_vendor0738_product2221.entries()) {
          const value = axes[k]
          axisKeys.current.set(v, value)
        }
      } else if (padId === 'Vendor: 0738 Product: a221') {
        for (const [k, v] of keyMap_vendor0738_producta221.entries()) {
          const { value, pressed } = buttons[k] ?? {}
          if (pressed) {
            if (!buttonKeys.current.has(v)) {
              buttonKeys.current.set(v, {
                ts: Date.now(),
                value,
                sended: false,
              })
            }
          } else {
            buttonKeys.current.delete(v)
          }
        }
        for (const [k, v] of axisMap_vendor0738_producta221.entries()) {
          const value = axes[k]
          axisKeys.current.set(v, value)
        }
      }
    }
    // 处理按键信息
    for (const [key, info] of buttonKeys.current.entries()) {
      const { ts, value, sended } = info
      // 判断是否已经发送
      if (sended && !skipSendedButtons.has(key)) {
        continue
      }
      // 判断是否需要长按
      if (longPressButtons.has(key) && Date.now() - ts < LONG_PRESS_TIME) {
        continue
      }
      // 发送按键
      buttonKeys.current.set(key, { ts, value, sended: true })
      dodo.get(key)?.()
    }
    for (const [key] of axisKeys.current.entries()) {
      dodo.get(key)?.()
    }
    // 移动无人机
    moveUav()
    // 移动云台
    moveGimbal()
  }, 33)

  useUnmount(() => {
    msgApi.destroy('uavMoveTop')
    msgApi.destroy('uavMoveBottom')
  })

  return {
    buttonKeys,
    axisKeys,
  }
}

export default useGamepad
