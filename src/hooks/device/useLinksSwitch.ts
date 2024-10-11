import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getDeviceLinks, setDeviceLink } from '@/service/modules/device'

/** 处理双联路切换 */
export const useLinksSwitch = (productKey: string, deviceId: string) => {
  const queryClient = useQueryClient()

  const { data: links } = useQuery(
    {
      queryKey: ['getDeviceLinks', { productKey, deviceId }],
      queryFn: async () =>
        getDeviceLinks({
          productKey,
          deviceId,
        }),
      enabled: !!productKey && !!deviceId,
      select: (d) => d.data.links,
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
