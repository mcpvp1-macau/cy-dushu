import useUserStore from '@/store/useUser.store'

/** 设备 /v3 连接地址 */
const useDeviceWsURL = (productKey: string, deviceId: string) => {
  const token = useUserStore((s) => s.token)
  const wsUrl = useMemo(() => {
    if (!productKey || !deviceId || !token) {
      return null
    }
    return `${globalConfig.globalWs}://${location.host}/v3/${productKey}/${deviceId}?token=${token}`
    // return `/proxyWsApi/otherWsService/${globalConfig.systemName}/controlServer/v3/${productKey}/${deviceId}?token=${token}`
  }, [productKey, deviceId, token])
  return wsUrl
}

export default useDeviceWsURL
