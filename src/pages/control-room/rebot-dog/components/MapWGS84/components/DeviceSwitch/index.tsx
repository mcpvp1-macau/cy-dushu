import FloatIconButton from '@/components/ui/button/FloatIconButton'
import DeviceIconRebotDog from '@/assets/icons/jsx/device/DeviceIconRebotDog'
import DeviceSelect from './DeviceSelect'

const DeviceSwitch: FC = memo(() => {
  const [open, setOpen] = useState(false)

  const handleToggle = useMemoizedFn(() => setOpen((prev) => !prev))
  const handleClose = useMemoizedFn(() => setOpen(false))

  return (
    <>
      <div className="absolute left-3 top-3 flex gap-3 z-10">
        <FloatIconButton active={open} onClick={handleToggle}>
          <DeviceIconRebotDog />
        </FloatIconButton>
      </div>
      {open && (
        <div className="absolute left-3 top-[52px] w-[350px] bg-ground-1/90 backdrop-blur h-[calc(100vh-172px)] overflow-hidden rounded border-ground-5 border flex flex-col z-10">
          <DeviceSelect onClose={handleClose} />
        </div>
      )}
    </>
  )
})

DeviceSwitch.displayName = 'DeviceSwitch'

export default DeviceSwitch
