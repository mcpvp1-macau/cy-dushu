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

/** 获取无人机飞行计划 */
export const getUavFlyPlans = (uavSn: string) => {
  return serverDitingMCP.get<API_DITING_MCP.domain.FlyPlan>(
    '/api/plans/get_from_uav',
    {
      params: { uav_sn: uavSn },
      xCustomConfig: {
        autoShowMessageOnNotSuccess: false,
      },
    },
  )
}
