import AppEmpty from '@/components/AppEmpty'
import AppSpin from '@/components/AppSpin'
import { getActionLogList } from '@/service/modules/action'
import { Timeline, Tooltip } from 'antd'
import dayjs from 'dayjs'
import { memo, type FC } from 'react'
import styles from './ActionLogList.module.less'
import { timeOnly } from '@/constant/time-fmt'

type PropsType = {
  actionId: string
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
                <span className={clsx(`${item.taskLogLevel}`, styles.logInfo)}>
                  <Tooltip title={item.log}>{item.log}</Tooltip>
                </span>
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
