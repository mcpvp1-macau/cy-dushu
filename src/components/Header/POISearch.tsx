import { emtpyArray } from '@/constant/data'
import { searchPOI } from '@/service/modules/layer_overlay'
import useMapLayerAndOverlayStore from '@/store/map/useLayerAndOverlay.store'
import { EnvironmentOutlined } from '@ant-design/icons'
import { useDebounceFn } from 'ahooks'
import { Select } from 'antd'
import AppSpin from '../AppSpin'

type PropsType = unknown

/** POI 下拉搜索框 */
const POISearch: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const [query, _setQuery] = useState('')
  const { run: setQuery } = useDebounceFn(
    (v) => {
      _setQuery(v)
    },
    { wait: 500, trailing: true },
  )
  const [value, setValue] = useState<string | undefined>(undefined)
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery(
    {
      queryKey: ['getPOIList', { query }],
      queryFn: () => searchPOI({ query, start: 0, limit: 10 }),
      enabled: query !== '',
      select: (d) => d.data,
    },
    queryClient,
  )

  const handleSearch = (v: string) => {
    setQuery(v)
  }

  const updateActivePOI = useMapLayerAndOverlayStore((s) => s.updateActivePOI)
  const handleSelect = (v) => {
    setValue(v)
    setOpen(false)
    const poi = data?.find((d) => d.placeId === v) || null
    updateActivePOI(poi)
  }

  const handleClear = () => {
    setValue(undefined)
    updateActivePOI(null)
  }

  const location = useLocation()

  return (
    <div>
      <Select
        showSearch
        value={value}
        open={open}
        placeholder={t('poi_searcher.placeholder')}
        className={clsx(
          location.pathname.startsWith('/control-room')
            ? 'w-[200px]'
            : 'w-[330px]',
        )}
        // style={{ width: 330 }}
        defaultActiveFirstOption={false}
        suffixIcon={null}
        filterOption={false}
        onSearch={handleSearch}
        notFoundContent={null}
        loading={true}
        optionLabelProp="name"
        allowClear
        onClear={handleClear}
        onFocus={() => {
          setOpen(true)
        }}
        onBlur={() => setOpen(false)}
        options={(data ?? emtpyArray).map((d) => ({
          value: d.placeId,
          name: d.name,
          address: d.address,
        }))}
        onSelect={handleSelect}
        optionRender={(option) => {
          return (
            <div className="flex gap-3 items-center">
              <EnvironmentOutlined />
              <div>
                <p>{option.data.name}</p>
                <p className="text-xs text-fore">{option.data.address}</p>
              </div>
            </div>
          )
        }}
        popupRender={(menu) => (
          <>
            <div className="px-3 py-1">
              {t('poi_searcher.result_tip', { count: data?.length })}
            </div>
            {isLoading || !menu ? <AppSpin /> : menu}
          </>
        )}
        onClick={(e) => {
          e.stopPropagation()
          if (!open) {
            setOpen(true)
          }
        }}
        // 阻止冒泡: 为了防止传递到 驾驶舱 的键盘事件
        onKeyDown={(e) => e.stopPropagation()}
        onKeyUp={(e) => e.stopPropagation()}
      />
    </div>
  )
})

POISearch.displayName = 'POISearch'

export default POISearch
