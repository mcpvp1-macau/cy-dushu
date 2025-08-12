import IconEdit from '@/assets/icons/jsx/IconEdit'
import IconButton from '@/components/ui/button/IconButton'
import XModal from '@/components/XModal'
import useActionDetail from '../../context'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import { delAIResult, getAIResultList } from '@/service/modules/action'
import AppSpin from '@/components/AppSpin'
import AppEmpty from '@/components/AppEmpty'
import { useDebounceFn, useSize, useUpdateEffect } from 'ahooks'
import { Checkbox, ConfigProvider, message, Spin } from 'antd'
import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconKCCheck from '@/assets/icons/jsx/IconKCCheck'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import {
  checkCarNo,
  getKCYPOrder,
  getXSKCYPOrder,
  saveKCYPOrder,
} from '@/service/modules/action/kcyp'
import { ProcessStatusEnum } from '@/service/modules/action/kcyp/enum'
import { useAppMsg } from '@/hooks/useAppMsg'
import { ActionEnum } from '@/constant/action/action_type'
import { lazy, Suspense } from 'react'
import { LoadingOutlined, SyncOutlined } from '@ant-design/icons'
import AIResultItem from './AIResultItem'
import { shouldJson } from '@/utils/json'
import IconAsyncButton from '@/components/ui/button/IconButton/IconAsyncButton'
import { uniqWith } from 'lodash'

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

  useUpdateEffect(() => {
    refetch()
  }, [refreshTemporary])

  const size = useSize(document.body)
  const isBigWindow = useMemo(() => (size?.width ?? 0) >= 980, [size?.width])

  const [checkIds, _setCheckIds] = useState<string[]>([])

  const setCheckIds = useMemoizedFn((ids: string[]) => {
    setSaveState(0)
    _setCheckIds(ids)
    save()
  })

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

  const [saveState, setSaveState] = useState(-1) // 0 未保存 1 保存中 2 保存成功
  const saveMutation = useMutation({
    mutationFn: saveKCYPOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [orderKey, actionId],
      })
      setSaveState(2)
    },
  })

  const { run: save } = useDebounceFn(
    async () => {
      setSaveState(1)
      saveMutation.mutate({
        ...orderData,
        extra: JSON.stringify({
          pictures: checkIds.map((e) => ({
            id: e,
          })),
        }),
      })
    },
    { wait: 3_000, trailing: true },
  )

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
                          toolTipProps={{ title: '校验' }}
                          onClick={handleVerificationClick}
                        >
                          <IconKCCheck />
                        </IconButton>
                        {shareOpen &&
                          (actionType === ActionEnum.KCYP ? (
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
                          ))}
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
                    {saveState === 0 ? (
                      <p className="text-orange-600 items-center flex gap-1">
                        <SyncOutlined />
                        等待暂存
                      </p>
                    ) : saveState === 1 ? (
                      <p className="text-blue-600  items-center flex gap-1">
                        <SyncOutlined spin /> 暂存中
                      </p>
                    ) : saveState === 2 ? (
                      <p className="text-green-600">暂存成功</p>
                    ) : null}
                  </div>
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
