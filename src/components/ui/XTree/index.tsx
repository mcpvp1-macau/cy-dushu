import { GetProps, Tree } from 'antd'
import styles from './xtree.module.less'

type PropsType = GetProps<typeof Tree>

const XTree: FC<PropsType> = memo((props) => {
  return (
    <div className={styles.xTree}>
      <Tree {...props} />
    </div>
  )
})

XTree.displayName = 'XTree'

export default XTree
