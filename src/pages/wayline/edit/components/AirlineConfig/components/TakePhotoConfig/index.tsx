import { memo, type FC } from 'react'
import { Switch } from 'antd'
import { imageFormats } from './constant'
import styles from './index.module.less'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import XCard from '@/components/ui/XCard'

type PropsType = unknown

/** 拍照设置 */
const TakePhotoConfig: FC<PropsType> = () => {
  const imageFormat = useAirlineConfigStore((s) => s.airlineConfig.imageFormat)
  const setAirlineConfig = useAirlineConfigStore((s) => s.updateAirlineConfig)

  /** 拍照设置 */
  const handleImageFormatCheckClick = (x: string) => {
    const a = imageFormat ?? []
    if (a.indexOf(x) > -1) {
      setAirlineConfig({
        ...useAirlineConfigStore.getState().airlineConfig,
        imageFormat: useAirlineConfigStore
          .getState()
          .airlineConfig.imageFormat.filter((y: string) => y !== x),
      })
    } else {
      setAirlineConfig({
        ...useAirlineConfigStore.getState().airlineConfig,
        imageFormat: [...a, x],
      })
    }
  }

  return (
    <XCard
      title="拍照设置"
      topRight={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Switch size="small"></Switch>
          <span style={{ marginLeft: '6px' }}>智能低光</span>
        </div>
      }
    >
      <div className={styles.takePhoto}>
        {imageFormats.map((x) => (
          <div
            key={x.value}
            className={clsx(styles.checkedBtn, {
              [styles.checked]: imageFormat?.includes(x.value),
            })}
            onClick={handleImageFormatCheckClick.bind(null, x.value)}
          >
            {x.label}
          </div>
        ))}
      </div>
    </XCard>
  )
}

/** 拍照设置 */
const memorizedCpn = memo(TakePhotoConfig)
memorizedCpn.displayName = 'TakePhotoConfig'

export default memorizedCpn
