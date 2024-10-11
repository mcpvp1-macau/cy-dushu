import IconClose from '@/assets/icons/jsx/IconClose'
import IconSetting from '@/assets/icons/jsx/IconSetting'
import IconTakeoff from '@/assets/icons/jsx/uav/IconTakeoff'
import Select from '@/components/AntdOverride/Select'
import IconButton from '@/components/ui/button/IconButton'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { setDeviceProp } from '@/service/modules/device'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useAsyncEffect, useDebounceEffect } from 'ahooks'
import { Button, Form, Input, InputNumber } from 'antd'
import { FormInstance, useForm } from 'antd/es/form/Form'
import { memo, type FC } from 'react'

const useComposeFormAndState = (
  key: string,
  stateValue: any,
  form: FormInstance<any>,
  callback: (data: any) => void,
) => {
  useEffect(() => {
    form.setFieldValue(key, stateValue)
  }, [stateValue])
  const formValue = Form.useWatch(key, form)
  useDebounceEffect(
    () => {
      if (formValue && formValue !== stateValue) {
        callback(formValue)
      }
    },
    [formValue],
    { wait: 1000, trailing: true },
  )
}

type PropsType = unknown

/** 飞行参数设置 */
const FlyParamsSetting: FC<PropsType> = memo(() => {
  const flyParams = useUavControlRoomStore((s) => s.flyParams)
  const updateFlyParams = useUavControlRoomStore((s) => s.updateFlyParams)

  const [form] = useForm()

  const gohomeAltitude = useUavControlRoomStore((s) => s.state.gohomeAltitude)
  const horizontalAvoidEnable = useUavControlRoomStore(
    (s) => s.state.HorizontalAvoidEnable,
  )
  const lostAction = useUavControlRoomStore((s) => s.state.lostAction)
  const gohomeLongitude = useUavControlRoomStore((s) => s.state.gohomeLongitude)
  const gohomeLatitude = useUavControlRoomStore((s) => s.state.gohomeLatitude)
  const disconnectTime = useUavControlRoomStore((s) => s.state.disconnectTime)

  const productKey = useDeviceDetailStore((s) => s.productKey)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const hasDisconnectTimeProps = useDeviceDetailStore(
    (s) => s.propsHave['disconnectTime'],
  )
  const { mutate } = useMutation({
    mutationFn: (data: any) => setDeviceProp(productKey, deviceId, data),
  })

  // 返航高度
  useComposeFormAndState('gohomeAltitude', gohomeAltitude, form, (v) =>
    mutate({ gohomeAltitude: v }),
  )

  // 避障
  useComposeFormAndState(
    'horizontalAvoidEnable',
    horizontalAvoidEnable,
    form,
    (v) => mutate({ HorizontalAvoidEnable: v }),
  )

  // 失联动作
  useComposeFormAndState('lostAction', lostAction, form, (v) =>
    mutate({ lostAction: v }),
  )

  // 返航点
  useEffect(() => {
    form.setFieldValue(
      'gohomePosition',
      `${gohomeLongitude?.toFixed(5) || 0}, ${gohomeLatitude?.toFixed(5) || 0}`,
    )
  }, [gohomeLongitude, gohomeLatitude])

  // 平台断连触发失联时间
  useComposeFormAndState('disconnectTime', disconnectTime, form, (v) =>
    mutate({ disconnectTime: v }),
  )

  // 飞行速度
  useAsyncEffect(async () => {
    const value = (await local.getItem<number>('uavFlyParamsSpeed')) ?? 10
    form.setFieldValue('flySpeed', value)
    updateFlyParams({ ...flyParams, flySpeed: value })
  }, [])
  const flySpeed = Form.useWatch('flySpeed', form)

  useDebounceEffect(
    () => {
      if (flySpeed) {
        local.setItem('uavFlyParamsSpeed', flySpeed)
        updateFlyParams({ ...flyParams, flySpeed })
      }
    },
    [flySpeed],
    { wait: 500, trailing: true },
  )

  const postService = usePostDeviceService(productKey, deviceId)

  /** 一键起飞 */
  const handleTakeoff = () => {
    postService('takeoff', {})
  }

  const openPointFly = useUavControlRoomStore((s) => s.openPointFly)

  if (!flyParams.open) {
    return null
  }

  return (
    <div className="absolute top-0 right-[404px] w-[400px] z-50 border border-solid border-ground-250 rounded-[2px]">
      <header className="flex justify-between items-center h-8 px-3 bg-ground-200">
        <p className="text-sm">飞行参数设置</p>
        <IconButton
          onClick={() => updateFlyParams({ ...flyParams, open: false })}
        >
          <IconClose className="scale-[120%]" />
        </IconButton>
      </header>
      <main
        className="p-2 bg-ground-140"
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="card-border bg-ground-100 p-3 pb-0">
          <Form
            form={form}
            size="small"
            labelCol={{
              span: 12,
            }}
            labelAlign="left"
          >
            <Form.Item label="返航高度 (20 - 1600 m)" name="gohomeAltitude">
              <InputNumber className="w-full" suffix="m" />
            </Form.Item>
            <Form.Item label="返航点" name="gohomePosition">
              <Input
                addonAfter={
                  <IconButton
                    active={flyParams.isResetHome}
                    className="text-sm scale-90 px-1"
                    toolTipProps={{ title: '重置返航点(在地图上点击设置)' }}
                    onClick={() =>
                      updateFlyParams({
                        ...flyParams,
                        isResetHome: !flyParams.isResetHome,
                      })
                    }
                  >
                    <IconSetting />
                  </IconButton>
                }
              />
            </Form.Item>
            <Form.Item label="避障" name="horizontalAvoidEnable">
              <Select
                options={[
                  { label: '开启', value: '1' },
                  { label: '关闭', value: '0' },
                ]}
              />
            </Form.Item>
            <Form.Item label="失联动作" name="lostAction">
              <Select
                options={[
                  { label: '返航', value: '2' },
                  { label: '悬停', value: '0' },
                  { label: '降落', value: '1' },
                ]}
              />
            </Form.Item>
            {hasDisconnectTimeProps && (
              <Form.Item label="平台断连触发失联时间" name="disconnectTime">
                <InputNumber
                  placeholder="请输入"
                  className="w-full"
                  suffix="s"
                />
              </Form.Item>
            )}
            <Form.Item label="飞行速度" name="flySpeed">
              <InputNumber
                placeholder="请输入"
                min={1}
                max={15}
                className="w-full"
                suffix="m/s"
              />
            </Form.Item>
            {openPointFly && (
              <Form.Item label="目标高度" name="targetAltitude">
                <InputNumber
                  placeholder="请输入"
                  value={flyParams.targetHeight}
                  min={20}
                  max={1000}
                  className="w-full"
                  suffix="m"
                  onChange={(e) =>
                    updateFlyParams({ ...flyParams, targetHeight: e ?? 0 })
                  }
                />
              </Form.Item>
            )}
          </Form>
        </div>
        {flyParams.isExecute && (
          <div className="text-center">
            <Button
              className="h-[26px] w-36 mt-2"
              icon={<IconTakeoff />}
              onClick={handleTakeoff}
            >
              一键起飞
            </Button>
          </div>
        )}
      </main>
    </div>
  )
})

FlyParamsSetting.displayName = 'FlyParamsSetting'

export default FlyParamsSetting
