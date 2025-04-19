import IconSwarm from '@/assets/icons/jsx/IconSwarm'
import AppSpin from '@/components/AppSpin'
import IconButton from '@/components/ui/button/IconButton'
import { ScrollArea } from '@/components/ui/scroll-area'
import XModal from '@/components/XModal'
import { usePostDeviceServiceHandler } from '@/hooks/device/usePostDeviceService'
import SourceStatusCheckGroup from '@/pages/situation/source/components/SourceStatusCheckGroup'
import SourceTree from '@/pages/situation/source/components/SourceTree'
import { getDeviceTree } from '@/service/modules/device'
import { Button, Checkbox, Form, Input, InputNumber } from 'antd'
import { useForm } from 'antd/es/form/Form'

type PropsType = {
  open: boolean
  /** 经纬度 */
  position: number[]
  onClose: () => void
}

const DispatchModal: FC<PropsType> = memo(({ open, position, onClose }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')

  const { data, isLoading, isRefetching } = useQuery(
    {
      queryKey: ['deviceTreeList', 'UAV', name],
      queryFn: () =>
        getDeviceTree({
          name: name || undefined,
          type: 'UAV',
        }),
      select: (data) => data?.data,
    },
    queryClient,
  )

  const [isGroup, setIsGroup] = useState(false)

  const checkedDevices = useRef<string[]>([])

  const [flyModalOpen, setFlyModalOpen] = useState(false)

  const [form] = useForm()

  const handleDispatchClick = () => {
    setFlyModalOpen(true)
    checkedDevices.current.forEach((e, i) => {
      const [deviceId, productKey] = e.split('@?sb!@')
      form.setFieldValue([deviceId, 'height'], 120 + i * 10)
      form.setFieldValue([deviceId, 'gohomeAltitude'], 120 + i * 10)
      form.setFieldValue([deviceId, 'speed'], 10)
      form.setFieldValue([deviceId, 'deviceId'], deviceId)
      form.setFieldValue([deviceId, 'productKey'], productKey)
    })
  }

  const postDeviceService = usePostDeviceServiceHandler()
  const [confirmLoading, setConfirmLoading] = useState(false)
  const handleFlyConfirm = async () => {
    setConfirmLoading(true)
    const values = form.getFieldsValue()
    await Promise.allSettled(
      Object.values(values).map(async (e: any) => {
        await postDeviceService(
          e.productKey,
          e.deviceId,
          'gotoPosition',
          {
            longitude: position[0],
            latitude: position[1],
            ...e,
          },
          '指点飞行',
        )
      }),
    )
    setConfirmLoading(false)
  }

  return (
    <>
      <XModal
        title="派遣"
        open={open}
        onClose={() => onClose()}
        width={350}
        noPadding
        footer={false}
      >
        <div className="max-h-[70vh] flex flex-col overflow-hidden bg-ground-1/80">
          <div className="px-3 mt-3">
            <Input
              placeholder={t('source.input.placeholder')}
              onPressEnter={(e) => setName(e.currentTarget.value)}
            />
          </div>
          <div className="px-3 mt-2 flex justify-between">
            <SourceStatusCheckGroup />
            <IconButton
              toolTipProps={{ title: '编组' }}
              active={isGroup}
              onClick={() => setIsGroup(!isGroup)}
            >
              <IconSwarm />
            </IconButton>
          </div>
          <ScrollArea className="flex-1">
            {!data || isLoading ? (
              <AppSpin />
            ) : (
              <Checkbox.Group
                onChange={(v) => {
                  checkedDevices.current = v
                }}
              >
                <SourceTree
                  data={data}
                  isLoading={isRefetching}
                  deviceItemPrefix={(e) =>
                    isGroup
                      ? e.deviceId &&
                        e.productKey && (
                          <Checkbox
                            value={`${e.deviceId}@?sb!@${e.productKey}@?sb!@${e.deviceName}`}
                          />
                        )
                      : null
                  }
                  deviceItemSuffix={(e) =>
                    !isGroup ? (
                      <Button
                        size="small"
                        className="mr-2 text-xs"
                        onClick={() => {
                          checkedDevices.current = [
                            `${e.deviceId}@?sb!@${e.productKey}@?sb!@${e.deviceName}`,
                          ]
                          handleDispatchClick()
                        }}
                      >
                        派遣
                      </Button>
                    ) : null
                  }
                />
              </Checkbox.Group>
            )}
          </ScrollArea>
          <div className="px-3 my-2 flex justify-end gap-2">
            <Button>取消</Button>
            {isGroup && (
              <Button type="primary" onClick={handleDispatchClick}>
                派遣
              </Button>
            )}
          </div>
        </div>
      </XModal>
      {flyModalOpen && (
        <XModal
          title="指点飞行"
          mask
          centered
          open={flyModalOpen}
          confirmLoading={confirmLoading}
          onClose={() => setFlyModalOpen(false)}
          onConfirm={handleFlyConfirm}
        >
          <Form form={form} layout="vertical">
            {checkedDevices.current.map((e) => {
              const [deviceId, , deviceName] = e.split('@?sb!@')
              return (
                <div key={deviceId}>
                  <div className="text-sm">{deviceName}</div>
                  <div className="flex gap-3">
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
                    <Form.Item
                      className="w-1/3"
                      name={[deviceId, 'speed']}
                      label={<div className="text-xs">飞行速度 (m/s)</div>}
                    >
                      <InputNumber className="w-full" min={1} max={15} />
                    </Form.Item>
                    <Form.Item name={[deviceId, 'deviceId']} hidden />
                    <Form.Item name={[deviceId, 'productKey']} hidden />
                  </div>
                </div>
              )
            })}
          </Form>
        </XModal>
      )}
    </>
  )
})

DispatchModal.displayName = 'DispatchModal'

export default DispatchModal
