import { getAirlineTemplateList } from '@/service/modules/airline'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Input, Spin } from 'antd'
import { Fragment } from 'react'
import AirlineTemplateListItem from './AirlineTemplateListItem'
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
import IconRebotDogWayline from '@/assets/icons/jsx/IconRebotDogWayline'

type PropsType = unknown

const AirlineTemplateList: FC<PropsType> = memo(() => {
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
      queryKey: ['airlineTemplates', { kw, waylineType }],
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        const { data } = await getAirlineTemplateList({
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

  const handleSearch = useMemoizedFn((v: string) => {
    if (v) {
      searchParams.set('kw', v)
    } else {
      searchParams.delete('kw')
    }
    setSearchParams(searchParams, { replace: true })
  })

  return (
    <div className="py-3 grow flex flex-col overflow-hidden">
      <div className="mx-3">
        <Input
          allowClear
          placeholder={t('wayline.searcher.placeholder')}
          defaultValue={kw || undefined}
          onPressEnter={(evt) => handleSearch(evt.currentTarget.value)}
          onClear={() => handleSearch('')}
          addonAfter={
            <div className="px-2">
              <Select
                className="w-[120px]"
                placeholder={t('common.all')}
                allowClear
                popupMatchSelectWidth={false}
                options={[
                  {
                    value: 'waypoint',
                    label: (
                      <div className="flex gap-2">
                        <IconWaylineAirpoint />
                        {t(
                          'wayline.create.form.waylineType.options.point.title',
                        )}
                      </div>
                    ),
                  },
                  {
                    value: 'area_waypoint',
                    label: (
                      <div className="flex gap-2">
                        <MenuIconAirline />
                        {t(
                          'wayline.create.form.waylineType.options.area.title',
                        )}
                      </div>
                    ),
                  },
                  {
                    value: 'cluster_wayline',
                    label: (
                      <div className="flex gap-2">
                        <IconSwarm />
                        {t(
                          'wayline.create.form.waylineType.options.swarm.title',
                        )}
                      </div>
                    ),
                  },
                  {
                    value: 'fixed_point_cruise',
                    label: (
                      <div className="flex gap-2">
                        <IconRebotDogWayline />
                        {t(
                          'wayline.create.form.waylineType.options.rebotDog.title',
                        )}
                      </div>
                    ),
                  },
                ]}
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
                    <AirlineTemplateListItem key={e.templateId} data={e} />
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

AirlineTemplateList.displayName = 'AirlineTemplateList'

export default AirlineTemplateList
