import { GetProps } from 'antd'
import IconButton from '.'
import { LoadingOutlined } from '@ant-design/icons'
import { useAppMsg } from '@/hooks/useAppMsg'

type PropsType = GetProps<typeof IconButton> & {
  /** 传递 空 字符串可以不弹窗 */
  successMsg?: string
}

/** 自动处理 loading 状态和 弹窗 */
const IconAsyncButton: FC<PropsType> = memo((props) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const msgApi = useAppMsg()

  return (
    <IconButton
      {...props}
      children={loading ? <LoadingOutlined /> : props.children}
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

IconAsyncButton.displayName = 'IconAsyncButton'

export default IconAsyncButton
