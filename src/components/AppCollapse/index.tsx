import { Collapse, GetProps } from 'antd'
import { memo, type FC } from 'react'
import styles from './styles.module.less'
import CustomExpandIcon from '../CustomExpandIcon'

type PropsType = GetProps<typeof Collapse>

const AppCollapse: FC<PropsType> = memo((props) => {
  return (
    <Collapse
      {...props}
      expandIconPosition="end"
      expandIcon={CustomExpandIcon}
      className={clsx(styles['liqun-collapse'], props.className)}
    />
  )
})

AppCollapse.displayName = 'AppCollapse'

export default AppCollapse
