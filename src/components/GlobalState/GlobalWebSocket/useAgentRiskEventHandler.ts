import { useMemoizedFn } from 'ahooks'
import { useQueryClient } from '@tanstack/react-query'

interface AgentRiskEventPayload {
  conversation_id?: string | number
  message: string
}

export const useAgentRiskEventHandler = () => {
  const queryClient = useQueryClient()

  return useMemoizedFn((payload: AgentRiskEventPayload) => {
    const conversationId = Number(payload?.conversation_id ?? Number.NaN)
    if (Number.isNaN(conversationId)) {
      return
    }

    queryClient.invalidateQueries({ queryKey: ['chatDetail', conversationId] })
  })
}
