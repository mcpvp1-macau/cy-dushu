import { Flex } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import styles from './index.module.less'
import React from 'react'
import { infoFieldFormatter } from '@/utils/other/utils'
import useBoardObjStore from '@/store/map/useBoardObj.store'
import IconClose from '@/assets/icons/jsx/IconClose'
import IconButton from '@/components/ui/button/IconButton'

interface Props {
  data: {
    targetId: string
    acquireTimestampFormat: string
    objectLabel: string
    speed: number
    distance: number
    altitude: number
    longitude: number
    latitude: number
    source: string
    sourceType: string
    deviceId: string
    parentId: string
    imageUrl: string | null
    deviceInfo: { deviceName: string; deviceId: string }[]
  }
  onClose?: () => void
}

const BoardDetail: React.FC<Props> = ({ data, onClose }) => {
  const {
    targetId,
    acquireTimestampFormat,
    objectLabel,
    speed,
    distance,
    altitude,
    longitude,
    latitude,
    source,
    sourceType,
    deviceId,
    parentId,
    imageUrl,
    deviceInfo,
  } = data

  const { t } = useTranslation()
  const boardOpenMap = useBoardObjStore((s) => s.boardOpenMap)
  const setBoardOpenMap = useBoardObjStore((s) => s.setBoardOpenMap)

  const renderNumber = (value: number, unit: string) => {
    return value ? `${Number(value)?.toFixed(2)}${unit}` : '-'
  }

  return (
    <div className={styles.panel}>
      <Flex>
        <div style={{ minWidth: 340 }}>
          <Flex
            justify="space-between"
            align="center"
            className={styles.header}
          >
            <Flex gap={8}>
              {/* <IDIcon /> */}
              <div>
                {targetId}（
                {infoFieldFormatter({
                  value: objectLabel,
                  emptyString: '车辆',
                })}
                ）
              </div>
            </Flex>
            <Flex
              style={{ minWidth: 40 }}
              gap={8}
              justify="space-between"
              align="center"
            >
              <div
                className={clsx(styles.close)}
                onClick={() => {
                  if (onClose) {
                    onClose()
                  } else {
                    setBoardOpenMap({
                      ...boardOpenMap,
                      [targetId]: false,
                    })
                  }
                }}
              >
                <IconButton>
                  {/* <CloseIcon style={{ fontSize: 12 }} /> */}
                  <IconClose />
                </IconButton>
              </div>
            </Flex>
          </Flex>
          <Flex justify="space-between" align="center">
            <div style={{ width: 340 }} className={styles.targetInfo}>
              <Flex className="flex-warp gap-x-12" wrap>
                {!!speed && (
                  <Flex>
                    <div className={styles.label}>{t('common.speed')}</div>
                    <div className={styles.text}>
                      {renderNumber(speed, 'm/s')}
                    </div>
                  </Flex>
                )}
                {!!distance && (
                  <Flex>
                    <div className={styles.label}>{t('common.distance')}</div>
                    <div className={styles.text}>
                      {renderNumber(distance, 'm')}
                    </div>
                  </Flex>
                )}
                {!!altitude && (
                  <Flex>
                    <div className={styles.label}>{t('common.altitude')}</div>
                    <div className={styles.text}>
                      {renderNumber(altitude, 'm')}
                    </div>
                  </Flex>
                )}
                <Flex>
                  <div className={styles.label}>{t('action.item.time')}</div>
                  <div className={styles.text}>
                    {dayjs(acquireTimestampFormat).format('MM-DD HH:mm:ss')}
                  </div>
                </Flex>
                <Flex>
                  <div className={styles.label}>{t('common.position')}</div>
                  <div className={styles.text}>
                    {Number(longitude)?.toFixed(6)},{' '}
                    {Number(latitude)?.toFixed(6)}
                  </div>
                </Flex>
              </Flex>
            </div>
            {imageUrl ? (
              <div
                style={{
                  minWidth: 60,
                  maxWidth: 80,
                  marginTop: 0,
                  marginLeft: 10,
                }}
              >
                <img
                  src={'/storage' + imageUrl}
                  style={{ minHeight: 30, maxHeight: 40 }}
                />
              </div>
            ) : (
              <></>
            )}
          </Flex>
        </div>
      </Flex>
    </div>
  )
}

export default React.memo(BoardDetail)
