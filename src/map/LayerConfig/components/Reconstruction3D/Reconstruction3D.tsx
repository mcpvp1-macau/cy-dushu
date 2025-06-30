import IconRebuild3d from '@/assets/icons/jsx/IconRebuild3d'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import XModal from '@/components/XModal'
import ReconstructionMapListConfig from './ReconstructionMapListConfig'
import AddReconstructionLayerGroup from './AddReconstructionLayerGroup'

type PropsType = unknown

const Reconstruction3D: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const [open, { toggle, setFalse }] = useBoolean(false)

  return (
    <>
      <FloatIconButton
        toolTipProps={{
          title: t('common.threeMap'),
          placement: 'left',
          mouseEnterDelay: 0.5,
        }}
        variant="borderless"
        onClick={toggle}
      >
        <IconRebuild3d />
      </FloatIconButton>
      <XModal
        title={t('common.threeMap')}
        open={open}
        width={350}
        noPadding
        footer={false}
        onClose={setFalse}
      >
        <ReconstructionMapListConfig />
        <div className="p-3">
          <AddReconstructionLayerGroup />
        </div>
      </XModal>
    </>
  )
})

Reconstruction3D.displayName = 'Reconstruction3D'

export default Reconstruction3D
