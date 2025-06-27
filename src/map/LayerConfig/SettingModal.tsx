import AppCollapse from '@/components/AppCollapse'
import XModal from '@/components/XModal'
import MapLayerListConfig from './components/LayerOverlay/MapLayerListConfig'
import AddLayerController from './components/LayerOverlay/AddLayerController'
import ReconstructionMapListConfig from './components/ReconstructionMapListConfig'
import AddReconstructionLayerGroup from './components/AddReconstructionLayerGroup'
import { ScrollArea } from '@/components/ui/scroll-area'

type PropsType = {
  open: boolean
  onClose?: () => void
}

const MapLayerSettingModal: FC<PropsType> = ({ open, onClose }) => {
  const { t } = useTranslation()

  return (
    <XModal
      width={350}
      title={t('mapLayer.setting.title')}
      open={open}
      onClose={onClose}
      noPadding
      centered
      footer={false}
    >
      <div className="max-h-[80vh] flex flex-col overflow-hidden">
        <ScrollArea>
          <AppCollapse
            defaultActiveKey={['map']}
            accordion
            items={[
              {
                key: 'layer',
                label: t('common.layer'),
                extra: (
                  <div onClick={(e) => e.stopPropagation()}>
                    <AddLayerController />
                  </div>
                ),
                children: <MapLayerListConfig />,
              },
              {
                key: 'reconstruction',
                label: t('common.threeMap'),
                extra: (
                  <div onClick={(e) => e.stopPropagation()}>
                    <AddReconstructionLayerGroup />
                  </div>
                ),
                children: <ReconstructionMapListConfig />,
              },
            ]}
          />
        </ScrollArea>
      </div>
    </XModal>
  )
}

export default MapLayerSettingModal
