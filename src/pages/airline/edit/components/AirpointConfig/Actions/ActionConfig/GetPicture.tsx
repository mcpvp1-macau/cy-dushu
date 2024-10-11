import { memo, type FC } from 'react'
import styles from './index.module.less'
import PZ from '../../icons/PZ'
import { imageFormats } from '../../../AirlineConfig/components/TakePhotoConfig/constant'
import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'
import { ActionGetPictureType } from '@/store/uav/uav-airline/types'

type ConfigType = ActionGetPictureType['config']

type PropsType = {
  config: ConfigType
  onChange: (value: ConfigType) => unknown
}

const GetPicture: FC<PropsType> = ({ config, onChange }) => {
  const airlineImageFormat = useAirlineConfigStore(
    (s) => s.airlineConfig.imageFormat,
  )
  return (
    <div>
      <div className={styles.subTitle}>
        <PZ />
        <span className={styles.text}>拍照</span>
      </div>
      <div className={styles.takePhoto}>
        <div className={styles.left}>
          {imageFormats.map((item: any) => (
            <div
              key={item.value}
              className={clsx(styles.checkedBtn, {
                [styles.checked]: (config?.useGlobalPayloadLensIndex
                  ? airlineImageFormat
                  : config?.payloadLensIndex
                )?.find((v: string) => v === item.value),
                [styles.disabled]: config?.useGlobalPayloadLensIndex,
              })}
              onClick={() => {
                if (!config?.useGlobalPayloadLensIndex) {
                  let list = [...(config?.payloadLensIndex ?? [])]
                  if (list.find((v) => item.value === v)) {
                    list = list.filter((v) => v !== item.value)
                  } else {
                    list.push(item.value)
                  }
                  onChange({
                    ...(config || {}),
                    payloadLensIndex: list,
                    useGlobalPayloadLensIndex: 0,
                  })
                }
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
        <div className={styles.right}>
          <div
            className={clsx(styles.checkedBtn, {
              [styles.checked]: config?.useGlobalPayloadLensIndex,
            })}
            onClick={() =>
              onChange({
                ...(config || {}),
                useGlobalPayloadLensIndex:
                  1 - config?.useGlobalPayloadLensIndex,
              })
            }
          >
            跟随航线
          </div>
        </div>
      </div>
    </div>
  )
}

const memorizedCpn = memo(GetPicture)
memorizedCpn.displayName = 'GetPicture'

export default memorizedCpn
