import IconEdit from '@/assets/icons/jsx/IconEdit'
import IconButton from '@/components/ui/button/IconButton'
import XModal from '@/components/XModal'
import useActionDetail from '../../context'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import { getAIResultList, updAIResult } from '@/service/modules/action'
import AppSpin from '@/components/AppSpin'
import AppEmpty from '@/components/AppEmpty'
import { useDebounceFn, useSize, useUpdateEffect } from 'ahooks'
import { Checkbox, ConfigProvider, Form, Input, Select, Spin } from 'antd'
import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconKCCheck from '@/assets/icons/jsx/IconKCCheck'
import ImageContainBox from '@/components/ImageContainBox'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import { useDictOptions } from '@/store/useDict.store'
import { DictEnum } from '@/enum/dict'
import { getKCYPOrder, getXSKCYPOrder } from '@/service/modules/action/kcyp'
import { ProcessStatusEnum } from '@/service/modules/action/kcyp/enum'
import { useAppMsg } from '@/hooks/useAppMsg'
import { ActionEnum } from '@/constant/action/action_type'
import { lazy, Suspense } from 'react'
import { LoadingOutlined } from '@ant-design/icons'

type PropsType = {
  actionId: string
  actionType: string
}

const NormalVerificationModal = lazy(
  () => import('./shanghai/NormalVerificationModal'),
)
const XSVerificationModal = lazy(() => import('./xiaoshan/VerificationModal'))

/** AI 检测结果 */
const ResultItem: FC<{ data: API_ACTION.domain.AIResultRecord }> = memo(
  ({ data }) => {
    const [form] = Form.useForm()
    const queryClient = useQueryClient()
    const { run } = useDebounceFn(
      () => {
        queryClient.invalidateQueries({
          queryKey: ['action', String(data.actionId), 'aiResult'],
        })
      },
      { wait: 2_000 },
    )

    const handleFormBlur = useMemoizedFn(async () => {
      if (
        form.getFieldValue('plateNo') === data.plateNo &&
        form.getFieldValue('plateColor') === data.plateColor
      ) {
        return
      }
      await updAIResult({
        id: data.id as unknown as number,
        plateNo: form.getFieldValue('plateNo'),
        plateColor: form.getFieldValue('plateColor'),
      })
      run()
    })
    const carColorOptions = useDictOptions(DictEnum.KCYP_CAR_COLOR_TYPE)

    return (
      <div className="flex gap-2">
        <div className="w-[213px] h-[120px] relative border border-solid border-ground-5 box-content bg-ground-1">
          <ImageContainBox src={`/storage${data.image || data.sourceImage}`}>
            {data.leftTopX && data.leftTopY && (
              <div
                className="absolute border border-solid border-red-400"
                style={{
                  left: `${(data.leftTopX / data.sourceFrameWidth) * 100}%`,
                  top: `${(data.leftTopY / data.sourceFrameHeight) * 100}%`,
                  right: `${
                    100 -
                    ((data.leftTopX + data.bboxWidth) / data.sourceFrameWidth) *
                      100
                  }%`,
                  bottom: `${
                    100 -
                    ((data.leftTopY + data.bboxHeight) /
                      data.sourceFrameHeight) *
                      100
                  }%`,
                }}
              />
            )}
          </ImageContainBox>
          <div className="absolute left-2 top-2">
            <Checkbox value={data.id} />
          </div>
        </div>
        <div>
          <Form
            form={form}
            initialValues={{
              plateNo: data.plateNo,
              plateColor: data.plateColor,
            }}
            onBlur={handleFormBlur}
          >
            <ul className="flex flex-col justify-between text-fore h-[120px]">
              <li className="flex gap-1 whitespace-nowrap">
                <span className="text-white">车牌:</span>
                <Form.Item name="plateNo" noStyle>
                  <Input size="small" className="w-full" />
                </Form.Item>
              </li>
              <li className="flex gap-1 whitespace-nowrap">
                <span className="text-white">颜色:</span>
                <Form.Item name="plateColor" noStyle>
                  <Select
                    size="small"
                    className="w-full"
                    options={carColorOptions}
                  />
                </Form.Item>
              </li>
              <li className="flex gap-1 whitespace-nowrap">
                <span className="text-white">时间:</span>
                <span>{dayjs(data.resultTime).format('MM/DD HH:mm:ss')}</span>
              </li>
              <li className="flex gap-1 whitespace-nowrap">
                <span className="text-white">位置:</span>
                <span>
                  {data.longitude.toFixed(5)}, {data.latitude.toFixed(5)}
                </span>
              </li>
              <li className="flex gap-1">
                <span className="text-white">来源:</span>
                <span>{data.source}</span>
              </li>
            </ul>
          </Form>
        </div>
      </div>
    )
  },
)

