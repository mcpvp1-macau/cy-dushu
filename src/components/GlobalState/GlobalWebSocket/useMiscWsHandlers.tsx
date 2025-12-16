import { useMemoizedFn } from 'ahooks'
import { useAppNotification } from '@/hooks/useNotification'
import { shouldJson } from '@/utils/json'
import { type QueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

export const useMiscWsHandlers = (queryClient: QueryClient) => {
  const notificationApi = useAppNotification()
  const [t] = useTranslation()

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
    if (import.meta.env.DEV) {
      console.log('收到覆盖物共享结果', message)
    }
    const senderUserId = message?.senderUserId ?? '-'
    const overlayName = message?.overlayName ?? '-'
    notificationApi.success({
      message: t('globalWs.overlayShare.received', {
        defaultValue: '收到{{senderUserId}}分享的覆盖物{{overlayName}}',
        senderUserId,
        overlayName,
      }),
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
