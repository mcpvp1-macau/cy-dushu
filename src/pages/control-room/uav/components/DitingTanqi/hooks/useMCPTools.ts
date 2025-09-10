import { getMCPTools } from '@/service/modules/diting-mcp'

const useMCPTools = (
  mcpName: 'FlyControl' | 'TaskUnderstand',
  enable: boolean,
) => {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery(
    {
      queryKey: ['diting-tanqi', 'mcp', 'tools', mcpName],
      queryFn: () => getMCPTools(mcpName),
      enabled: enable,
      select: (d) => d.data,
    },
    queryClient,
  )

  const mcps = useMemo(() => {
    return data || []
  }, [data])

  return {
    mcps,
    isLoading,
  }
}

export default useMCPTools
