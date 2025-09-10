import serverDitingMCP from '@/service/servers/serverDitingMCP'

/** 获取 无人机 信息 */
export const getUavInfo = (uavSn: string) => {
  return serverDitingMCP.get<API_DITING_MCP.domain.UavInfo>(
    `/api/dushu/uavs/${uavSn}`,
  )
}

/** 获取 MCP 可用工具 */
export const getMCPTools = (mcpName: string) => {
  return serverDitingMCP.get<string[]>(`/api/mcp/${mcpName}/tools`)
}
