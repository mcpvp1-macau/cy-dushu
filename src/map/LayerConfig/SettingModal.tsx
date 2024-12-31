import IconPlus from '@/assets/icons/jsx/IconPlus'
import AppCollapse from '@/components/AppCollapse'
import IconButton from '@/components/ui/button/IconButton'
import FormModal from '@/components/XForm/Modal'
import XModal from '@/components/XModal'
import MapSpaceListConfig from './components/MapSpaceListConfig'
import MapLayerListConfig from './components/MapLayerListConfig'
import AddLayerController from './components/AddLayerController'
import { fileToBase64 } from '@/utils/base64'
import { useAppMsg } from '@/hooks/useAppMsg'
import { addSpace } from '@/service/modules/layer_overlay'
import { v4 } from 'uuid'
import useAddMapFormItems from './hooks/useAddMapFormItems'

type PropsType = {
  open: boolean
  onClose?: () => void
}

const MapLayerSettingModal: FC<PropsType> = ({ open, onClose }) => {
  const { t } = useTranslation()
  const msgApi = useAppMsg()
  const [addSpaceOpen, { setFalse: closeAddSpace, setTrue: openAddSpace }] =
    useBoolean(false)
  const queryClient = useQueryClient()

  const spaceFormItems = useAddMapFormItems()

  const handleAddSpaceConfirm = async (values: any) => {
    const base64 = await fileToBase64(values.mapPreviewUrl[0].originFileObj)
    if (base64 === null) {
      msgApi.error(t('mapLayer.errors.previewParse.msg'))
      return
    }
    delete values.mapPreviewUrl
    const spaceConfig = JSON.stringify({
      mapPerviewUrl: [
        {
          thumbUrl: base64,
          isAdd: true,
        },
      ],
    })
    values.spaceConfig = spaceConfig
    values.spaceId = v4()
    await addSpace(values)
    msgApi.success(t('api.success.msg'))
    await queryClient.invalidateQueries({
      queryKey: ['getSpaceList'],
    })
    closeAddSpace()
  }

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
      <AppCollapse
        defaultActiveKey={['map']}
        accordion
        items={[
          {
            key: 'map',
            label: t('common.map'),
            extra: (
              <div onClick={(e) => e.stopPropagation()}>
                <IconButton
                  toolTipProps={{ title: t('mapLayer.createMap.title') }}
                  onClick={openAddSpace}
                >
                  <IconPlus />
                </IconButton>
              </div>
            ),
            children: <MapSpaceListConfig />,
          },
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
        ]}
      />
      {addSpaceOpen && (
        <FormModal
          title={t('mapLayer.createMap.title')}
          open={addSpaceOpen}
          onClose={closeAddSpace}
          items={spaceFormItems}
          onConfirm={handleAddSpaceConfirm}
        />
      )}
    </XModal>
  )
}

export default MapLayerSettingModal
