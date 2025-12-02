import { useQuery, useQueryClient } from '@tanstack/react-query'

import globalConfig from '@/global/config'
import { checkDeviceCanFly } from '@/service/modules/jinghang'

const useFlightReporting = (deviceId?: string) => {
  const queryClient = useQueryClient()

  const { data, ...rest } = useQuery(
    {
      queryKey: ['jinghang', 'deviceCanFly', deviceId],
      queryFn: () => checkDeviceCanFly({ deviceId: deviceId! }),
      select: (resp) => resp.data,
      enabled: !!deviceId && !!globalConfig.useFlightReporting,
    },
    queryClient,
  )

  const isCanFly = globalConfig.useFlightReporting ? data?.isCanFly ?? true : true
  const reason = globalConfig.useFlightReporting ? data?.reason : ''

  return { data, isCanFly, reason, ...rest }
}

export default useFlightReporting
