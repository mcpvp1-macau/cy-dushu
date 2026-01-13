import IconUpload from '@/assets/icons/jsx/IconUpload'
import IconButton from '@/components/ui/button/IconButton'
import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import { DeviceEnum } from '@/enum/device'
import { useAppMsg } from '@/hooks/useAppMsg'
import { uploadWaylineTemplate } from '@/service/modules/wayline'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { useSearchParams } from 'react-router-dom'

type PropsType = unknown

/** 上传航线模板 */
const UploadWaylineTemplate: FC<PropsType> = memo(() => {
  const [open, { setTrue, setFalse }] = useBoolean()
  const { t, i18n } = useTranslation()
  const [searchParams] = useSearchParams()

  const allDevices = useMapDevicesStore((s) => s.allDevices)

  const formItems = useMemo(() => {
    const deviceOptions = allDevices
      .filter((device) => device.deviceType === DeviceEnum.UAV)
      .map((e) => ({
        label: e.deviceName,
        value: e.deviceId,
      }))
    return [
      {
        name: 'deviceId',
        label: t('wayline.upload.form.device.label'),
        type: 'select',
        options: deviceOptions,
        rules: [
          {
            required: true,
            message: t('wayline.upload.form.device.required_msg'),
          },
        ],
      },
      {
        name: 'kmzFile',
        label: t('wayline.upload.form.kmzFile.label'),
        type: 'upload',
        valuePropName: 'file',
        otherProps: {
          accept: '.kmz',
          beforeUpload: () => false,
        },
        rules: [
          {
            required: true,
            message: t('wayline.upload.form.kmzFile.required_msg'),
          },
        ],
      },
      {
        name: 'isThird',
        label: t('wayline.upload.form.isThird.label'),
        type: 'checkbox',
        options: [
          {
            value: true,
            label: t('common.yes'),
          },
        ],
      },
    ] as XFormItem[]
  }, [i18n.language, allDevices])

  const msgApi = useAppMsg()
  const queryClient = useQueryClient()
  // 处理上传确认并刷新模板列表
  const handleConfirm = async (data) => {
    const { deviceId } = data
    const device = allDevices.find((e) => deviceId === e.deviceId)
    if (!device) {
      msgApi.error(t('wayline.upload.error.deviceNotExist.msg'))
      return
    }
    const file = data.kmzFile.file
    // 从 URL query 参数中获取 folderId
    const folderId = searchParams.get('folderId')
    await uploadWaylineTemplate(
      device.deviceId,
      device.productKey,
      file,
      !!data.isThird?.includes(true),
      folderId ?? undefined,
    )

    if (data.isThird?.includes(true)) {
      msgApi.success(t('wayline.upload.success.third'))
    } else {
      msgApi.success(t('wayline.upload.success.msg'))
    }

    setFalse()
    queryClient.invalidateQueries({
      queryKey: ['waylineTemplates'],
      exact: false,
    })
  }

  return (
    <>
      <IconButton
        tippyProps={{
          content: t('wayline.upload.title'),
        }}
        onClick={setTrue}
      >
        <IconUpload />
      </IconButton>
      <FormModal
        title={t('wayline.upload.title')}
        clearOnDestroy
        open={open}
        items={formItems}
        onClose={setFalse}
        onConfirm={handleConfirm}
      />
    </>
  )
})

UploadWaylineTemplate.displayName = 'UploadWaylineTemplate'

export default UploadWaylineTemplate
