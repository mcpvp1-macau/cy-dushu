import IconLayer from '@/assets/icons/jsx/IconLayer'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import XModal from '@/components/XModal'
import MapLayerListConfig from './MapLayerListConfig'
import { ScrollArea } from '@/components/ui/scroll-area'
import AddLayerController from './AddLayerController'
import { Input } from 'antd'
import { useDeferredValue } from 'react'

type PropsType = unknown

const LayerOverlay: FC<PropsType> = memo(() => {
  const [open, { setFalse: close, toggle }] = useBoolean(false)
  const { t } = useTranslation()

  const [kw, setKw] = useState('')
  const deferredKw = useDeferredValue(kw)

  return (
    <>
      <FloatIconButton
        active={open}
        variant="borderless"
        tippyProps={{
          content: t('common.mapPlotting'),
          placement: 'left',
        }}
        onClick={toggle}
      >
        <IconLayer />
      </FloatIconButton>
      {open && (
        <XModal
          title={
            <div className="flex items-center gap-2">
              <IconLayer />
              {t('common.mapPlotting')}
            </div>
          }
          open={open}
          onClose={close}
          width={350}
          noPadding
          footer={false}
        >
          <div className="max-h-[75vh] flex flex-col overflow-hidden">
            <div className="m-3">
              <Input
                placeholder={t('poi_searcher.placeholder')}
                allowClear
                value={kw}
                onChange={(e) => setKw(e.target.value)}
              />
            </div>
            <ScrollArea className="flex-1">
              <MapLayerListConfig searchKw={deferredKw} />
            </ScrollArea>
            <AddLayerController />
          </div>
        </XModal>
      )}
    </>
  )
})

LayerOverlay.displayName = 'LayerOverlay'

export default LayerOverlay
