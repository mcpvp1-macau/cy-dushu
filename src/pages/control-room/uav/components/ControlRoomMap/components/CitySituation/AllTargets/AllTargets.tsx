import { dft } from '@/constant/time-fmt'
import {
  fetchTargetLayerGoalSub,
  getCitySituationAllTargets,
} from '@/service/modules/db-api/citySituation'
import { BillboardCollection, LabelCollection } from 'resium'
import UavTarget from './UavTarget'
import { uniqBy } from 'lodash'
import { useSearchParams } from 'react-router-dom'

type PropsType = {
  is930: boolean
}

const AllTargets: FC<PropsType> = memo(({ is930 }) => {
  const [params] = useSearchParams()
  const expireTime = parseInt(params.get('expireTime') || '60')

  const queryClient = useQueryClient()
  const { data } = useQuery(
    {
      queryKey: ['cityAllTargets'],
      queryFn: () =>
        is930
          ? fetchTargetLayerGoalSub({
              time: dayjs().format(dft),
              expireTime,
            })
          : getCitySituationAllTargets({
              type: ['无人机'],
              expireTime,
              time: dayjs().format(dft),
            }),
      select: (d) => d.data,
      refetchInterval: 1000,
    },
    queryClient,
  )

  if (!Array.isArray(data) || data.length === 0) {
    return null
  }

  return (
    <BillboardCollection>
      <LabelCollection>
        {uniqBy(data, 'id').map((e) => (
          <UavTarget data={e} key={e.id} />
        ))}
      </LabelCollection>
    </BillboardCollection>
  )
})

AllTargets.displayName = 'AllTargets'

export default AllTargets
