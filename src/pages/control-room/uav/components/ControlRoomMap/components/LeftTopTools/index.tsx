import DeviceIconUAV2 from '@/assets/icons/jsx/device/DeviceIconUAV2'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import DeviceSelect from './components/DeviceSelect'

type PropsType = unknown

const LeftTopTools: FC<PropsType> = memo(() => {
  const [active, setActive] = useState<string | null>(null)

  return (
    <>
      <div className="absolute left-3 top-3 flex gap-3">
        <FloatIconButton
          active={active === 'device'}
          onClick={() => setActive(active ? null : 'device')}
        >
          <DeviceIconUAV2 />
        </FloatIconButton>
      </div>
      {active && (
        <div className="absolute left-3 top-[52px] w-[350px] bg-ground-1/90 backdrop-blur h-[calc(100vh-172px)] overflow-hidden rounded border-ground-5 border flex flex-col">
          {active === 'device' && (
            <DeviceSelect onClose={() => setActive(null)} />
          )}
        </div>
      )}
    </>
  )
})

LeftTopTools.displayName = 'LeftTopTools'

export default LeftTopTools
