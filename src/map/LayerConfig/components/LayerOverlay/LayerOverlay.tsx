import IconLayer from '@/assets/icons/jsx/IconLayer'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import XModal from '@/components/XModal'
import MapLayerListConfig from './MapLayerListConfig'
import { ScrollArea } from '@/components/ui/scroll-area'
import AddLayerController from './AddLayerController'

type PropsType = unknown

const LayerOverlay: FC<PropsType> = memo(() => {
  const [open, { setFalse: close, toggle }] = useBoolean(false)
  const { t } = useTranslation()

  return (
    <>
      <FloatIconButton
        variant="borderless"
        toolTipProps={{
          title: t('common.mapPlotting'),
          placement: 'left',
          mouseEnterDelay: 0.5,
        }}
        onClick={toggle}
      >
        <IconLayer />
      </FloatIconButton>
      {open && (
        <XModal
          title={t('common.layer')}
          open={open}
          onClose={close}
          width={350}
          noPadding
          footer={false}
        >
          <ScrollArea className="max-h-[70vh] overflow-hidden flex flex-col">
            <MapLayerListConfig />
          </ScrollArea>
          <AddLayerController />
        </XModal>
      )}
    </>
  )
})

LayerOverlay.displayName = 'LayerOverlay'

export default LayerOverlay
