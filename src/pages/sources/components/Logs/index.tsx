import { FC, memo } from 'react'
import TextButton from '@/components/ui/button/TextButton'
import LogsModal from './LogsModal'

type PropsType = {
    deviceId: string
}

const Logs: FC<PropsType> = memo(({ deviceId }) => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <div>
      <TextButton onClick={() => setOpen(true)}>日志</TextButton>
      {open && <LogsModal deviceId={deviceId} open={open} onClose={() => setOpen(false)} />}
    </div>
  )
})

Logs.displayName = 'Logs'

export default Logs
