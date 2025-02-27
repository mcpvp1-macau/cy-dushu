import { useLinksSwitch } from '@/hooks/device/useLinksSwitch'
import { memo, type FC } from 'react'
import IconButtonWithDropDown from '../ui/button/IconButtonWithDropDown'

type PropsType = {
  productKey: string
  deviceId: string
  className?: string
}

/** 设备双链路切换 */
const DeviceLinkSwitch: FC<PropsType> = memo(
  ({ productKey, deviceId, className }) => {
    const { links, currentLink, handleLinkChange } = useLinksSwitch(
      productKey,
      deviceId,
    )

    const linkOptions = useMemo(() => {
      if (!links) {
        return []
      }
      return links.map((e) => ({
        key: e.linkId,
        label: e.name,
        value: e.linkId,
      }))
    }, [links])

    return (
      <IconButtonWithDropDown
        menu={{
          items: linkOptions,
          onClick: (e) => handleLinkChange(e.key),
        }}
        trigger={['click']}
      >
        <span className={className}>
          {links?.find((e) => e.linkId === currentLink)?.name}
        </span>
      </IconButtonWithDropDown>
    )
  },
)

DeviceLinkSwitch.displayName = 'DeviceLinkSwitch'

export default DeviceLinkSwitch
