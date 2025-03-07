import { useSearchParams } from 'react-router-dom'

const usePageSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  /** 其他查询参数改变 */
  const handleValueChange = useMemoizedFn(
    (key: string, value: string | null | undefined) => {
      if (value) {
        searchParams.set(key, value)
      } else {
        searchParams.delete(key)
      }
      searchParams.delete('page')
      setSearchParams(searchParams, { replace: true })
    },
  )

  /** 分页改变 */
  const handlePaginationChange = useMemoizedFn(
    (page: number, pageSize: number) => {
      if (page <= 1) {
        searchParams.delete('page')
      } else {
        searchParams.set('page', String(page))
      }
      searchParams.set('size', String(pageSize))
      setSearchParams(searchParams, { replace: true })
    },
  )

  return { handleValueChange, handlePaginationChange }
}

export default usePageSearchParams
