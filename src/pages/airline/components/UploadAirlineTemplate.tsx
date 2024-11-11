import IconUpload from '@/assets/icons/jsx/IconUpload'
import IconButton from '@/components/ui/button/IconButton'
import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import { DeviceEnum } from '@/enum/device'
import { useAppMsg } from '@/hooks/useAppMsg'
import { uploadAirlineTemplate } from '@/service/modules/airline'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { DefaultOptionType } from 'antd/es/select'

type PropsType = unknown

const createUploadAirlineItems = (deviceOptions: DefaultOptionType) =>
  [
    {
      name: 'deviceId',
      label: '设备',
      type: 'select',
      options: deviceOptions,
      rules: [{ required: true, message: '请选择设备' }],
    },
    {
      name: 'kmzFile',
      label: '上传文件',
      type: 'upload',
      valuePropName: 'file',
      otherProps: {
        accept: '.kmz',
        beforeUpload: () => false,
      },
      rules: [{ required: true, message: '请上传航线文件' }],
    },
    {
      name: 'isThird',
      label: '第三方',
      type: 'checkbox',
      options: [
        {
          value: true,
          label: '是',
        },
      ],
    },
  ] as XFormItem[]

/** 上传航线 */
const UploadAirlineTemplte: FC<PropsType> = memo(() => {
  const [open, { setTrue, setFalse }] = useBoolean()

  const allDevices = useMapDevicesStore((s) => s.allDevices)

  const formItems = useMemo(() => {
    const deviceOptions = allDevices
      .filter((device) => device.deviceType === DeviceEnum.UAV)
      .map((e) => ({
        label: e.deviceName,
        value: e.deviceId,
      }))
    return createUploadAirlineItems(deviceOptions)
  }, [allDevices])

  const msgApi = useAppMsg()
  const queryClient = useQueryClient()
  const handleConfirm = async (data) => {
    const { deviceId } = data
    const device = allDevices.find((e) => deviceId === e.deviceId)
    if (!device) {
      msgApi.error('设备不存在')
      return
    }
    const file = data.kmzFile.file
    await uploadAirlineTemplate(
      device.deviceId,
      device.productKey,
      file,
      !!data.isThird?.includes(true),
    )
    msgApi.success('上传成功')
    setFalse()
    queryClient.invalidateQueries({
      queryKey: ['airlineTemplates'],
      exact: false,
    })
  }

  return (
    <>
      <IconButton
        toolTipProps={{ title: '上传航线', mouseEnterDelay: 0.5 }}
        onClick={setTrue}
      >
        <IconUpload />
      </IconButton>
      <FormModal
        title="上传航线"
        clearOnDestroy
        open={open}
        items={formItems}
        onClose={setFalse}
        onConfirm={handleConfirm}
      />
    </>
  )
})

UploadAirlineTemplte.displayName = 'UploadAirlineTemplte'

export default UploadAirlineTemplte
