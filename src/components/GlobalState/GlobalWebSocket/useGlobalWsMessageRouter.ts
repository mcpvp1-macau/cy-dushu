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

type WsType =
  | 'DEVICE_STATUS'
  | 'NEW_DEVICE_STATUS'
  | 'EVENT_STATUS'
  | 'EVENT_PUSH'
  | 'ALARMS'
  | 'ACTION_LOG'
  | 'TEMPORARY_DETECT_RESULT'
  | 'ACTION_ITEM_STATUS'
  | 'DIALOG_RESPONSE'
  | 'RECONSTRUCTION_TASK_END'
  | 'NO_FLY_ZONE_WARN'
  | 'ELECTRONIC_FENCE_WARN'
  | 'TWO_DIMENSION_RESULT'
  | 'ACTION_RELAY_EVENT'
  | 'SHJH_PILOT_APPROVAL'
  | 'OVERLAY_SHARE'

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
  const { handleOverlayShare, handleShjhApproval } = useMiscWsHandlers(queryClient)

  const handlers: Record<WsType, (message: unknown) => void> = useMemo(
    () => ({
      DEVICE_STATUS: () => {},
      NEW_DEVICE_STATUS: handleNewDeviceStatus,
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
      TWO_DIMENSION_RESULT: handle2DResult,
      ACTION_RELAY_EVENT: handleRelayEvent,
      SHJH_PILOT_APPROVAL: handleShjhApproval,
      OVERLAY_SHARE: handleOverlayShare,
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
    const { type, message } = shouldJson<{ type?: WsType; message: unknown }>(event.data) ?? {}
    if (!type) {
      return
    }

    handlers[type]?.(message)
  })
}
