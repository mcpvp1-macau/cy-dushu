import IconEdit from '@/assets/icons/jsx/IconEdit'
import IconButton from '@/components/ui/button/IconButton'
import XModal from '@/components/XModal'
import useActionDetail from '../../context'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import { delAIResult, getAIResultList } from '@/service/modules/action'
import AppSpin from '@/components/AppSpin'
import AppEmpty from '@/components/AppEmpty'
import { useSize, useUpdateEffect } from 'ahooks'
import { Checkbox, ConfigProvider, Spin } from 'antd'
import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconKCCheck from '@/assets/icons/jsx/IconKCCheck'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import { getKCYPOrder, getXSKCYPOrder } from '@/service/modules/action/kcyp'
import { ProcessStatusEnum } from '@/service/modules/action/kcyp/enum'
import { useAppMsg } from '@/hooks/useAppMsg'
import { ActionEnum } from '@/constant/action/action_type'
import { lazy, Suspense } from 'react'
import { LoadingOutlined } from '@ant-design/icons'
import AIResultItem from './AIResultItem'
import { shouldJson } from '@/utils/json'
import IconAsyncButton from '@/components/ui/button/IconButton/IconAsyncButton'

type PropsType = {
  actionId: string
  actionType: string
  detail?: API_ACTION.domain.ActionDetail
  isBacktracking?: boolean
}

const NormalVerificationModal = lazy(
  () => import('./shanghai/NormalVerificationModal'),
)
const XSVerificationModal = lazy(() => import('./xiaoshan/VerificationModal'))

/** 快处易赔选择 对话框 */
const KCYPModal: FC<PropsType> = memo(({ actionId, actionType }) => {
  const orderKey =
    actionType === ActionEnum.KCYP ? 'getKCYPOrder' : 'getXSKCYPOrder'
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

  // 获取工单信息
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

  // 选择暂存工单中已选择图片
  useEffect(() => {
    const pictures = shouldJson(orderData?.extra)?.pictures
    if (!pictures) {
      return
    }
    if (pictures.length > 0) {
      const idSet = new Set(data?.map((e) => e.id) ?? [])
      setCheckIds(
        pictures
          .filter((e: { id: string }) => idSet.has(e.id))
          .map((e: { id: string }) => e.id),
      )
    }
  }, [orderData])

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
                          actionId={actionId}
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

                    <IconAsyncButton
                      toolTipProps={{ title: '删除' }}
                      disabled={checkIds.length === 0}
                      onClick={async () => {
                        await delAIResult(actionId, checkIds)
                        await refetch()
                        setCheckIds([])
                      }}
                    >
                      <IconDelete />
                    </IconAsyncButton>
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
                            <li key={e.id} className="w-[430px]">
                              <AIResultItem data={e} actionType={actionType} />
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
