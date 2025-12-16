import { useMemoizedFn } from 'ahooks'
import { useAppNotification } from '@/hooks/useNotification'

export const useFlightAreaWsHandlers = () => {
  const notificationApi = useAppNotification()

  const handleFlightAreaMessage = useMemoizedFn((message: any, key: string) => {
    notificationApi.success({
      message: message,
      duration: 0,
      key,
      style: {
        backgroundColor: '#dd4444',
        padding: '8px 20px 8px 0px',
        width: 'fit-content',
        borderRadius: '4px',
        whiteSpace: 'nowrap',
      },
      icon: <></>,
    })
  })

  return {
    handleFlightAreaMessage,
  }
}
