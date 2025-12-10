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
      refetchInterval: globalConfig.useFlightReporting ? 5000 : false,
    },
    queryClient,
  )

  const isCanFly = globalConfig.useFlightReporting
    ? data?.isCanFly ?? true
    : true
  const reason = globalConfig.useFlightReporting ? data?.reason : ''
  const flightAltitudeLimit = globalConfig.useFlightReporting
    ? data?.flightAltitude
    : undefined
  const returnAltitudeLimit = globalConfig.useFlightReporting
    ? data?.returnAltitude
    : undefined

  return {
    data,
    isCanFly,
    reason,
    flightAltitudeLimit,
    returnAltitudeLimit,
    ...rest,
  }
}

export default useFlightReporting
