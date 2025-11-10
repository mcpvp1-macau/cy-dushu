import { XFormItem } from '@/components/XForm/types'
import { message } from 'antd'

const useAddMapFormItems = () => {
  const { t } = useTranslation()

  return useMemo(
    () =>
      [
        {
          label: t('mapLayer.createMap.form.mapName.title'),
          name: 'spaceName',
          type: 'input',
          rules: [{ required: true }],
        },
        {
          label: t('mapLayer.createMap.form.mapType.title'),
          name: 'mapType',
          type: 'select',
          options: [
            {
              label: t('mapLayer.createMap.form.mapType.options.xyz.label'),
              value: 'LNG_LAT',
            },
            // { label: '点云地图', value: 'POINT_CLOUD', disabled: true },
          ],
          rules: [{ required: true }],
        },
        {
          label: t('mapLayer.createMap.form.tileType.title'),
          name: 'spaceType',
          type: 'select',
          options: [
            {
              label: t('mapLayer.createMap.form.tileType.option.xyz.label'),
              value: 'XYZ',
            },
            {
              label: 'TMS',
              value: 'TMS',
            },
            {
              label: t(
                'mapLayer.createMap.form.tileType.options.3dTiles.label',
              ),
              value: '3D_TILES',
            },
            {
              label: 'I3S',
              value: 'I3S',
            }
          ],
          rules: [{ required: true }],
        },
        {
          label: `${t(
            'mapLayer.createMap.form.url.title',
          )}(上传功能仅适用于倾斜摄影)`,
          name: 'spaceMapUrl',
          // type: 'input',
          type: 'upload-minio',
          getPath: (files) => {
            let is3d = false
            let value = ''
            for (let index = 0; index < files.length; index++) {
              const element = files[index]
              if (element.name === 'tileset.json') {
                is3d = true
                value = element.webkitRelativePath
                break
              }
            }
            if (!is3d) {
              message.error('请确认文件夹中是否含有tileset.json')
              return false
            }
            return value
          },
          rules: [{ required: true }],
        },
        {
          label: t('mapLayer.createMap.form.permission.title'),
          name: 'spaceSpecialType',
          type: 'select',
          options: [
            {
              label: t(
                'mapLayer.createMap.form.permission.option.default.label',
              ),
              value: 'DEFAULT',
            },
            {
              label: t(
                'mapLayer.createMap.form.permission.option.NORMAL.label',
              ),
              value: 'NORMAL',
            },
          ],
          rules: [{ required: true }],
        },
        {
          label: t('mapLayer.createMap.form.overview.title'),
          type: 'upload',
          name: 'mapPreviewUrl',
          valuePropName: 'fileList',
          getValueFromEvent: (e: any) => {
            if (Array.isArray(e)) {
              return e
            }
            return e?.fileList
          },
          otherProps: {
            beforeUpload: () => false,
            accept: 'image/*',
            listType: 'picture',
            maxCount: 1,
          },
          rules: [{ required: true }],
        },
      ] as XFormItem[],
    [t],
  )
}

export default useAddMapFormItems
