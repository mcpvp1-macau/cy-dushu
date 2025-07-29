import AppEmpty from '@/components/AppEmpty'
import AppSpin from '@/components/AppSpin'
import DeviceIcon from '@/components/device/DeviceIcon'
import { ScrollArea } from '@/components/ui/scroll-area'
import XModal from '@/components/XModal'
import { DeviceEnum } from '@/enum/device'
import { usePostDeviceServiceHandler } from '@/hooks/device/usePostDeviceService'
import { useAppMsg } from '@/hooks/useAppMsg'
import DeviceItem from '@/pages/situation/source/components/DeviceItem'
import SourceTree from '@/pages/situation/source/components/SourceTree'
import { getDeviceTree, getRecommendDeviceList } from '@/service/modules/device'
import { getSpaceDistance } from '@/utils/geo-math'
import { Button, Checkbox, Form, Input, InputNumber, Segmented } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { omit, round } from 'lodash'

type PropsType = {
  open: boolean
  /** 经纬度 */
  position: number[]
  onClose: () => void
}

const fmtDistance = (distance: number) => {
  if (distance < 1000) {
    return `${round(distance, 1)} m`
  }
  return `${round(distance / 1000, 1)} km`
}

const DispatchModal: FC<PropsType> = memo(({ open, position, onClose }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')

  // 0 推荐, 1 手动
  const [method, setMethod] = useState(0)

  const [checkedDevices, setCheckDevices] = useState<string[]>([])

  const { data: recommendData, isLoading: recommendDataIsLoading } = useQuery({
    queryKey: ['recommendDeviceList', position],
    queryFn: () =>
      getRecommendDeviceList({ longitude: position[0], latitude: position[1] }),
    enabled: method === 0,
    select: (d) => d.data?.rows,
  })

  // 设备树
  const { data, isLoading, isRefetching } = useQuery(
    {
      queryKey: ['deviceTreeList', 'ALL', name],
      queryFn: () =>
        getDeviceTree({
          name: name || undefined,
        }),
      enabled: method === 1,
      select: (data) => data?.data,
    },
    queryClient,
  )

  // 设备 [deviceId] -> [Device] 映射
  const deviceMap = useMemo(() => {
    const map = new Map<string, API_DEVICE.domain.Device>()
    if (data) {
      const dfs = (data: API_DEVICE.domain.DeviceTreeItem) => {
        data.devices.forEach((e) => {
          map.set(e.deviceId, e)
        })
        data.children.forEach((e) => {
          dfs(e)
        })
      }
      dfs(data)
    }
    if (recommendData) {
      recommendData.forEach((e) => {
        map.set(e.deviceId, e)
      })
    }
    return map
  }, [data, recommendData])

  const [flyModalOpen, setFlyModalOpen] = useState(false)

  const [form] = useForm()

  const handleDispatchClick = (devices?: string[]) => {
    setFlyModalOpen(true)
    ;(devices ?? checkedDevices).forEach((e, i) => {
      const { deviceId, productKey, deviceType } = deviceMap.get(e)!
      form.setFieldValue([deviceId, 'height'], 40 - i * 10)
      form.setFieldValue([deviceId, 'gohomeAltitude'], 40 - i * 10)
      form.setFieldValue(
        [deviceId, 'speed'],
        deviceType === DeviceEnum.UAV || deviceType === DeviceEnum.UAV_AIRPORT
          ? 15
          : 3,
      )
      form.setFieldValue([deviceId, 'deviceId'], deviceId)
      form.setFieldValue([deviceId, 'productKey'], productKey)
    })
  }

  const postDeviceService = usePostDeviceServiceHandler()
  const [confirmLoading, setConfirmLoading] = useState(false)
  const msgApi = useAppMsg()

  const handleFlyConfirm = async () => {
    setConfirmLoading(true)
    const values = form.getFieldsValue()
    const resps = await Promise.allSettled(
      Object.values(omit(values, ['enableAutoThrow'])).map(async (e: any) => {
        const dev = deviceMap.get(e.deviceId)!
        const payload: Record<string, any> = {
          longitude: position[0],
          latitude: position[1],
        }
        if (
          dev.deviceType === DeviceEnum.UAV ||
          dev.deviceType === DeviceEnum.UAV_AIRPORT
        ) {
          payload.speed = e.speed
          payload.height = e.height
          payload.gohomeAltitude = e.gohomeAltitude
          // 投弹设置
          if (values.enableAutoThrow) {
            payload.enableAutoThrow = 'true'
            payload.throwType = 5
          }
        } else {
          payload.speed = e.speed
        }
        await postDeviceService(
          e.productKey,
          e.deviceId,
          'gotoPosition',
          payload,
          '派遣定位',
        )
      }),
    )
    setConfirmLoading(false)
    if (resps.every((e) => e.status === 'fulfilled')) {
      msgApi.success('所有设备派遣成功')
      onClose()
      setFlyModalOpen(false)
    }
  }

  const compareFn = useMemoizedFn(
    (a: API_DEVICE.domain.Device, b: API_DEVICE.domain.Device) => {
      if (a.status !== b.status) {
        if (a.status === 'ONLINE') {
          return -1
        } else if (b.status === 'ONLINE') {
          return 1
        }
      }
      if (a.remainingPower !== b.remainingPower) {
        return -((a.remainingPower ?? 0) - (b.remainingPower ?? 0))
      }
      if (a.longitude && b.longitude && a.latitude && b.latitude) {
        const aDistance = getSpaceDistance([
          position,
          [a.longitude, a.latitude],
        ])
        const bDistance = getSpaceDistance([
          position,
          [b.longitude, b.latitude],
        ])
        return aDistance - bDistance
      }
      return 0
    },
  )

  return (
    <>
      <XModal
        title="派遣"
        open={open}
        onClose={onClose}
        width={350}
        noPadding
        footer={false}
      >
        <div className="max-h-[70vh] flex flex-col overflow-hidden bg-ground-1/80">
          {method === 1 ? (
            <>
              <div className="px-3 mt-3">
                <Input
                  placeholder={t('source.input.placeholder')}
                  onPressEnter={(e) => setName(e.currentTarget.value)}
                />
              </div>
              <ScrollArea className="flex-1">
                {!data || isLoading ? (
                  <AppSpin />
                ) : (
                  <Checkbox.Group
                    value={checkedDevices}
                    onChange={setCheckDevices}
                  >
                    <SourceTree
                      data={data}
                      isLoading={isRefetching}
                      compareFn={compareFn}
                      deviceItemPrefix={(e) => <Checkbox value={e.deviceId} />}
                      deviceItemSuffix={(e) => (
                        <Button
                          size="small"
                          className="mr-2 text-xs"
                          onClick={() => {
                            setCheckDevices([e.deviceId])
                            handleDispatchClick([e.deviceId])
                          }}
                        >
                          派遣
                        </Button>
                      )}
                      deviceItemBottom={(e) =>
                        e.longitude &&
                        e.latitude && (
                          <div className="text-green-500 mr-6 whitespace-nowrap">
                            距{' '}
                            {fmtDistance(
                              getSpaceDistance([
                                position,
                                [e.longitude, e.latitude],
                              ]),
                            )}
                          </div>
                        )
                      }
                    />
                  </Checkbox.Group>
                )}
              </ScrollArea>
            </>
          ) : (
            <>
              {recommendDataIsLoading || !recommendData ? (
                <AppSpin />
              ) : recommendData.length === 0 ? (
                <AppEmpty description="暂无推荐" className="mt-5" />
              ) : (
                <div className="mt-2">
                  <Checkbox.Group
                    value={checkedDevices}
                    onChange={setCheckDevices}
                  >
                    {recommendData.map((e) => {
                      return (
                        <DeviceItem
                          key={e.deviceId}
                          data={e}
                          prefix={<Checkbox value={e.deviceId} />}
                          suffix={
                            <Button
                              size="small"
                              className="mr-2 text-xs"
                              onClick={() => {
                                setCheckDevices([e.deviceId])
                                handleDispatchClick([e.deviceId])
                              }}
                            >
                              派遣
                            </Button>
                          }
                          bottom={
                            e.longitude &&
                            e.latitude && (
                              <div className="text-green-500 mr-6 whitespace-nowrap">
                                距{' '}
                                {fmtDistance(
                                  getSpaceDistance([
                                    position,
                                    [e.longitude, e.latitude],
                                  ]),
                                )}
                              </div>
                            )
                          }
                        />
                      )
                    })}
                  </Checkbox.Group>
                </div>
              )}
            </>
          )}
          <div className="px-3 my-2 flex justify-between items-center">
            <Segmented
              options={[
                { label: '推荐', value: 0 },
                { label: '手动', value: 1 },
              ]}
              value={method}
              onChange={setMethod}
            />

            <div className="flex justify-end gap-2">
              <Button onClick={onClose}>取消</Button>
              <Button type="primary" onClick={() => handleDispatchClick()}>
                派遣
              </Button>
            </div>
          </div>
        </div>
      </XModal>
      {flyModalOpen && (
        <XModal
          title="设备派遣参数设置"
          mask
          centered
          open={flyModalOpen}
          confirmLoading={confirmLoading}
          onClose={() => setFlyModalOpen(false)}
          onConfirm={handleFlyConfirm}
        >
          <Form form={form} layout="vertical">
            {checkedDevices.map((e) => {
              const { deviceId, deviceName, deviceType } = deviceMap.get(e)!

              return (
                <div key={deviceId}>
                  <div className="text-sm flex gap-2 items-center">
                    <DeviceIcon type={deviceType} />
                    {deviceName}
                  </div>
                  <div className="flex gap-3">
                    {(deviceType === DeviceEnum.UAV ||
                      deviceType === DeviceEnum.UAV_AIRPORT) && (
                      <>
                        <Form.Item
                          className="w-1/3"
                          name={[deviceId, 'height']}
                          label={<div className="text-xs">起飞高度 (m)</div>}
                        >
                          <InputNumber
                            className="w-full"
                            min={1}
                            max={globalConfig.uavHeightLimit}
                          />
                        </Form.Item>
                        <Form.Item
                          className="w-1/3"
                          name={[deviceId, 'gohomeAltitude']}
                          label={<div className="text-xs">返航高度 (m)</div>}
                        >
                          <InputNumber
                            className="w-full"
                            min={1}
                            max={globalConfig.uavHeightLimit}
                          />
                        </Form.Item>
                      </>
                    )}
                    <Form.Item
                      className="w-1/3"
                      name={[deviceId, 'speed']}
                      label={<div className="text-xs">速度 (m/s)</div>}
                    >
                      <InputNumber className="w-full" min={1} max={15} />
                    </Form.Item>
                    <Form.Item name={[deviceId, 'deviceId']} hidden />
                    <Form.Item name={[deviceId, 'productKey']} hidden />
                  </div>
                </div>
              )
            })}
            <Form.Item name="enableAutoThrow" valuePropName="checked">
              <Checkbox>自动投弹</Checkbox>
            </Form.Item>
          </Form>
        </XModal>
      )}
    </>
  )
})

DispatchModal.displayName = 'DispatchModal'

export default DispatchModal
