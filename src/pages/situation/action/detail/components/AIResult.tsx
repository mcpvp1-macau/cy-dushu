import AppEmpty from '@/components/AppEmpty'
import AppSpin from '@/components/AppSpin'
import { getAIResultList } from '@/service/modules/action'
import useActionDetail from '../context'
import AiResultItem from './AIResultItem'
import { Spin } from 'antd'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import { useUpdateEffect } from 'ahooks'
import { useDictOptions } from '@/store/useDict.store'
import { DictEnum } from '@/enum/dict'
import ImageContainBoxPreviewGroup from '@/components/ui/ImageContainBoxPreviewGroup'

type PropsType = {
  actionId: number
  isBacktracking?: boolean
  detail?: API_ACTION.domain.ActionDetail
}

export const useAIResult = (actionId: number, actionRecordId?: number) => {
  const queryClient = useQueryClient()
  const refreshTemporary = useGlobalWsStore((s) => s.refreshTemporary)
  const { data, isLoading, isRefetching, refetch } = useQuery(
    {
      queryKey: ['action', actionId, 'aiResult'],
      queryFn: () =>
        getAIResultList({
          actionId: String(actionId),
          actionRecordId: actionRecordId,
        }),
      select: (data) => data?.data.rows,
      staleTime: 1000 * 60 * 2,
    },
    queryClient,
  )

  useUpdateEffect(() => {
    refetch()
  }, [refreshTemporary])

  return { data, isLoading, isRefetching, refetch }
}

const AIResult: FC<PropsType> = memo(
  ({ actionId, isBacktracking = false, detail }) => {
    const d = useActionDetail()
    const actionDetail = isBacktracking ? detail : d

    const { data, isLoading, isRefetching } = useAIResult(
      actionId,
      actionDetail?.actionRecordId,
    )

    const colorType = useDictOptions(DictEnum.KCYP_CAR_COLOR_TYPE)
    const colorTypeXS = useDictOptions(DictEnum.XIAOSHAN_KCYP_CAR_COLOR_TYPE)

    const renderData = useMemo<API_ACTION.domain.AIResultRecord[]>(() => {
      if (!data) {
        return []
      }
      const map1 = new Map(colorType.map((e) => [e.value, e.label]))
      const map2 = new Map(colorTypeXS.map((e) => [e.value, e.label]))

      return data.map((e) => ({
        ...e,
        plateColor:
          map1.get(e.plateColor) ?? map2.get(e.plateColor) ?? e.plateColor,
      }))
    }, [data])

    if (isLoading || !data || !actionDetail) {
      return <AppSpin />
    }

    if (data.length === 0) {
      return <AppEmpty />
    }

    return (
      <Spin spinning={isRefetching}>
        <ul className="p-3 flex flex-col gap-3 max-h-[400px] overflow-y-auto">
          <ImageContainBoxPreviewGroup
            boxRender={(currentIndex) => {
              const data = renderData[currentIndex]
              return data.bboxWidth && data.bboxHeight ? (
                <div
                  className="absolute border border-solid border-red-400"
                  style={{
                    left: `${(data.leftTopX / data.sourceFrameWidth) * 100}%`,
                    top: `${(data.leftTopY / data.sourceFrameHeight) * 100}%`,
                    right: `${
                      100 -
                      ((data.leftTopX + data.bboxWidth) /
                        data.sourceFrameWidth) *
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
              ) : null
            }}
          >
            {renderData.map((e) => (
              <li key={e.id}>
                <AiResultItem data={e} />
              </li>
            ))}
          </ImageContainBoxPreviewGroup>
        </ul>
      </Spin>
    )
  },
)

AIResult.displayName = 'AIResult'

export default AIResult
