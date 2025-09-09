import { memo, type FC } from 'react'
import styles from './index.module.less'
import { imageFormats } from '../../../AirlineConfig/components/TakePhotoConfig/constant'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import { ActionStartRecordType } from '@/store/wayline/uav-airline/types'
import IconStartRecord from '@/assets/icons/jsx/IconStartRecord'

type ConfigType = ActionStartRecordType['config']

type PropsType = {
  config: ConfigType
  onChange: (value: ConfigType) => unknown
}

const StartRecord: FC<PropsType> = ({ config, onChange }) => {
  const { t } = useTranslation()

  const airlineImageFormat = useAirlineConfigStore(
    (s) => s.airlineConfig.imageFormat,
  )
  return (
    <div>
      <div className={styles.subTitle}>
        <IconStartRecord />
        <span className={styles.text}>
          {t('wayline.waylinePoint.actions.START_RECORD.title')}
        </span>
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
              {t(`wayline.imageFormat.${item.value}.title`)}
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
            {t('wayline.useGlobalPayloadLensIndex.title')}
          </div>
        </div>
      </div>
    </div>
  )
}

const memorizedCpn = memo(StartRecord)
memorizedCpn.displayName = 'GetPicture'

export default memorizedCpn
