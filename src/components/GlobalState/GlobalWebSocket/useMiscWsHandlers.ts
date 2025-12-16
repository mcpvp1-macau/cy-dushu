import { useMemoizedFn } from 'ahooks'
import { useAppNotification } from '@/hooks/useNotification'
import { shouldJson } from '@/utils/json'
import { type QueryClient } from '@tanstack/react-query'

export const useMiscWsHandlers = (queryClient: QueryClient) => {
  const notificationApi = useAppNotification()

  const handleShjhApproval = useMemoizedFn((message: any) => {
    const { actionId, deviceId } = shouldJson(message) ?? message ?? {}
    if (!actionId || !deviceId) {
      return
    }
    queryClient.invalidateQueries({
      queryKey: ['action', String(actionId), 'items'],
    })
    queryClient.invalidateQueries({
      queryKey: ['jinghang', 'deviceCanFly', deviceId],
    })
  })

  const handleOverlayShare = useMemoizedFn((message: any) => {
    console.log('收到覆盖物共享结果', message)
    notificationApi.success({
      message: `收到${message.senderUserId}分享的覆盖物${message.overlayName}`,
      duration: 0,
      style: {
        backgroundColor: '#15B371',
        padding: '8px 0',
        width: '280px',
        borderRadius: '4px',
      },
      icon: <></>,
    })
    queryClient.invalidateQueries({
      queryKey: ['overlayList'],
      exact: false,
    })
  })

  return {
    handleOverlayShare,
    handleShjhApproval,
  }
}
