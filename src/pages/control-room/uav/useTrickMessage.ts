import { useAppMsg } from '@/hooks/useAppMsg'
import { useKeyPress } from 'ahooks'

const useTrickMessage = () => {
  const msgApi = useAppMsg()
  useKeyPress('l', () => {
    msgApi.warning('嫌疑人出现，请注意观察')
  })
}

export default useTrickMessage
