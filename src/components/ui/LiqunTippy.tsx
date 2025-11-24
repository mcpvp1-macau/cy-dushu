import Tippy from '@tippyjs/react'
import { GetProps } from 'antd'
import '@/assets/style/tippy.less'

type PropsType = GetProps<typeof Tippy>

const LiqunTippy: FC<PropsType> = (props) => {
  return (
    <Tippy
      theme="liqun"
      interactive
      {...props}
      content={<div className="p-1.5">{props.content}</div>}
    >
      {props.children}
    </Tippy>
  )
}

LiqunTippy.displayName = 'LiqunTippy'

export default LiqunTippy
