import { getWaylineTemplateList } from '@/service/modules/wayline'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Input, Spin } from 'antd'
import { Fragment } from 'react'
import WaylineTemplateListItem from './WaylineTemplateListItem'
import { ScrollArea } from '@/components/ui/scroll-area'
import AppSpin from '@/components/AppSpin'
import useReachBottom from '@/hooks/useReachBottom'
import { useSearchParams } from 'react-router-dom'
import AppEmpty from '@/components/AppEmpty'
import { isNil } from 'lodash'
import Select from '@/components/AntdOverride/Select'
import IconWaylineAirpoint from '@/assets/icons/jsx/IconWaylineAirpoint'
import MenuIconAirline from '@/assets/icons/jsx/menus/MenuIconAirline'
import IconSwarm from '@/assets/icons/jsx/IconSwarm'
import { useDebounceFn, useUnmount } from 'ahooks'
import useWaylinesStore from '@/store/map/useWaylines.store'
import IconPointClout3DWayline from '@/assets/icons/jsx/IconPointCloud3DWayline'
import { WaylineEnum } from '@/constant/uav/wayline'
import { type TFunction } from 'i18next'

type PropsType = unknown

/** 构建航线类型选项 */
export const createWaylineTypeOptions = (
  t: TFunction<'translation', undefined>,
) => [
  {
    label: (
      <div className="flex gap-2 items-center">
        <IconWaylineAirpoint />
        {t('wayline.create.form.waylineType.options.point.title')}
      </div>
    ),
    value: WaylineEnum.PointWayline,
  },
  {
    label: (
      <div className="flex gap-2 items-center">
        <MenuIconAirline />
        {t('wayline.create.form.waylineType.options.area.title')}
      </div>
    ),
    value: WaylineEnum.AreaWayline,
  },
  {
    label: (
      <div className="flex gap-2 items-center">
        <IconSwarm />
        {t('wayline.create.form.waylineType.options.swarm.title')}
      </div>
    ),
    value: WaylineEnum.SwarmWayline,
  },
  // {
  //   label: (
  //     <div className="flex gap-2 items-center">
  //       <IconRebotDogWayline />
  //       {t('wayline.create.form.waylineType.options.rebotDog.title')}
  //     </div>
  //   ),
  //   value: WaylineEnum.RebotDogWayline,
  // },
  {
    label: (
      <div className="flex gap-2 items-center">
        <IconPointClout3DWayline />
        {t('wayline.create.form.waylineType.options.pointCloud3D.title')}
      </div>
    ),
    value: WaylineEnum.PointCloud3DWayline,
  },
]

/** 航线模板列表 */
const WaylineTemplateList: FC<PropsType> = memo(() => {
  const [searchParams, setSearchParams] = useSearchParams()
  const kw = searchParams.get('kw')
  const waylineType = searchParams.get('waylineType')

  const { t } = useTranslation()

  const queryClient = useQueryClient()
  const {
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    fetchNextPage,
  } = useInfiniteQuery(
    {
      queryKey: ['waylineTemplates', { kw, waylineType }],
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        const { data } = await getWaylineTemplateList({
          currentPage: pageParam,
          isPage: true,
          size: 15,
          templateName: kw || undefined,
          taskType: waylineType || undefined,
        })
        return data
      },
      getNextPageParam: (page, _, lastPageParam) => {
        if (page.rows.length < 15) {
          return undefined
        }
        return lastPageParam + 1
      },
    },
    queryClient,
  )

  const handleScroll = useReachBottom(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  })

  const { run: debouncedSearch } = useDebounceFn(
    (v: string) => {
      if (v) {
        searchParams.set('kw', v)
      } else {
        searchParams.delete('kw')
      }
      setSearchParams(searchParams, { replace: true })
    },
    { wait: 500 },
  )

  useUnmount(() => {
    useWaylinesStore.getState().setPreviewedWayline(null)
  })

  return (
    <div className="py-3 grow flex flex-col overflow-hidden">
      <div className="mx-3">
        <Input
          allowClear
          placeholder={t('wayline.searcher.placeholder')}
          defaultValue={kw || undefined}
          onChange={(evt) => debouncedSearch(evt.target.value)}
          addonAfter={
            <div className="px-2">
              <Select
                className="w-[120px]"
                placeholder={t('common.all')}
                allowClear
                popupMatchSelectWidth={false}
                options={createWaylineTypeOptions(t)}
                defaultValue={waylineType || undefined}
                onChange={(v) => {
                  if (v) {
                    searchParams.set('waylineType', v)
                  } else {
                    searchParams.delete('waylineType')
                  }
                  setSearchParams(searchParams, { replace: true })
                }}
              />
            </div>
          }
        />
      </div>
      <ScrollArea className="mt-3 flex-1" onScroll={handleScroll}>
        {isLoading ? (
          <AppSpin />
        ) : isNil(data?.pages.at(-1)) ||
          data?.pages.at(0)?.rows.length === 0 ? (
          <AppEmpty />
        ) : (
          <Spin spinning={isRefetching}>
            <ul className="mx-3 flex flex-col gap-3">
              {data?.pages.map((page, index) => (
                <Fragment key={index}>
                  {page.rows.map((e) => (
                    <WaylineTemplateListItem key={e.templateId} data={e} />
                  ))}
                </Fragment>
              ))}
            </ul>
          </Spin>
        )}
        {isFetchingNextPage && <AppSpin />}
      </ScrollArea>
    </div>
  )
})

WaylineTemplateList.displayName = 'WaylineTemplateList'

export default WaylineTemplateList
