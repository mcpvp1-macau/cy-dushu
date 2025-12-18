import { useMemoizedFn } from 'ahooks'
import { useQueryClient } from '@tanstack/react-query'

interface AgentRiskEventPayload {
  event?: {
    agentRiskEvent?: {
      info?: {
        conversation_id?: string | number
      }
    }
  }
}

export const useAgentRiskEventHandler = () => {
  const queryClient = useQueryClient()

  return useMemoizedFn((payload: unknown) => {
    const info = (payload as AgentRiskEventPayload)?.event?.agentRiskEvent?.info
    if (!info) {
      return
    }

    const conversationId = Number(info?.conversation_id ?? Number.NaN)
    if (Number.isNaN(conversationId)) {
      return
    }

    queryClient.resetQueries({ queryKey: ['chatDetail', conversationId] })
  })
}
