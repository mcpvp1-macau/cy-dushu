import IconEdit from '@/assets/icons/jsx/IconEdit'
import IconButton from '@/components/ui/button/IconButton'
import XModal from '@/components/XModal'
import { delAIResult } from '@/service/modules/action'
import AppEmpty from '@/components/AppEmpty'
import { useSize } from 'ahooks'
import { Checkbox, Spin } from 'antd'
import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconKCCheck from '@/assets/icons/jsx/IconKCCheck'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import { getZSKCYPOrder, saveZSKCYPOrder } from '@/service/modules/action/kcyp'
import { useAppMsg } from '@/hooks/useAppMsg'
import { Suspense } from 'react'
import { LoadingOutlined } from '@ant-design/icons'
import { shouldJson } from '@/utils/json'
import IconAsyncButton from '@/components/ui/button/IconButton/IconAsyncButton'
import AIResultItem from '../AIResultItem'
import useSaveOrderState from '../common/useSaveOrderState'
import useActionDetail from '../../../context'
import { useAIResult } from '../../AIResult'
import KCYPZSVerificationModal from './VerificationModal'

type PropsType = {
  actionId: string
  actionType: string
  detail?: API_ACTION.domain.ActionDetail
  isBacktracking?: boolean
}

/** 快处易赔选择 对话框 */
const ZSKCYPModal: FC<PropsType> = memo(({ actionId, actionType }) => {
  const [open, setOpen] = useState(false)
  const msgApi = useAppMsg()

  const queryClient = useQueryClient()
  const actionDetail = useActionDetail()

  const { data, isLoading, isRefetching, refetch } = useAIResult(
    actionId,
    actionDetail?.actionRecordId,
  )

  const size = useSize(document.body)
  const isBigWindow = useMemo(() => (size?.width ?? 0) >= 980, [size?.width])

  const [checkIds, _setCheckIds] = useState<string[]>([])

  const setCheckIds = useMemoizedFn((ids: string[]) => {
    _setCheckIds(ids)
    save(async () => {
      return saveZSKCYPOrder({
        ...orderData,
        extra: JSON.stringify({
          pictures: ids.map((e) => ({
            id: e,
          })),
        }),
      })
    })
  })

  const handleCheckAllChange = useMemoizedFn((e: CheckboxChangeEvent) => {
    setCheckIds(e.target.checked ? data?.map((e) => e.id) ?? [] : [])
  })

  // 获取工单信息
  const { data: orderData, isLoading: orderLoading } = useQuery(
    {
      queryKey: ['getZSKCYPOrder', actionId],
      queryFn: () => getZSKCYPOrder({ caseId: actionId }),
      enabled: !!actionId,
      select: (d) => d.data,
      staleTime: 1000 * 60 * 2,
    },
    queryClient,
  )

  // 选择暂存工单中已选择图片
  useEffect(() => {
    if (!data) {
      return
    }
    const pictures = shouldJson(orderData?.extra)?.pictures
    if (!pictures) {
      return
    }
    if (pictures.length > 0) {
      const idSet = new Set(data.map((e) => e.id) ?? [])
      _setCheckIds(
        pictures
          .filter((e: { id: string }) => idSet.has(e.id))
          .map((e: { id: string }) => e.id),
      )
    }
  }, [orderData, data])

  const [shareOpen, setShareOpen] = useState(false)
  const handleVerificationClick = useMemoizedFn(() => {
    if (checkIds.length !== 4) {
      msgApi.warning('必须选择 4 个结果')
      return
    }
    setShareOpen(true)
  })

  const { save, stateLabel } = useSaveOrderState(() =>
    queryClient.invalidateQueries({
      queryKey: ['getZSKCYPOrder', actionId],
    }),
  )

  if (isLoading || !data || !actionDetail || !orderData || orderLoading) {
    return <LoadingOutlined />
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
                  <div className="flex justify-between px-3">
                    <p className="flex gap-3">
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
                          tippyProps={{ content: '校验' }}
                          onClick={handleVerificationClick}
                        >
                          <IconKCCheck />
                        </IconButton>
                        {shareOpen && (
                          <KCYPZSVerificationModal
                            open={shareOpen}
                            orderData={orderData}
                            aiResultData={data}
                            checkResultIds={checkIds}
                            onClose={() => setShareOpen(false)}
                          />
                        )}
                      </Suspense>

                      <IconAsyncButton
                        tippyProps={{ content: '删除' }}
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
                    {stateLabel}
                  </div>
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
                </div>
              </div>
            </Spin>
          </XModal>
        </>
      )}
    </div>
  )
})

ZSKCYPModal.displayName = 'ZSKCYPModal'

export default ZSKCYPModal
