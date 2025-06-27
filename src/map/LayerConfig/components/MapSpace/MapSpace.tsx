import IconMap from '@/assets/icons/jsx/IconMap'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import XModal from '@/components/XModal'
import MapSpaceListConfig from './MapSpaceListConfig'
import { Button } from 'antd'
import IconPlus from '@/assets/icons/jsx/IconPlus'
import FormModal from '@/components/XForm/Modal'
import useAddMapFormItems from '../../hooks/useAddMapFormItems'
import { fileToBase64 } from '@/utils/base64'
import { useAppMsg } from '@/hooks/useAppMsg'
import { v4 } from 'uuid'
import { addSpace } from '@/service/modules/layer_overlay'

type PropsType = unknown

const MapSpace: FC<PropsType> = memo(() => {
  const [open, { toggle, setFalse }] = useBoolean(false)
  const [addSpaceOpen, { setFalse: closeAddSpace, setTrue: openAddSpace }] =
    useBoolean(false)
  const { t } = useTranslation()

  const msgApi = useAppMsg()
  const spaceFormItems = useAddMapFormItems()
  const queryClient = useQueryClient()

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
    <>
      <FloatIconButton onClick={toggle}>
        <IconMap />
      </FloatIconButton>
      {open && (
        <XModal
          title={t('common.map')}
          open={open}
          width={350}
          onClose={setFalse}
          noPadding
          footer={false}
        >
          <MapSpaceListConfig />
          <div className="px-3 mb-3">
            <Button icon={<IconPlus />} onClick={openAddSpace} block>
              {t('mapLayer.createMap.title')}
            </Button>
          </div>
        </XModal>
      )}
      {addSpaceOpen && (
        <FormModal
          title={t('mapLayer.createMap.title')}
          open={addSpaceOpen}
          onClose={closeAddSpace}
          items={spaceFormItems}
          onConfirm={handleAddSpaceConfirm}
        />
      )}
    </>
  )
})

MapSpace.displayName = 'MapSpace'

export default MapSpace
