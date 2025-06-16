import IconTip from '@/assets/icons/jsx/IconTip'
import useLoadingFn from '@/hooks/useLoadingFn'
import {
  clearCacheImage,
  getCacheImageTotalSize,
} from '@/map/CesiumMap/components/CustomUrlTemplateImageryProvider'
import useMapSettingStore from '@/store/setting/useMapSetting.store'
import { LoadingOutlined } from '@ant-design/icons'
import { useAsyncEffect } from 'ahooks'
import { Button, Checkbox, Radio } from 'antd'

type PropsType = unknown

const MapSetting: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const value = useMapSettingStore((s) => s.resolution)
  const setValue = useMapSettingStore((s) => s.updateResolution)

  const webgl1 = useMapSettingStore((s) => s.webgl1)
  const updateWebgl1 = useMapSettingStore((s) => s.updateWebgl1)

  const uavDetailFrustum = useMapSettingStore((s) => s.uavDetailFrustum)
  const updateUavDetailFrustum = useMapSettingStore(
    (s) => s.updateUavDetailFrustum,
  )

  const options = [
    {
      value: '0',
      label: t('setting.map.resolution.smooth'),
    },
    {
      value: '1',
      label: t('setting.map.resolution.standard'),
    },
    {
      value: '2',
      label: t('setting.map.resolution.default'),
    },
    {
      value: '3',
      label: t('setting.map.resolution.high'),
    },
    {
      value: '4',
      label: t('setting.map.resolution.super'),
    },
    {
      value: '5',
      label: t('setting.map.resolution.ultra'),
    },
  ]

  const [size, setSize] = useState(-1)
  useAsyncEffect(async () => {
    setSize(await getCacheImageTotalSize())
  }, [])

  const [run, clearCacheImageLoading] = useLoadingFn(async () => {
    await clearCacheImage()
    setSize(-1)
    setSize(await getCacheImageTotalSize())
  })

  return (
    <div>
      <Radio.Group
        className="mt-3"
        options={options}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="my-3">
        <Checkbox
          checked={webgl1}
          onChange={(e) => updateWebgl1(e.target.checked)}
        >
          <p>WebGL 1</p>
        </Checkbox>
        <Checkbox
          checked={uavDetailFrustum}
          onChange={(e) => updateUavDetailFrustum(e.target.checked)}
        >
          <p>无人机视锥</p>
        </Checkbox>
      </div>
      <div className="flex gap-2 text-fore mt-3">
        <IconTip />
        <p className="text-xs">{t('setting.map.resolution.description')}</p>
      </div>
      <div className="flex gap-2 mt-3">
        <div className="flex items-center gap-1">
          {t('setting.map.imagery.size')}:
          {size >= 0 ? (
            <span>{size >> 20} MB</span>
          ) : (
            <p className="flex items-center gap-1">
              {t('setting.map.imagery.calculating')}
              <LoadingOutlined />
            </p>
          )}
        </div>
        <Button size="small" onClick={run} loading={clearCacheImageLoading}>
          {t('common.clear')}
        </Button>
      </div>
    </div>
  )
})

MapSetting.displayName = 'MapSetting'

export default MapSetting
