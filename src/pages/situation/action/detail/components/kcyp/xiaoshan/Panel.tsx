import AppSpin from '@/components/AppSpin'
import { getXSKCYPOrder, saveXSKCYPOrder } from '@/service/modules/action/kcyp'
import { createFormItems } from './constant'
import XForm from '@/components/XForm'
import { useDictOptions } from '@/store/useDict.store'
import { ProcessStatusEnum } from '@/service/modules/action/kcyp/enum'
import { useDebounceFn } from 'ahooks'
import { Form } from 'antd'
import { DictEnum } from '@/enum/dict'
import dayjs from 'dayjs'
import { statusColorMap } from '../shanghai/normal.constant'
import { SyncOutlined } from '@ant-design/icons'

type PropsType = { actionId: string }

/** 萧山 快处易赔 基础面板 */
const KCYPXSPanel: FC<PropsType> = memo(({ actionId }) => {
  const queryClient = useQueryClient()
  const { t, i18n } = useTranslation()

  const { data, isLoading } = useQuery(
    {
      queryKey: ['getXSKCYPOrder', actionId],
      queryFn: () => getXSKCYPOrder({ caseId: actionId }),
      enabled: !!actionId,
      select: (d) => d.data,
      staleTime: 1000 * 60 * 2,
    },
    queryClient,
  )
  const [form] = Form.useForm()

  useEffect(() => {
    if (!data) {
      return
    }
    form.setFieldsValue({
      ...data,
      caseHapTime: dayjs(data?.caseHapTime),
    })
  }, [data])

  const cardTypeOptions = useDictOptions(DictEnum.XIAOSHAN_KCYP_CARD_TYPE)
  const carTypeOptions = useDictOptions(DictEnum.XIAOSHAN_KCYP_CAR_TYPE)

  const formItems = useMemo(
    () =>
      createFormItems({
        t,
        cardTypeOptions,
        carTypeOptions,
      }),
    [i18n.language, cardTypeOptions, carTypeOptions],
  )

  const saveMutation = useMutation({
    mutationFn: saveXSKCYPOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getXSKCYPOrder', actionId],
      })
      setSaveState(2) // 保存成功
    },
  })

  const { run: save } = useDebounceFn(
    async (values: any) => {
      await form.validateFields()
      const { caseHapTime } = values
      const caseHapTimeFormat = dayjs(caseHapTime).valueOf()
      setSaveState(1)
      saveMutation.mutate({
        ...data,
        ...values,
        caseHapTime: caseHapTimeFormat,
      })
    },
    { wait: 3_000, trailing: true },
  )

  const [saveState, setSaveState] = useState(-1) // 0 未保存 1 保存中 2 保存成功
  const handleValuesChange = useMemoizedFn((_, values: any) => {
    setSaveState(0)
    save(values)
  })

  if (isLoading || !data) {
    return <AppSpin />
  }

  return (
    <div className="text-fore p-3">
      <div className="flex items-center justify-between">
        <p className="flex gap-2">
          <span className="text-white">
            {t('action.detail.kcyp.case_code.title')}:
          </span>
          <span>{data.caseId}</span>
        </p>
        {saveState === 0 ? (
          <p className="text-orange-600 items-center flex gap-1">
            <SyncOutlined />
            等待暂存
          </p>
        ) : saveState === 1 ? (
          <p className="text-blue-600 items-center flex gap-1">
            <SyncOutlined spin /> 暂存中
          </p>
        ) : saveState === 2 ? (
          <p className="text-green-600">暂存成功</p>
        ) : null}
      </div>
      <p className="flex gap-2 mt-1">
        <span className="text-white">
          {t('action.detail.kcyp.process_status.title')}:
        </span>
        <span style={{ color: statusColorMap[data.processStatus!]?.color }}>
          {statusColorMap[data.processStatus!]?.label[i18n.language] || '-'}
        </span>
      </p>
      <div className="kcform">
        <XForm
          form={form}
          disabled={data.processStatus !== ProcessStatusEnum.INIT}
          items={formItems}
          layout="vertical"
          colsProps={{ span: 12 }}
          rowsProps={{ gutter: 12 }}
          themeKey="dushu-kcyp"
          themeConfig={{
            verticalLabelPadding: 4,
            labelFontSize: 12,
            itemMarginBottom: 0,
          }}
          onValuesChange={handleValuesChange}
        />
      </div>
    </div>
  )
})

KCYPXSPanel.displayName = 'KCYPXSPanel'

export default KCYPXSPanel
