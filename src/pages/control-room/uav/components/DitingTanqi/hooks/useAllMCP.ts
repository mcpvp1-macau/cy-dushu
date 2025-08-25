import { getMCPAll } from '@/service/modules/diting-tanqi'

const useAllMCP = (enable: boolean) => {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery(
    {
      queryKey: ['diting-tanqi', 'mcp-all'],
      queryFn: () => getMCPAll(),
      enabled: enable,
    },
    queryClient,
  )

  const mcps = useMemo(() => {
    if (!data?.data) {
      return {}
    }

    return data.data.reduce<
      Record<string, API_DITING_TANQI.domain.McpServerInfo>
    >((acc, e) => {
      acc[e.name] = e
      return acc
    }, {})
  }, [data])

  return {
    mcps,
    isLoading,
  }
}

export default useAllMCP
