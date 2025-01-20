import IconSetting from '@/assets/icons/jsx/IconSetting'
import IconTakeoff from '@/assets/icons/jsx/uav/IconTakeoff'
import Select from '@/components/AntdOverride/Select'
import IconButton from '@/components/ui/button/IconButton'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { setDeviceProp } from '@/service/modules/device'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useAsyncEffect, useDebounceEffect } from 'ahooks'
import { Button, ConfigProvider, Form, Input, InputNumber } from 'antd'
import { FormInstance, useForm } from 'antd/es/form/Form'

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
  const { t } = useTranslation()

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

  const openPointFly = useUavControlRoomStore((s) => s.pointFly.open)

  useEffect(() => {
    form.setFieldValue('targetAltitude', flyParams.targetHeight)
  }, [flyParams.targetHeight])

  return (
    <>
      <div className="p-3 pb-0">
        <ConfigProvider
          theme={{
            components: {
              Form: {
                itemMarginBottom: 8,
              },
            },
          }}
        >
          <Form
            form={form}
            size="small"
            labelCol={{
              span: 12,
            }}
            labelAlign="left"
          >
            <Form.Item
              label={`${t(
                'controlRoom.uav.goHome.height.title',
              )} (20 - 1600 m)`}
              name="gohomeAltitude"
            >
              <InputNumber className="w-full" suffix="m" />
            </Form.Item>
            <Form.Item
              label={t('controlRoom.uav.goHome.point.title')}
              name="gohomePosition"
            >
              <Input
                addonAfter={
                  <IconButton
                    active={flyParams.isResetHome}
                    className="text-sm scale-90 px-1"
                    toolTipProps={{
                      title: t('controlRoom.uav.goHome.reset.msg'),
                    }}
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
            <Form.Item
              label={t('controlRoom.uav.avoidDistance.title')}
              name="horizontalAvoidEnable"
            >
              <Select
                options={[
                  { label: t('common.open'), value: '1' },
                  { label: t('common.close'), value: '0' },
                ]}
              />
            </Form.Item>
            <Form.Item
              label={t('controlRoom.uav.loseAction.title')}
              name="lostAction"
            >
              <Select
                options={[
                  {
                    label: t('controlRoom.uav.service.goHome.title'),
                    value: '2',
                  },
                  {
                    label: t('controlRoom.uav.service.hover.title'),
                    value: '0',
                  },
                  {
                    label: t('controlRoom.uav.service.autoland.title'),
                    value: '1',
                  },
                ]}
              />
            </Form.Item>
            {hasDisconnectTimeProps && (
              <Form.Item
                label={t('controlRoom.uav.disconnectTime.title')}
                name="disconnectTime"
              >
                <InputNumber
                  placeholder={t('common.form.pleaseInput')}
                  className="w-full"
                  suffix="s"
                />
              </Form.Item>
            )}
            <Form.Item label={t('common.flightSpeed')} name="flySpeed">
              <InputNumber
                placeholder={t('common.form.pleaseInput')}
                min={1}
                max={15}
                className="w-full"
                suffix="m/s"
              />
            </Form.Item>
            {openPointFly && (
              <Form.Item
                label={t('controlRoom.uav.targetAltitude.title')}
                name="targetAltitude"
              >
                <InputNumber
                  placeholder={t('common.form.pleaseInput')}
                  value={flyParams.targetHeight}
                  min={20}
                  max={1000}
                  className="w-full"
                  suffix="m"
                  onChange={(e) =>
                    updateFlyParams({ ...flyParams, targetHeight: e ?? 120 })
                  }
                />
              </Form.Item>
            )}
          </Form>
        </ConfigProvider>
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
    </>
  )
})

FlyParamsSetting.displayName = 'FlyParamsSetting'

export default FlyParamsSetting
