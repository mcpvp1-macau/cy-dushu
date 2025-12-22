import XModal from '@/components/XModal'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { WarningOutlined } from '@ant-design/icons'
import { Button } from 'antd'

const ReturnHomeConfirm: FC = memo(() => {
  const { t } = useTranslation()

  const displayMode = useUavControlRoomStore((s) => s.state?.displayMode)

  const [open, setOpen] = useState(false)

  const hasReturnHint = useMemo(
    () => displayMode?.includes?.('返航'),
    [displayMode],
  )

  useEffect(() => {
    if (hasReturnHint) {
      setOpen(true)
    }
  }, [hasReturnHint])

  return (
    <XModal
      noPadding
      centered
      open={open}
      title={t('controlRoom.uav.returnHomeConfirm.title')}
      footer={false}
      width={300}
      mask
      noClose
      onClose={() => setOpen(false)}
      onConfirm={() => setOpen(false)}
    >
      <div className="p-3 flex flex-col items-center gap-2 text-center">
        <WarningOutlined className="text-yellow-400 text-3xl animate-pulse" />
        {t('controlRoom.uav.returnHomeConfirm.content')}
        <Button onClick={() => setOpen(false)}>{t('common.accept')}</Button>
      </div>
    </XModal>
  )
})

ReturnHomeConfirm.displayName = 'ReturnHomeConfirm'

export default ReturnHomeConfirm
