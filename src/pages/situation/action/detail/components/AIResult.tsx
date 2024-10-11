import AppEmpty from '@/components/AppEmpty'
import AppSpin from '@/components/AppSpin'
import { getAIResultList } from '@/service/modules/action'
import { memo, type FC } from 'react'
import useActionDetail from '../context'
import AiResultItem from './AIResultItem'
import { Spin } from 'antd'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import { useUpdateEffect } from 'ahooks'

type PropsType = {
  actionId: string
}

const AIResult: FC<PropsType> = memo(({ actionId }) => {
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

  if (isLoading || !data || !actionDetail) {
    return <AppSpin />
  }

  if (data.length === 0) {
    return <AppEmpty />
  }

  return (
    <Spin spinning={isRefetching}>
      <ul className="p-3 flex flex-col gap-3">
        {data.map((e) => (
          <li key={e.id}>
            <AiResultItem data={e} />
          </li>
        ))}
      </ul>
    </Spin>
  )
})

AIResult.displayName = 'AIResult'

export default AIResult
