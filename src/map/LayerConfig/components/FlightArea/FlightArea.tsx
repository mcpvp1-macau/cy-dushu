import IconFlightArea from '@/assets/icons/jsx/IconFlightArea'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import XModal from '@/components/XModal'
import { Input } from 'antd'
import Select from '@/components/AntdOverride/Select'
import FlightAreaGroupConfig from './FlightAreaGroupConfig'
import AddFlightAreaGroup from './AddFlightAreaGroup'
import { useDeferredValue } from 'react'

type PropsType = unknown

const FlightAreaConfig: FC<PropsType> = memo(() => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const flightAreaTypeOptions = [
    {
      label: t('flightArea.type.electronicFence.title'),
      value: 'ELECTRONIC_FENCE',
    },
    {
      label: t('flightArea.type.noFly.title'),
      value: 'NO_FLY_ZONE',
    },
    {
      label: t('flightArea.type.countZone.title'),
      value: 'AI_COUNT_ZONE',
    },
    {
      label: t('flightArea.type.noCountZone.title'),
      value: 'NO_COUNT_ZONE',
    },
  ]

  const [open, { toggle, setFalse }] = useBoolean(false)

  // 同组织的别的成员可能更改了飞行区域，每次打开需要重新查询
  useEffect(() => {
    if (open) {
      queryClient.invalidateQueries({
        queryKey: ['getFlightAreaGroupList'],
      })
    }
  }, [open])

  const [kw, setKw] = useState('')
  const deferredKw = useDeferredValue(kw)
  const [type, setType] = useState<string | undefined>(undefined)

  return (
    <>
      <FloatIconButton
        active={open}
        tippyProps={{
          content: t('flightArea.title'),
          placement: 'left',
        }}
        variant="borderless"
        onClick={toggle}
      >
        <IconFlightArea />
      </FloatIconButton>
      {open && (
        <XModal
          title={
            <div className="flex items-center gap-2">
              <IconFlightArea />
              {t('flightArea.title')}
            </div>
          }
          open={open}
          width={350}
          noPadding
          footer={false}
          onClose={setFalse}
        >
          <div className="max-h-[75vh] flex flex-col overflow-hidden">
            <div className="m-3 flex gap-2">
              <Input
                className="w-2/3"
                placeholder={t('poi_searcher.placeholder')}
                allowClear
                onChange={(e) => setKw(e.target.value)}
              />
              <Select
                className="w-1/3"
                options={flightAreaTypeOptions}
                allowClear
                placeholder={t('common.all')}
                onChange={setType}
                value={type}
              />
            </div>
            <FlightAreaGroupConfig searchKw={deferredKw} searchType={type} />
            <div className="p-3">
              <AddFlightAreaGroup type="add" />
            </div>
          </div>
        </XModal>
      )}
    </>
  )
})

FlightAreaConfig.displayName = 'FlightArea'

export default FlightAreaConfig
