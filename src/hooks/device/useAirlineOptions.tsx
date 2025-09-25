import { getAirlineTemplateList } from '@/service/modules/airline'
import useWaylinePreview from '../wayline/useWaylinePreview'
import { WaylineIcon } from '@/pages/wayline/components/AirlineTemplateListItem'
import IconButton from '@/components/ui/button/IconButton'
import IconPreview from '@/assets/icons/jsx/IconPreview'

/** 获取所有航线和选项 */
const useAirlineOptions = () => {
  const queryClient = useQueryClient()
  const { data } = useQuery(
    {
      queryKey: ['getAllAirlines'],
      queryFn: () =>
        getAirlineTemplateList({
          isPage: false,
        }),
      select: (d) => d.data.rows,
      // staleTime: 1000 * 60 * 60,
    },
    queryClient,
  )

  const { holder, handlePreview } = useWaylinePreview()
  const { t } = useTranslation()

  const airlineOptions = useMemo(
    () =>
      data?.map((e, i) => ({
        label: (
          <div className="flex justify-between">
            <div className="flex gap-2">
              <WaylineIcon type={e.taskType} />
              {e.taskName}
            </div>
            <IconButton
              toolTipProps={{ title: t('common.preview') }}
              onClick={() => handlePreview(e)}
              className="hover:text-white scale-90"
            >
              <IconPreview />
            </IconButton>
          </div>
        ),
        value: i,
      })) ?? [],
    [data],
  )

  return {
    data,
    airlineOptions,
    holder,
  }
}

export default useAirlineOptions
