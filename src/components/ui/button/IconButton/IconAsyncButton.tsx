import { GetProps } from 'antd'
import IconButton from '.'
import { LoadingOutlined } from '@ant-design/icons'

type PropsType = GetProps<typeof IconButton>

const IconAsyncButton: FC<PropsType> = memo((props) => {
  const [loading, setLoading] = useState(false)
  return (
    <IconButton
      {...props}
      children={loading ? <LoadingOutlined /> : props.children}
      onClick={async (e) => {
        try {
          setLoading(true)
          await props.onClick?.(e)
        } finally {
          setLoading(false)
        }
      }}
    />
  )
})

IconAsyncButton.displayName = 'IconAsyncButton'

export default IconAsyncButton
