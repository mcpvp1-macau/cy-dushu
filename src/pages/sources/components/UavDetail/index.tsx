import { FC, memo } from 'react'
import TextButton from '@/components/ui/button/TextButton'
import DetailModal from './DetailModal'

type PropsType = {
  sn: string
}

const UavDetail: FC<PropsType> = memo(({ sn }) => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <div>
      <TextButton onClick={() => setOpen(true)}>详情</TextButton>
      {open && <DetailModal sn={sn} open={open} onClose={() => setOpen(false)} />}
    </div>
  )
})

UavDetail.displayName = 'UavDetail'

export default UavDetail
