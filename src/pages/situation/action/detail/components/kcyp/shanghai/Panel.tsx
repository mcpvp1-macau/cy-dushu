import AppSpin from '@/components/AppSpin'
import { getKCYPOrder, saveKCYPOrder } from '@/service/modules/action/kcyp'
import { createFormItems, statusColorMap } from './normal.constant'
import XForm from '@/components/XForm'
import { useDictOptions } from '@/store/useDict.store'
import { ProcessStatusEnum } from '@/service/modules/action/kcyp/enum'
import { useDebounceFn } from 'ahooks'
import { Form } from 'antd'
import { DictEnum } from '@/enum/dict'
import useWatch from '@/hooks/useWatch'
import dayjs from 'dayjs'

type PropsType = { actionId: string }

/** 快处易赔 基础面板 */
const KCYPNormalPanel: FC<PropsType> = memo(({ actionId }) => {
  const queryClient = useQueryClient()
  const { t, i18n } = useTranslation()

  const { data, isLoading } = useQuery(
    {
      queryKey: ['getKYCPOrder', actionId],
      queryFn: () => getKCYPOrder({ caseId: actionId }),
      enabled: !!actionId,
      select: (d) => d.data,
      staleTime: 1000 * 60 * 2,
    },
    queryClient,
  )
  const [form] = Form.useForm()

  useWatch(
    data,
    (newData) => {
      queueMicrotask(() => {
        if (!newData) {
          return
        }
        form.setFieldsValue({
          ...data,
          caseHapTime: dayjs(data?.caseHapTime),
          brokenPart: data?.brokenPart?.split(','),
          otherBrokenPart: data?.otherBrokenPart?.split(','),
        })
      })
    },
    true,
  )

  const cardTypeOptions = useDictOptions(DictEnum.KCYP_CARD_TYPE)
  const brokenPartTypeOptions = useDictOptions(DictEnum.KCYP_BROKEN_PART_TYPE)
  const firstSceneOptions = useDictOptions(DictEnum.KCYP_FIRSTSCENE)
  const accidentTypeOptions = useDictOptions(DictEnum.KCYP_ACCIDENT_TYPE)

  const formItems = useMemo(
    () =>
      createFormItems({
        t,
        cardTypeOptions,
        brokenPartTypeOptions,
        firstSceneOptions,
        accidentTypeOptions,
      }),
    [
      i18n.language,
      cardTypeOptions,
      brokenPartTypeOptions,
      firstSceneOptions,
      accidentTypeOptions,
    ],
  )

  const saveMutation = useMutation({
    mutationFn: saveKCYPOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getKYCPOrder', actionId],
      })
    },
  })

  const { run: save } = useDebounceFn(
    async (values: any) => {
      await form.validateFields()
      const { caseHapTime, brokenPart, otherBrokenPart } = values
      const caseHapTimeFormat = dayjs(caseHapTime).valueOf()
      saveMutation.mutate({
        ...data,
        ...values,
        brokenPart: brokenPart.join(','),
        otherBrokenPart: otherBrokenPart.join(','),
        caseHapTime: caseHapTimeFormat,
      })
    },
    { wait: 3_000, trailing: true },
  )

  const handleValuesChange = useMemoizedFn((_, values: any) => {
    save(values)
  })

  if (isLoading || !data) {
    return <AppSpin />
  }

  return (
    <div className="text-fore p-3">
      <p className="flex gap-2">
        <span className="text-white">
          {t('action.detail.kcyp.case_code.title')}:
        </span>
        <span>{data.caseId}</span>
      </p>
      <p className="flex gap-2 mt-1">
        <span className="text-white">
          {t('action.detail.kcyp.process_status.title')}:
        </span>
        <span style={{ color: statusColorMap[data.processStatus!]?.color }}>
          {statusColorMap[data.processStatus!]?.label[i18n.language] || '-'}
        </span>
      </p>
      <XForm
        form={form}
        disabled={data.processStatus !== ProcessStatusEnum.INIT}
        items={formItems}
        layout="vertical"
        colsProps={{ span: 12 }}
        rowsProps={{ gutter: 12 }}
        themeConfig={{
          verticalLabelPadding: 4,
          labelFontSize: 12,
          itemMarginBottom: 0,
        }}
        onValuesChange={handleValuesChange}
      />
    </div>
  )
})

KCYPNormalPanel.displayName = 'KCYPNormalPanel'

export default KCYPNormalPanel
