import IconMap from '@/assets/icons/jsx/IconMap'
import XModal from '@/components/XModal'
import MapSpaceListConfig from './MapSpaceListConfig'
import { Button, Form, Input } from 'antd'
import IconPlus from '@/assets/icons/jsx/IconPlus'
import FormModal from '@/components/XForm/Modal'
import useAddMapFormItems from '../../hooks/useAddMapFormItems'
import { fileToBase64 } from '@/utils/base64'
import { useAppMsg } from '@/hooks/useAppMsg'
import { v4 } from 'uuid'
import { addSpace } from '@/service/modules/layer_overlay'
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import { useDeferredValue } from 'react'

type PropsType = unknown

const MapSpace: FC<PropsType> = memo(() => {
  const [open, { toggle, setFalse }] = useBoolean(false)
  const [addSpaceOpen, { setFalse: closeAddSpace, setTrue: openAddSpace }] =
    useBoolean(false)
  const { t } = useTranslation()

  const [form] = Form.useForm()

  const msgApi = useAppMsg()
  const spaceFormItems = useAddMapFormItems(form)
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
      layer: values['WMTS.layer'],
      style: values['WMTS.style'],
      tileMatrixSetID: values['WMTS.tileMatrixSetID'],
      format: values['WMTS.format'],
      tileMatrixLabels: values['WMTS.tileMatrixLabels'],
      tilingScheme: values['WMTS.tilingScheme'],
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

  const [kw, setKw] = useState('')
  const deferredKw = useDeferredValue(kw)

  return (
    <>
      <FloatIconButton
        active={open}
        variant="borderless"
        tippyProps={{
          content: t('common.map'),
          placement: 'left',
        }}
        onClick={toggle}
      >
        <IconMap />
      </FloatIconButton>
      {open && (
        <XModal
          title={
            <div className="flex items-center gap-2">
              <IconMap />
              {t('common.map')}
            </div>
          }
          open={open}
          width={350}
          onClose={setFalse}
          noPadding
          footer={false}
        >
          <div className="max-h-[75vh] flex flex-col">
            <div className="m-3 mb-0">
              <Input
                placeholder={t('poi_searcher.placeholder')}
                allowClear
                onChange={(e) => setKw(e.target.value)}
              />
            </div>
            <MapSpaceListConfig searchKw={deferredKw} />
            <div className="px-3 mb-3">
              <Button icon={<IconPlus />} onClick={openAddSpace} block>
                {t('mapLayer.createMap.title')}
              </Button>
            </div>
          </div>
        </XModal>
      )}
      {addSpaceOpen && (
        <FormModal
          title={t('mapLayer.createMap.title')}
          mask
          open={addSpaceOpen}
          onClose={closeAddSpace}
          items={spaceFormItems}
          onConfirm={handleAddSpaceConfirm}
          form={form}
        />
      )}
    </>
  )
})

MapSpace.displayName = 'MapSpace'

export default MapSpace
