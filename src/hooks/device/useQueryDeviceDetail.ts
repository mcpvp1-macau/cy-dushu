import { getDeviceDetail } from '@/service/modules/device'

/** 查询设备详情 */
const useQueryDeviceDetail = (deviceId?: string) => {
  const queryClient = useQueryClient()
  return useQuery(
    {
      queryKey: ['deviceDetail', deviceId],
      queryFn: () => getDeviceDetail(deviceId!),
      enabled: !!deviceId,
      select: (d) => d.data,
    },
    queryClient,
  )
}

export default useQueryDeviceDetail
