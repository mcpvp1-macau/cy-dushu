import AppSpin from '@/components/AppSpin'
import { getZSKCYPOrder, saveZSKCYPOrder } from '@/service/modules/action/kcyp'
import { createFormItems } from './constant'
import XForm from '@/components/XForm'
import { useDictOptions } from '@/store/useDict.store'
import { Form } from 'antd'
import { DictEnum } from '@/enum/dict'
import dayjs from 'dayjs'
import { statusColorMap } from '../shanghai/normal.constant'
import useSaveOrderState from '../common/useSaveOrderState'

type PropsType = { actionId: string }

/** 舟山 快处易赔 基础面板 */
const KCYPZSPanel: FC<PropsType> = memo(({ actionId }) => {
  const queryClient = useQueryClient()
  const { t, i18n } = useTranslation()

  const { data, isLoading } = useQuery(
    {
      queryKey: ['getZSKCYPOrder', actionId],
      queryFn: () => getZSKCYPOrder({ caseId: actionId }),
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

  const carTypeOptions = useDictOptions(DictEnum.ZHOUSHAN_KCYP_CAR_TYPE)

  const formItems = useMemo(
    () =>
      createFormItems({
        t,
        carTypeOptions,
      }),
    [i18n.language, carTypeOptions],
  )

  const { save, stateLabel } = useSaveOrderState(() =>
    queryClient.invalidateQueries({
      queryKey: ['getZSKCYPOrder', actionId],
    }),
  )

  const handleValuesChange = useMemoizedFn((_, values: any) => {
    save(async () => {
      await form.validateFields()
      const { caseHapTime } = values
      const caseHapTimeFormat = dayjs(caseHapTime).valueOf()
      await saveZSKCYPOrder({
        ...data,
        ...values,
        caseId: values.caseId ?? actionId,
        caseHapTime: caseHapTimeFormat,
      })
    })
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
        {stateLabel}
      </div>
      <p className="flex gap-2 mt-1">
        <span className="text-white">
          {t('action.detail.kcyp.process_status.title')}:
        </span>
        <span style={{ color: statusColorMap[data.processStatus!]?.color }}>
          {data.processResult ||
            statusColorMap[data.processStatus!]?.label[i18n.language] ||
            '-'}
        </span>
      </p>
      <div className="kcform">
        <XForm
          form={form}
          disabled={data.processResult !== 0}
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

KCYPZSPanel.displayName = 'KCYPXSPanel'

export default KCYPZSPanel
