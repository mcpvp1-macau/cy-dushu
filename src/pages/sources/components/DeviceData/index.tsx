import DataModal from './DataModal'
import TextButton from '@/components/ui/button/TextButton'

type PropsType = {
  deviceData: API_DEVICE.domain.DeviceListItem
}

const DeviceData: FC<PropsType> = memo(({ deviceData }) => {
  const [open, setOpen] = useState(false)
  const { deviceId } = deviceData
  const { t } = useTranslation()

  return (
    <>
      <TextButton onClick={() => setOpen(true)}>{t('common.data')}</TextButton>
      {open && (
        <DataModal
          open={open}
          deviceId={deviceId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
})

DeviceData.displayName = 'DeviceData'

export default DeviceData
