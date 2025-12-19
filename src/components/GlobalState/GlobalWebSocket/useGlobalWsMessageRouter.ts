import { useMemo } from 'react'
import { useMemoizedFn } from 'ahooks'
import { shouldJson } from '@/utils/json'
import { useDeviceWsHandlers } from './useDeviceWsHandlers'
import { useActionWsHandlers } from './useActionWsHandlers'
import { useReconstructionWsHandlers } from './useReconstructionWsHandlers'
import { useFlightAreaWsHandlers } from './useFlightAreaWsHandlers'
import { useMiscWsHandlers } from './useMiscWsHandlers'
import useHandlePushEvent from './useHandlePushEvent'
import { useQueryClient } from '@tanstack/react-query'
import { useAgentRiskEventHandler } from './useAgentRiskEventHandler'

export const useGlobalWsMessageRouter = () => {
  const queryClient = useQueryClient()
  const { handleNewDeviceStatus } = useDeviceWsHandlers(queryClient)
  const { handleEventPush, handleAlarmPush } = useHandlePushEvent()
  const {
    handleActionItemStatus,
    handleActionLog,
    handleDialogResponse,
    handleRelayEvent,
    handleTemporaryDetectResult,
  } = useActionWsHandlers()
  const { handleReconstructionTaskEnd, handle2DResult } =
    useReconstructionWsHandlers()
  const { handleFlightAreaMessage } = useFlightAreaWsHandlers()
  const { handleOverlayShare, handleShjhApproval } =
    useMiscWsHandlers(queryClient)
  const handleAgentRiskEvent = useAgentRiskEventHandler()

  const handlers: Record<string, (message: unknown) => void> = useMemo(
    () => ({
      DEVICE_STATUS: () => {},
      NEW_DEVICE_STATUS: (message) =>
        handleNewDeviceStatus((message ?? '') as any),
      EVENT_STATUS: () => {},
      EVENT_PUSH: handleEventPush,
      ALARMS: handleAlarmPush,
      ACTION_LOG: handleActionLog,
      TEMPORARY_DETECT_RESULT: handleTemporaryDetectResult,
      ACTION_ITEM_STATUS: handleActionItemStatus,
      DIALOG_RESPONSE: handleDialogResponse,
      RECONSTRUCTION_TASK_END: handleReconstructionTaskEnd,
      NO_FLY_ZONE_WARN: (message) =>
        handleFlightAreaMessage(message, 'NO_FLY_ZONE_WARN'),
      ELECTRONIC_FENCE_WARN: (message) =>
        handleFlightAreaMessage(message, 'ELECTRONIC_FENCE_WARN'),
      TWO_DIMENSION_RESULT: (message) => handle2DResult(message as any),
      ACTION_RELAY_EVENT: (message) => handleRelayEvent(message as any),
      SHJH_PILOT_APPROVAL: handleShjhApproval,
      OVERLAY_SHARE: handleOverlayShare,
      events: (message: unknown) => {
        const parsed = shouldJson(message)
        if (parsed.method === 'event.agentRiskEvent.info') {
          handleAgentRiskEvent(parsed?.data ?? {})
          return
        }
      },
    }),
    [
      handleActionItemStatus,
      handleActionLog,
      handleAlarmPush,
      handleDialogResponse,
      handleFlightAreaMessage,
      handleNewDeviceStatus,
      handleReconstructionTaskEnd,
      handleRelayEvent,
      handleShjhApproval,
      handleTemporaryDetectResult,
      handleEventPush,
      handleOverlayShare,
      handle2DResult,
    ],
  )

  return useMemoizedFn((event: WebSocketEventMap['message']) => {
    const parsed = shouldJson<unknown>(event.data)
    if (!parsed || typeof parsed !== 'object') {
      return
    }

    const { type, message } = parsed as { type; message?: unknown }
    if (!type) {
      return
    }

    handlers[type]?.(message)
  })
}
