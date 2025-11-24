import LiqunTippy from '@/components/ui/LiqunTippy'
import styles from './SampleExample.module.less'

type PropsType = unknown

const colorMap = [
  '#360505',
  '#b91c1c',
  '#F29D49',
  '#eab308',
  '#80D177',
  '#15B371',
]

const infoMap = ['无', '极差', '较差', '一般', '较好', '极好']

const title = ['0', '0~1', '1~2', '2~3', '3~4', '4~5']

const SignalExample: FC<PropsType> = memo(() => {
  return (
    <div className={styles.panel}>
      <p className={styles.title}>5G信号示例</p>
      <p className={styles.small}>图例</p>
      <div className={styles.bar}>
        {colorMap.map((e, i) => (
          <LiqunTippy
            content={`信号${infoMap[i]}: ${title[i]}`}
            placement="top"
          >
            <div className={styles.barItem} style={{ background: e }}></div>
          </LiqunTippy>
        ))}
      </div>
      <div className={styles.bar2}>
        {infoMap.map((e, i) => (
          <LiqunTippy
            content={`信号${infoMap[i]}: ${title[i]}`}
            placement="top"
          >
            <p className={clsx(styles.small, styles.barItem)}>{e}</p>
          </LiqunTippy>
        ))}
      </div>
    </div>
  )
})

SignalExample.displayName = 'SignalExample'

export default SignalExample
