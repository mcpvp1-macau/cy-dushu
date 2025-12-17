import IconEdit from '@/assets/icons/jsx/IconEdit'
import IconButton from '@/components/ui/button/IconButton'
import XModal from '@/components/XModal'
import useActionDetail from '../../../context'
import { delAIResult } from '@/service/modules/action'
import AppEmpty from '@/components/AppEmpty'
import { useSize } from 'ahooks'
import { Checkbox, Spin } from 'antd'
import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconKCCheck from '@/assets/icons/jsx/IconKCCheck'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import { checkCarNo, getXSKCYPOrder } from '@/service/modules/action/kcyp'
import { ProcessStatusEnum } from '@/service/modules/action/kcyp/enum'
import { useAppMsg } from '@/hooks/useAppMsg'
import { LoadingOutlined } from '@ant-design/icons'
import AIResultItem from '../AIResultItem'
import IconAsyncButton from '@/components/ui/button/IconButton/IconAsyncButton'
import { uniqWith } from 'lodash'
import { useAIResult } from '../../AIResult'
import KCYPXSVerificationModal from './VerificationModal'

type PropsType = {
  actionId: string
  actionType: string
  detail?: API_ACTION.domain.ActionDetail
  isBacktracking?: boolean
}

/** 萧山 快处易赔选择 对话框 */
const XSKCYPModal: FC<PropsType> = memo(({ actionId, actionType }) => {
  const [open, setOpen] = useState(false)
  const msgApi = useAppMsg()

  const queryClient = useQueryClient()
  const actionDetail = useActionDetail()

  const { data, isLoading, isRefetching, refetch } = useAIResult(
    actionId,
    actionDetail?.actionRecordId,
  )

  const checkNeeds = useMemo(() => {
    return uniqWith(
      data?.filter((e) => !!e.plateNo && !!e.plateType && !!e.plateColor) ?? [],
      (a, b) => a.plateNo === b.plateNo,
    )
  }, [data])

  // 初始化校验车牌
  const { data: carNoCheckResults } = useQuery(
    {
      queryKey: ['checkCarNo', actionId],
      queryFn: () => {
        return checkCarNo(
          checkNeeds.map((e) => ({
            carNo: e.plateNo,
            carType: e.plateType,
            carColor: e.plateColor,
          })),
        )
      },
      enabled: !!checkNeeds.length,
      select: (d) => d.data,
    },
    queryClient,
  )

  const carNoCheckMap = useMemo(() => {
    const result = {}
    carNoCheckResults?.carNos?.forEach((e) => {
      result[e.carNo!] = {
        message: e.message,
        success: e.success,
      }
    })
    return result
  }, [carNoCheckResults])

  const size = useSize(document.body)
  const isBigWindow = useMemo(() => (size?.width ?? 0) >= 980, [size?.width])

  const [checkIds, setCheckIds] = useState<string[]>([])

  const handleCheckAllChange = useMemoizedFn((e: CheckboxChangeEvent) => {
    setCheckIds(e.target.checked ? data?.map((e) => e.id) ?? [] : [])
  })

  // 获取工单信息
  const { data: orderData, isLoading: orderLoading } = useQuery(
    {
      queryKey: ['getXSKCYPOrder', actionId],
      queryFn: () => getXSKCYPOrder({ caseId: actionId }),
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

                      <IconButton
                        tippyProps={{ content: '校验' }}
                        onClick={handleVerificationClick}
                      >
                        <IconKCCheck />
                      </IconButton>
                      {shareOpen && (
                        <KCYPXSVerificationModal
                          open={shareOpen}
                          orderData={orderData}
                          aiResultData={data}
                          checkResultIds={checkIds}
                          onClose={() => setShareOpen(false)}
                        />
                      )}
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
                  </div>
                  {data.length === 0 ? (
                    <AppEmpty />
                  ) : (
                    <Checkbox.Group value={checkIds} onChange={setCheckIds}>
                      <ul className="px-3 w-full pt-3 flex justify-between flex-wrap gap-y-3 max-h-[408px] overflow-y-auto overflow-x-hidden">
                        {data.map((e) => (
                          <li key={e.id} className="w-[430px]">
                            <AIResultItem
                              data={e}
                              actionType={actionType}
                              carNoCheckMap={carNoCheckMap}
                            />
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

XSKCYPModal.displayName = 'KCYPNormalModal'

export default XSKCYPModal
