import TextButton from '@/components/ui/button/TextButton'
import { RightModeEnum } from '@/enum/right-mode'
import useRightMode from '@/store/layout/useRightMode.store'

interface DeviceSourceLinkProps {
  label: string
  deviceId?: string
  title?: string
}

const DeviceSourceLink: FC<DeviceSourceLinkProps> = memo(({ label, deviceId, title }) => {
  const navigate = useNavigate()
  const updateRightMode = useRightMode((s) => s.updateRightMode)
  const updateDetailId = useRightMode((s) => s.updateDetailId)

  const handleDeviceClick = useMemoizedFn(() => {
    if (!deviceId) return

    updateRightMode(RightModeEnum.DEVICE)
    updateDetailId(deviceId)
    navigate('/')
  })

  const containerClassName = 'mt-1 text-sm truncate'

  return (
    <div className={containerClassName} title={title ?? label}>
      来源: [
      <TextButton
        className="truncate align-middle"
        onClick={handleDeviceClick}
        disabled={!deviceId}
      >
        {label}
      </TextButton>
      ]
    </div>
  )
})

DeviceSourceLink.displayName = 'DeviceSourceLink'

export default DeviceSourceLink
