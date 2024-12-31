import { Button } from 'antd'
import DataModal from './DataModal'

type PropsType = {
  deviceData: API_DEVICE.domain.DeviceListItem
}

const DeviceData: FC<PropsType> = memo(({ deviceData }) => {
  const [open, setOpen] = useState(false)
  const { deviceId } = deviceData
  const { t } = useTranslation()

  return (
    <>
      <Button size="small" type="link" onClick={() => setOpen(true)}>
        {t('common.data')}
      </Button>
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
