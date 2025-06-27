import IconLayer from '@/assets/icons/jsx/IconLayer'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import XModal from '@/components/XModal'
import MapLayerListConfig from './MapLayerListConfig'

type PropsType = unknown

const LayerOverlay: FC<PropsType> = memo(() => {
  const [open, { setFalse: close, toggle }] = useBoolean(false)
  const { t } = useTranslation()

  return (
    <>
      <FloatIconButton onClick={toggle}>
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
          <MapLayerListConfig />
        </XModal>
      )}
    </>
  )
})

LayerOverlay.displayName = 'LayerOverlay'

export default LayerOverlay
