import AppEmpty from '@/components/AppEmpty'
import AppSpin from '@/components/AppSpin'
import { getActionLogList } from '@/service/modules/action'
import { Timeline } from 'antd'
import dayjs from 'dayjs'
import { memo, type FC } from 'react'
import styles from './ActionLogList.module.less'
import { timeOnly } from '@/constant/time-fmt'
import OverflowText from '@/components/ui/OverflowText'

type PropsType = {
  actionId: number
}

const ActionLogList: FC<PropsType> = memo(({ actionId }) => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    {
      queryKey: ['action', actionId, 'log'],
      queryFn: () => getActionLogList({ actionId }),
      select: (data) => data?.data?.rows,
    },
    queryClient,
  )

  if (isLoading || !data) {
    return <AppSpin />
  }

  if (data.length === 0) {
    return <AppEmpty />
  }

  return (
    <div className={styles.actionLog}>
      <Timeline
        items={data?.map((item: any) => {
          return {
            children: (
              <p className={styles.logItem}>
                <OverflowText className="flex-1 truncate">
                  {item.log}
                </OverflowText>
                <span className={styles.logTime}>
                  {dayjs(item.logTime).format(timeOnly)}
                </span>
              </p>
            ),
          }
        })}
      />
    </div>
  )
})

ActionLogList.displayName = 'ActionLogList'

export default ActionLogList
