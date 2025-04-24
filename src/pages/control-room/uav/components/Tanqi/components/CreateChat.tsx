import IconButton from '@/components/ui/button/IconButton'
import { PlusCircleOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'

const CreateChat: FC = memo(() => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  return (
    <IconButton
      toolTipProps={{
        title: t('tanqi.createChat.title'),
      }}
      onClick={() => {
        const nextSearchParams = new URLSearchParams(searchParams)
        nextSearchParams.delete('chat')
        setSearchParams(nextSearchParams, { replace: true })
      }}
    >
      <PlusCircleOutlined />
    </IconButton>
  )
})

CreateChat.displayName = 'CreateChat'

export default CreateChat
