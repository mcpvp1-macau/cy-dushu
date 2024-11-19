import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import { DictEnum } from '@/enum/dict'
import { useAppMsg } from '@/hooks/useAppMsg'
import {
  createActionItem,
  updateActionItem,
} from '@/service/modules/action-item'
import { getAllDeviceListV3 } from '@/service/modules/device'
import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'
import { useDictOptions } from '@/store/useDict.store'
import { Button } from 'antd'
import { DefaultOptionType } from 'antd/es/select'
import { memo, type FC } from 'react'
import { useSearchParams } from 'react-router-dom'

export const createExecuteFormItems = (
  actionTypeOptions: DefaultOptionType[],
  deviceIdOptions: DefaultOptionType[],
) =>
  [
    {
      label: '类型',
      name: 'type',
      type: 'select',
      options: actionTypeOptions,
      rules: [{ required: true, message: '请选择类型' }],
    },
    {
      label: '设备',
      name: 'deviceId',
      type: 'select',
      options: deviceIdOptions,
      rules: [{ required: true, message: '请选择设备' }],
    },
  ] as XFormItem[]

type PropsType = {
  disabled?: boolean
}

/** 航线编辑底部按钮栏 */
const BottomOperator: FC<PropsType> = memo(({ disabled }) => {
  const msgApi = useAppMsg()

  const [searchParams] = useSearchParams()
  const actionId = searchParams.get('actionId')
  const modelName = searchParams.get('modelName')
  const actionItemId = searchParams.get('actionItemId')
  const deviceId = searchParams.get('deviceId')

  const invalidate = () => {
    const { airlineConfig, airpointsConfig } = useAirlineConfigStore.getState()
    if ((airpointsConfig?.length ?? 0) < 2) {
      msgApi.error('航点数量至少需要 2 个')
      return true
    }
    if (!airlineConfig.globalRTHHeight) {
      msgApi.error('请设置返航高度')
      return true
    }
    return false
  }

  const generateTaskData = () => {
    // 由于只有事件中才需要, 状态更新时不需要通知该组件 render, 所以不需要 hook useAirlineConfigStore
    const { airlineConfig, airpointsConfig, airlineTemplateInfo } =
      useAirlineConfigStore.getState()
    const getTaskName = () => airlineTemplateInfo.taskName || '航点任务'
    const data: Record<string, any> = {
      taskName: getTaskName(),
      templateId: airlineTemplateInfo.templateId,
      // deviceIds: deviceId,
      deviceType: 'UAV',
      // type: type,
      taskTemplateInfo: {
        taskBasic: JSON.stringify({
          ...airlineConfig,
          modelName: modelName ? atob(modelName) : undefined,
        }),
        defaultDeviceId: deviceId,
        parameters: {
          spaces: [
            {
              spaceId: 'MAP',
              spaceType: 'MAP',
              positions: airpointsConfig.map((e, i) => ({
                ...e,
                positionIndex: i,
              })),
            },
          ],
        },
      },
    }
    return data
  }

  const [loading, setLoading] = useState(0)
  const navigate = useNavigate()

  /** 保存任务 */
  const handleSave = async () => {
    if (invalidate()) {
      return
    }
    setLoading(1)
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
          await createActionItem(data)
        }
      } else {
        // 保存航线模板
        await createActionItem(data)
      }
      navigate(-1)
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
      await createActionItem(data)
      navigate(-1)
    } finally {
      setLoading(0)
    }
  }

  const queryClient = useQueryClient()
  const { data: deviceData } = useQuery(
    {
      queryKey: ['deviceList', 'uav'],
      queryFn: () =>
        getAllDeviceListV3({
          type: 'UAV',
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
    () => createExecuteFormItems(actionTypeOptions, deviceOptions),

    [actionTypeOptions, deviceOptions],
  )

  return (
    <div className="m-3 flex gap-5 px-3">
      <Button
        className="flex-1"
        loading={loading === 1}
        disabled={loading === 2 || disabled}
        onClick={handleSave}
      >
        保存任务
      </Button>
      {!actionItemId && (
        <Button
          className="flex-1"
          loading={loading === 2}
          disabled={loading === 1 || disabled}
          type="primary"
          onClick={handleExecute}
        >
          立即执行
        </Button>
      )}
      {executeOpen && (
        <FormModal
          title="立即执行"
          open={executeOpen}
          items={formItems}
          onClose={() => setExecuteOpen(false)}
          onConfirm={(values) =>
            handleExecuteConfirm(values.deviceId, values.type)
          }
        />
      )}
    </div>
  )
})

BottomOperator.displayName = 'BottomOperator'

export default BottomOperator