/** 快处易赔选择 对话框 */
const KCYPModal: FC<PropsType> = memo(({ actionId, actionType }) => {
  const orderKey =
    actionType === ActionEnum.KCYP ? 'getKYCPOrder' : 'getXSKCYPOrder'
  const [open, setOpen] = useState(false)
  const msgApi = useAppMsg()

  const queryClient = useQueryClient()
  const actionDetail = useActionDetail()

  const refreshTemporary = useGlobalWsStore((s) => s.refreshTemporary)

  const { data, isLoading, isRefetching, refetch } = useQuery(
    {
      queryKey: ['action', actionId, 'aiResult'],
      queryFn: () =>
        getAIResultList({
          actionId,
          actionRecordId: actionDetail?.actionRecordId,
        }),
      select: (data) => data?.data.rows,
      staleTime: 1000 * 60 * 2,
    },
    queryClient,
  )

  useUpdateEffect(() => {
    refetch()
  }, [refreshTemporary])

  const size = useSize(document.body)
  const isBigWindow = useMemo(() => (size?.width ?? 0) >= 980, [size?.width])

  const [checkIds, setCheckIds] = useState<string[]>([])

  const handleCheckAllChange = useMemoizedFn((e: CheckboxChangeEvent) => {
    setCheckIds(e.target.checked ? data?.map((e) => e.id) ?? [] : [])
  })

  const { data: orderData, isLoading: orderLoading } = useQuery(
    {
      queryKey: [orderKey, actionId],
      queryFn: () => {
        if (actionType === ActionEnum.KCYP) {
          return getKCYPOrder({ caseId: actionId })
        } else if (actionType === ActionEnum.KCYPXS) {
          return getXSKCYPOrder({ caseId: actionId })
        }
        return Promise.reject('Unknown action type')
      },
      enabled: !!actionId,
      select: (d) => d.data,
      staleTime: 1000 * 60 * 2,
    },
    queryClient,
  )

  const [shareOpen, setShareOpen] = useState(false)
  const handleVerificationClick = useMemoizedFn(() => {
    if (orderData?.processStatus !== ProcessStatusEnum.INIT) {
      msgApi.info('当前结果已提交，请耐心等待结果！')
      return
    }
    if (checkIds.length !== 3) {
      msgApi.warning('必须选择 3 个结果')
      return
    }
    setShareOpen(true)
  })

  if (isLoading || !data || !actionDetail || !orderData || orderLoading) {
    return <AppSpin />
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <IconButton onClick={() => setOpen(true)}>
        <IconEdit />
      </IconButton>
      {!isLoading && data && actionDetail && orderData && !orderLoading && (
        <>
          <XModal
            width={isBigWindow ? '924px' : '480px'}
            title="检测结果"
            centered
            open={open}
            footer={false}
            noPadding
            onClose={() => setOpen(false)}
          >
            <Spin spinning={isRefetching}>
              <div className="p-3">
                <div className="py-3 bg-ground-3 rounded">
                  <p className="px-3 flex gap-3">
                    <Checkbox
                      indeterminate={
                        checkIds.length > 0 && checkIds.length < data.length
                      }
                      checked={checkIds.length === data.length}
                      onChange={handleCheckAllChange}
                    >
                      全选
                    </Checkbox>

                    <Suspense fallback={<LoadingOutlined />}>
                      <IconButton
                        toolTipProps={{ title: '校验' }}
                        onClick={handleVerificationClick}
                      >
                        <IconKCCheck />
                      </IconButton>
                      {actionType === ActionEnum.KCYP ? (
                        <NormalVerificationModal
                          open={shareOpen}
                          orderData={orderData}
                          aiResultData={data}
                          checkResultIds={checkIds}
                          onClose={() => setShareOpen(false)}
                        />
                      ) : (
                        <XSVerificationModal
                          open={shareOpen}
                          orderData={orderData}
                          aiResultData={data}
                          checkResultIds={checkIds}
                          onClose={() => setShareOpen(false)}
                        />
                      )}
                    </Suspense>

                    <IconButton
                      toolTipProps={{ title: '删除' }}
                      disabled={checkIds.length === 0}
                    >
                      <IconDelete />
                    </IconButton>
                  </p>
                  <ConfigProvider
                    theme={{
                      components: {
                        Checkbox: {
                          colorBgContainer: '#27303b',
                          colorBorder: '#626b74',
                        },
                      },
                    }}
                  >
                    {data.length === 0 ? (
                      <AppEmpty />
                    ) : (
                      <Checkbox.Group value={checkIds} onChange={setCheckIds}>
                        <ul className="px-3 w-full pt-3 flex justify-between flex-wrap gap-y-3 max-h-[408px] overflow-y-auto overflow-x-hidden">
                          {data.map((e) => (
                            <li key={e.id}>
                              <ResultItem data={e} />
                            </li>
                          ))}
                        </ul>
                      </Checkbox.Group>
                    )}
                  </ConfigProvider>
                </div>
              </div>
            </Spin>
          </XModal>
        </>
      )}
    </div>
  )
})

KCYPModal.displayName = 'KCYPNormalModal'

export default KCYPModal
