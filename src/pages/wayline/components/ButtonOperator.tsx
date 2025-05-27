import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import XModal from '@/components/XModal'
import { DeviceEnum } from '@/enum/device'
import { DictEnum } from '@/enum/dict'
import { useAppMsg } from '@/hooks/useAppMsg'
import {
  createActionItem,
  endActionItem,
  updateActionItem,
} from '@/service/modules/action-item'
import { getAllDeviceListV3 } from '@/service/modules/device'
import { isLiqunCommonError } from '@/service/servers/liqunAxios'
import { useDictOptions } from '@/store/useDict.store'
import { Button } from 'antd'
import { DefaultOptionType } from 'antd/es/select'
import { useSearchParams } from 'react-router-dom'

type PropsType = {
  deviceType?: DeviceEnum
  allowMultipleDevice?: boolean
  disabled?: boolean
  generateTaskData: () => Record<string, any>
  invalidate: () => boolean
}

/** 航线编辑底部按钮栏 */
const BottomOperator: FC<PropsType> = memo(
  ({
    disabled,
    deviceType = DeviceEnum.UAV,
    allowMultipleDevice = false,
    generateTaskData,
    invalidate,
  }) => {
    const msgApi = useAppMsg()
    const { t, i18n } = useTranslation()

    const [searchParams] = useSearchParams()
    const actionId = searchParams.get('actionId')
    const actionItemId = searchParams.get('actionItemId')
    const deviceId = searchParams.get('deviceId')

    let backUrl = searchParams.get('backUrl')
    if (backUrl) {
      backUrl = decodeURIComponent(backUrl)
    }
    const taskId = searchParams.get('taskId')

    const [loading, setLoading] = useState(0)
    const navigate = useNavigate()

    /** 保存任务 */
    const handleSave = async () => {
      if (invalidate()) {
        return
      }
      setLoading(1)
      let waylineTemplateId: number | undefined = undefined
      try {
        const data = generateTaskData()
        if (actionId) {
          // 说明是行动过来的
          data['actionId'] = actionId
          data['deviceIds'] = deviceId
          if (actionItemId) {
            // 说明是编辑
            data['actionItemId'] = actionItemId
            await updateActionItem(data)
          } else {
            // 创建子行动
            const resp = await createActionItem(data)
            waylineTemplateId = resp.data.id
          }
        } else {
          // 保存航线模板
          const resp = await createActionItem(data)
          waylineTemplateId = resp.data.id
        }
        // 如果有回调地址 (第三方)
        if (backUrl) {
          let to = backUrl.includes('?') ? backUrl : `${backUrl}?`
          if (waylineTemplateId) {
            to += `waylineTemplateId=${waylineTemplateId}`
          }
          if (taskId) {
            to += `&taskId=${taskId}`
          }
          location.href = to // 兼容第三方跳转
        } else {
          navigate(-1)
        }
      } finally {
        setLoading(0)
      }
    }

    const [executeOpen, setExecuteOpen] = useState(false)
    /** 立即执行 */
    const handleExecute = () => {
      if (invalidate()) {
        return
      }
      if (deviceId) {
        handleExecuteConfirm(deviceId)
      } else {
        setExecuteOpen(true)
      }
    }

    const [runningActionPayload, setRunningActionPayload] = useState<{
      actionItem: number
      message: string
    } | null>(null)

    const handleExecuteConfirm = async (deviceId: string, type?: string) => {
      setLoading(2)
      try {
        const data = generateTaskData()
        if (actionId) {
          data['actionId'] = actionId
        }
        data['execute'] = true
        data['type'] = type
        data['deviceIds'] = deviceId
        const resp = await createActionItem(data, false)
        const waylineTemplateId = resp.data.id
        msgApi.success(t('api.success.msg'))
        if (backUrl) {
          let to = backUrl.includes('?') ? backUrl : `${backUrl}?`
          if (waylineTemplateId) {
            to += `waylineTemplateId=${waylineTemplateId}`
          }
          if (taskId) {
            to += `&taskId=${taskId}`
          }
          history.replaceState(null, '', to)
        } else {
          navigate(-1)
        }
      } catch (e) {
        if (isLiqunCommonError(e)) {
          // 该设备有正在执行的任务
          if (
            Array.isArray(e.data?.actionItemIdList) &&
            e.data.actionItemIdList.length
          ) {
            setRunningActionPayload({
              actionItem: e.data.actionItemIdList[0],
              message: e.message,
            })
          }
          msgApi.error(
            `${t('wayline.executeTask.error.msg')}${
              e.message ? ` ${e.message}` : ''
            }`,
          )
          return
        }
      } finally {
        setLoading(0)
      }
    }

    const queryClient = useQueryClient()
    const { data: deviceData } = useQuery(
      {
        queryKey: ['deviceList', deviceType],
        queryFn: () =>
          getAllDeviceListV3({
            type: deviceType,
            isPage: false,
          }),
        select: (d) => d.data.rows,
      },
      queryClient,
    )

    const deviceOptions = useMemo(
      () =>
        deviceData?.map<DefaultOptionType>((e) => ({
          label: e.deviceName,
          value: e.deviceId,
        })) ?? [],
      [deviceData],
    )

    const actionTypeOptions = useDictOptions(DictEnum.ACTION_TYPE)
    const formItems = useMemo(
      () =>
        [
          {
            label: t('wayline.executeTask.type.title'),
            name: 'type',
            type: 'select',
            options: actionTypeOptions,
            rules: [
              {
                required: true,
                message: t('wayline.executeTask.type.required_msg'),
              },
            ],
          },
          {
            label: t('wayline.executeTask.device.title'),
            name: 'deviceId',
            type: 'select',
            options: deviceOptions,
            rules: [
              {
                required: true,
                message: t('wayline.executeTask.device.required_msg'),
              },
            ],
            otherProps: {
              mode: allowMultipleDevice ? 'multiple' : undefined,
            },
          },
        ] as XFormItem[],

      [i18n.language, actionTypeOptions, allowMultipleDevice, deviceOptions],
    )

    // 停止任务
    const handleStopActionItem = async () => {
      if (runningActionPayload) {
        await endActionItem(runningActionPayload.actionItem)
        msgApi.success(t('wayline.executeTask.success.stopTask.msg'))
        setRunningActionPayload(null)
      }
    }

    return (
      <div className="m-3 flex gap-5 px-3">
        <Button
          className="flex-1"
          loading={loading === 1}
          disabled={loading === 2 || disabled}
          onClick={handleSave}
        >
          {t('wayline.saveTask.title')}
        </Button>
        {!actionItemId && (
          <Button
            className="flex-1"
            loading={loading === 2}
            disabled={loading === 1 || disabled}
            type="primary"
            onClick={handleExecute}
          >
            {t('wayline.executeTask.title')}
          </Button>
        )}
        {executeOpen && (
          <FormModal
            title={t('wayline.executeTask.title')}
            open={executeOpen}
            items={formItems}
            onClose={() => setExecuteOpen(false)}
            onConfirm={(values) => {
              let deviceId = values.deviceId
              if (Array.isArray(deviceId)) {
                deviceId = deviceId.join(',')
              }
              handleExecuteConfirm(deviceId, values.type)
            }}
          />
        )}
        {runningActionPayload && (
          <XModal
            title={t('common.executeError')}
            width={400}
            centered
            open={!!runningActionPayload}
            noPadding
            onClose={() => setRunningActionPayload(null)}
            onConfirm={handleStopActionItem}
          >
            <p className="m-3">{runningActionPayload.message}</p>
            <p className="m-3">
              {t('wayline.executeTask.question.stopTask.msg')}
            </p>
          </XModal>
        )}
      </div>
    )
  },
)

BottomOperator.displayName = 'BottomOperator'

export default BottomOperator
