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
import { spaceFormItems } from './components/MapSpaceConfig'

type PropsType = {
  open: boolean
  onClose?: () => void
}

const MapLayerSettingModal: FC<PropsType> = ({ open, onClose }) => {
  const msgApi = useAppMsg()
  const [addSpaceOpen, { setFalse: closeAddSpace, setTrue: openAddSpace }] =
    useBoolean(false)
  const queryClient = useQueryClient()

  const handleAddSpaceConfirm = async (values: any) => {
    const base64 = await fileToBase64(values.mapPreviewUrl[0].originFileObj)
    if (base64 === null) {
      msgApi.error('预览图解析失败')
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
    msgApi.success('添加地图成功')
    await queryClient.invalidateQueries({
      queryKey: ['getSpaceList'],
    })
    closeAddSpace()
  }

  return (
    <XModal
      width={350}
      title="图层设置"
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
            label: '地图',
            extra: (
              <div onClick={(e) => e.stopPropagation()}>
                <IconButton
                  toolTipProps={{ title: '添加地图' }}
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
            label: '图层',
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
          title="新增地图"
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
