import { Flex, Typography, Image } from 'antd'
import EmptyImage from '../../../public/images/EmptyImage.png'

type PropsType = {
  data: any
}

const WanglouTarget: React.FC<PropsType> = ({ data }) => {
  const {
    distance = 0,
    speed = 0,
    timestampFormat,
    targetLatitude = 0,
    targetLongitude = 0,
    source,
    targetId,
    objectLabel,
    sourceWidth,
    sourceHeight,
    bboxHeight,
    bboxLeft,
    bboxTop,
    bboxWidth,
    childDeviceId: _childDeviceId,
    parentId: _parentId,
    objectLabelName,
    imageSource: _imageSource,
    deviceInfo,
  } = data

  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const sourceList = useMemo(() => {
    let info: any[] = deviceInfo as any
    if (typeof deviceInfo === 'string') {
      info = JSON.parse(deviceInfo)
    }
    if (info) {
      return info.map((item) => item.deviceName).join(',')
    }

    return null
  }, [deviceInfo])

  return (
    <Flex gap={12} className="p-[10px]">
      <Flex align="center">
        <Image
          width={100}
          src={'/storage' + data.imageUrl}
          fallback={EmptyImage}
          preview={{
            visible: open,
            imageRender: () => <></>,
            toolbarRender: () => <></>,
            forceRender: false,
            closeIcon: <></>,
            mask: true,
            onVisibleChange: (visible) => {
              data.imageUrl && setOpen(visible)
            },
          }}
        ></Image>
        {data.imageUrl && (
          <div
            style={{
              left: (bboxLeft * 100) / sourceWidth,
              top:
                (bboxTop * 100) / sourceWidth +
                (100 - (sourceHeight * 100) / sourceWidth) / 2,
              width: (bboxWidth * 100) / sourceWidth,
              height: (bboxHeight * 100) / sourceWidth,
            }}
          ></div>
        )}
      </Flex>
      <Flex flex={1} vertical align="start">
        <Typography.Text>
          ID: {targetId}
          {objectLabelName || objectLabel
            ? `（${objectLabelName || objectLabel}）`
            : undefined}
        </Typography.Text>
        <Flex wrap>
          <Typography.Text className="min-w-[160px] bottom-[8px] mr-[10px]">
            {t('common.distance')}：{distance !== null ? `${distance}m` : '-'}
          </Typography.Text>
          <Typography.Text className="min-w-[160px] bottom-[8px] mr-[10px]">
            {t('common.speed')}：{speed !== null ? `${speed.toFixed(1)}m/s` : '-'}
          </Typography.Text>
          <Typography.Text className="min-w-[160px] bottom-[8px] mr-[10px]">
            {t('action.item.time')}：{timestampFormat || '-'}
          </Typography.Text>
          <Typography.Text className="min-w-[160px] bottom-[8px] mr-[10px]">
            {t('common.position')}：
            {targetLongitude !== null && targetLatitude !== null
              ? `${targetLongitude}, ${targetLatitude}`
              : '-'}
          </Typography.Text>
          <Typography.Text className="min-w-[160px] bottom-[8px] mr-[10px]">
            {t('common.source')}：{sourceList || source || '-'}
          </Typography.Text>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default WanglouTarget
