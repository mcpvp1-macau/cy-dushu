import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getDeviceLinks, setDeviceLink } from '@/service/modules/device'

/** 处理双联路切换 */
export const useLinksSwitch = (
  productKey: string,
  deviceId: string,
  onLinksChange?: (links: API_DEVICE.domain.DeviceLink[]) => void,
) => {
  const queryClient = useQueryClient()

  const { data: links } = useQuery(
    {
      queryKey: ['getDeviceLinks', { productKey, deviceId }],
      queryFn: async () => {
        const res = await getDeviceLinks({
          productKey,
          deviceId,
        })
        const data = res.data.links
        onLinksChange?.(data)
        return data
      },
      enabled: !!productKey && !!deviceId,
    },
    queryClient,
  )

  const currentLink = useMemo(
    () => links?.find((link) => link.active)?.linkId ?? 'auto',
    [links],
  )

  const handleLinkChange = async (linkId: string) => {
    await setDeviceLink({
      deviceId: deviceId,
      linkId: linkId,
      productKey: productKey,
    })
    queryClient.invalidateQueries({
      queryKey: ['getDeviceLinks', { productKey, deviceId }],
    })
    setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: ['getLiveQuality', 'rtp'],
        exact: false,
      })
    }, 1000)
  }

  return { links, currentLink, handleLinkChange }
}
