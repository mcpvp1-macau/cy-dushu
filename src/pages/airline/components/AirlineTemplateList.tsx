import { getAirlineTemplateList } from '@/service/modules/airline'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Input, Spin } from 'antd'
import React, { memo, type FC } from 'react'
import AirlineTemplateListItem from './AirlineTemplateListItem'
import { ScrollArea } from '@/components/ui/scroll-area'
import AppSpin from '@/components/AppSpin'
import useReachBottom from '@/hooks/useReachBottom'
import { useSearchParams } from 'react-router-dom'
import AppEmpty from '@/components/AppEmpty'
import { isNil } from 'lodash'

type PropsType = unknown

const AirlineTemplateList: FC<PropsType> = memo(() => {
  const [searchParams, setSearchParams] = useSearchParams()
  const kw = searchParams.get('kw')

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
      queryKey: ['airlineTemplates', kw],
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        const { data } = await getAirlineTemplateList({
          currentPage: pageParam,
          isPage: true,
          size: 15,
          templateName: kw || undefined,
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
        <Input.Search
          placeholder={t('wayline.searcher.placeholder')}
          defaultValue={kw || undefined}
          onSearch={handleSearch}
        />
      </div>
      <ScrollArea className="mt-3 flex-1" onScroll={handleScroll}>
        {isLoading ? (
          <AppSpin />
        ) : isNil(data?.pages.at(-1)) ||
          data?.pages.at(-1)?.rows.length === 0 ? (
          <AppEmpty />
        ) : (
          <Spin spinning={isRefetching}>
            <ul className="mx-3 flex flex-col gap-3">
              {data?.pages.map((page, index) => (
                <React.Fragment key={index}>
                  {page.rows.map((e) => (
                    <AirlineTemplateListItem key={e.templateId} data={e} />
                  ))}
                </React.Fragment>
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
