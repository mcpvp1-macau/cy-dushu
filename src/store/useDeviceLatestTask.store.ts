import { getLatestTask } from '@/service/modules/airline'
import { create } from 'zustand'
import useGlobalWsStore from './useGlobalWebSocket.store'
import { useUpdateEffect } from 'ahooks'

type StateType = {
  /** 使用之前需要保证对应设备的最新任务是被监听的 */
  latestTask: Record<string, Awaited<ReturnType<typeof getLatestTask>>['data']>
}

type ActionsType = {
  /** 更新某一设备最新任务 */
  updateDeviceLatestTask: (
    deviceId: string,
    task: StateType['latestTask'][string],
  ) => void
}

const useDeviceLatestTaskStore = create<StateType & ActionsType>()((set) => ({
  latestTask: {},
  updateDeviceLatestTask: (deviceId, task) =>
    set((state) => ({
      latestTask: {
        ...state.latestTask,
        [deviceId]: task,
      },
    })),
}))

/** 监听某个设备最新任务并即时更新 */
export const useListenDeviceLatestTask = (deviceId: string) => {
  const actionItem = useGlobalWsStore((s) => s.actionItemStatus[deviceId])

  const queryClient = useQueryClient()
  const { data: taskData } = useQuery(
    {
      queryKey: ['getLatestTask', deviceId],
      queryFn: () => getLatestTask(deviceId),
      enabled: !!deviceId,
      select: (d) => d.data,
    },
    queryClient,
  )

  useUpdateEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ['getLatestTask', deviceId],
    })
  }, [actionItem?.status])

  useEffect(() => {
    if (!taskData) {
      return
    }
    useDeviceLatestTaskStore
      .getState()
      .updateDeviceLatestTask(deviceId, taskData)
  }, [taskData])
}

export default useDeviceLatestTaskStore
