import serverDitingTanqi from '@/service/servers/serverDitingTanqi'

/** 对话列表 */
export const getConversations = async (params: { group_name: string }) => {
  return serverDitingTanqi.get<API_DITING_TANQI.res.PagedModelConversationResp>(
    '/user/conversations',
    {
      params,
    },
  )
}

/** 创建对话详情 */
export const createConversation = async (data: {
  group_name: string
  name?: string
  system_message: string
}) => {
  return serverDitingTanqi.post<API_DITING_TANQI.domain.ConversationItem>(
    '/user/conversations',
    data,
  )
}

/** 更新对话 */
export const updateConversation = async (
  id: number,
  data: { name: string },
) => {
  return serverDitingTanqi.put(`/user/conversations/${id}`, data)
}

/** 删除对话 */
export const deleteConversation = async (id: number) => {
  return serverDitingTanqi.delete(`/user/conversations/${id}`)
}

// 聊天相关 -----------------------------------------------------------

/** 获取聊天记录列表 */
export const getChats = async (conversationId: number) => {
  return serverDitingTanqi.get<API_DITING_TANQI.res.ChatRecordResp>(
    `/user/conversations/${conversationId}/chats`,
  )
}

/** 发送聊天消息 */
export const sendChatMsg = async (
  conversationId: number,
  data: { message: string },
) => {
  return serverDitingTanqi.post(
    `/user/conversations/${conversationId}/chats`,
    data,
  )
}

/** 停止聊天 */
export const stopChat = async (conversationId: number) => {
  return serverDitingTanqi.post(
    `/user/conversations/${conversationId}/chats/stop`,
  )
}

/** 获取所有MCP服务器 */
export const getMCPAll = async (tag?: string) => {
  return serverDitingTanqi.get<API_DITING_TANQI.domain.McpServerInfo[]>(
    '/pub/mcp_servers',
    {
      params: {
        tag,
      },
    },
  )
}
