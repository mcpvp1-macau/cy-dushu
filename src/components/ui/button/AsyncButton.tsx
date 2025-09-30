import { useAppMsg } from '@/hooks/useAppMsg'
import { Button, GetProps } from 'antd'

type PropsType = GetProps<typeof Button> & {
  /** 传递 空 字符串可以不弹窗 */ successMsg?: string
}

const AsyncButton: FC<PropsType> = memo((props) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const msgApi = useAppMsg()

  return (
    <Button
      loading={loading}
      {...props}
      onClick={async (e) => {
        try {
          setLoading(true)
          await props.onClick?.(e)
          if (props.successMsg === undefined) {
            msgApi.success(t('api.success.msg'))
          } else if (props.successMsg) {
            msgApi.success(props.successMsg)
          }
        } finally {
          setLoading(false)
        }
      }}
    />
  )
})

AsyncButton.displayName = 'AsyncButton'

export default AsyncButton
