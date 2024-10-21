import IconDelete from '@/assets/icons/jsx/IconDelete'
import IconEdit from '@/assets/icons/jsx/IconEdit'
import AppSpin from '@/components/AppSpin'
import IconButton from '@/components/ui/button/IconButton'
import { getSpaceList } from '@/service/modules/layer_overlay'
import { shouldJson } from '@/utils/json'

type PropsType = unknown

const MapImageryConfig: FC<PropsType> = memo(() => {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery(
    {
      queryKey: ['getSpaceList'],
      queryFn: getSpaceList,
      select: (d) => d.data.rows,
    },
    queryClient,
  )

  const renderData = useMemo(() => {
    if (!data) {
      return
    }
    return data.map((e) => {
      return {
        ...e,
        spaceConfig: shouldJson(e.spaceConfig),
      }
    })
  }, [data])

  if (isLoading || !renderData) {
    return <AppSpin />
  }

  return (
    <div className="p-3 flex flex-col gap-3">
      {renderData.map((e) => (
        <div key={e.spaceId} className="h-28 w-full relative">
          <img
            src={e.spaceConfig?.mapPerviewUrl?.[0].thumbUrl}
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 px-3 bg-ground-100 bg-opacity-50 backdrop-blur flex justify-between">
            <p>{e.spaceName}</p>
            <p className="flex gap-2">
              <IconButton>
                <IconEdit className="scale-90" />
              </IconButton>
              <IconButton>
                <IconDelete className="scale-90" />
              </IconButton>
            </p>
          </div>
        </div>
      ))}
    </div>
  )
})

MapImageryConfig.displayName = 'MapImageryConfig'

export default MapImageryConfig
