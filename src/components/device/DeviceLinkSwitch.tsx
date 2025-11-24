import { useLinksSwitch } from '@/hooks/device/useLinksSwitch'
import IconButtonWithDropDown from '../ui/button/IconButtonWithDropDown'

type PropsType = {
  productKey: string
  deviceId: string
  className?: string
  onLinksChange?: (links: API_DEVICE.domain.DeviceLink[]) => void
}

/** 设备双链路切换 */
const DeviceLinkSwitch: FC<PropsType> = memo(
  ({ productKey, deviceId, className, onLinksChange }) => {
    const { t } = useTranslation()

    const { links, currentLink, handleLinkChange } = useLinksSwitch(
      productKey,
      deviceId,
      onLinksChange,
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
        tippyProps={{ content: t('device.linkSwitch.title') }}
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
