import XModal from '@/components/XModal'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'

const ReturnHomeConfirm: FC = memo(() => {
  const { t } = useTranslation()

  const displayMode = useUavControlRoomStore((s) => s.state?.displayMode)

  const [open, setOpen] = useState(false)
  const lastReturnModeRef = useRef<string>()

  useEffect(() => {
    const hasReturnHint = displayMode?.includes?.('返航')

    if (hasReturnHint) {
      if (displayMode !== lastReturnModeRef.current) {
        setOpen(true)
        lastReturnModeRef.current = displayMode
      }
      return
    }

    setOpen(false)
    lastReturnModeRef.current = undefined
  }, [displayMode])

  return (
    <XModal
      noPadding
      centered
      open={open}
      title={t('controlRoom.uav.returnHomeConfirm.title')}
      onClose={() => setOpen(false)}
      onConfirm={() => setOpen(false)}
    >
      <div className="p-4 text-base leading-6">
        {t('controlRoom.uav.returnHomeConfirm.content')}
      </div>
    </XModal>
  )
})

ReturnHomeConfirm.displayName = 'ReturnHomeConfirm'

export default ReturnHomeConfirm
