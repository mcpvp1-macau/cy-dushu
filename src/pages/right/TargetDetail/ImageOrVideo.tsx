import AppEmpty from '@/components/AppEmpty'
import ImageContainBox2 from '@/components/ImageContainBox2'
import Video from '@/components/Video'
import { handleStorageURL } from '@/pages/events/components/EventDetail'
import { Flex } from 'antd'
import { isNil } from 'lodash'
import { TargetDetailType } from '.'

enum Type {
  Video = 'video',
  Image = 'image',
}

type PropsType = {
  data: TargetDetailType
}

const ImageOrVideo: React.FC<PropsType> = ({ data }) => {
  const [type, setType] = useState<Type>(Type.Image)

  const render = () => {
    if (
      isNil(data.leftTopX) ||
      isNil(data.leftTopY) ||
      isNil(data.bboxWidth) ||
      isNil(data.bboxHeight) ||
      isNil(data.sourceFrameWidth) ||
      isNil(data.sourceFrameHeight)
    ) {
      return null
    }
    return (
      <div
        className="absolute border border-solid border-red-400"
        style={{
          left: `${(data.leftTopX / data.sourceFrameWidth) * 100}%`,
          top: `${(data.leftTopY / data.sourceFrameHeight) * 100}%`,
          right: `${
            100 -
            ((data.leftTopX + data.bboxWidth) / data.sourceFrameWidth) * 100
          }%`,
          bottom: `${
            100 -
            ((data.leftTopY + data.bboxHeight) / data.sourceFrameHeight) * 100
          }%`,
        }}
      />
    )
  }
  return (
    <div className="p-[12px] relative min-h-[184px]">
      <Flex
        justify="space-between"
        align="center"
        className="top-0 left-0 right-0 z-50 text-[14px] px-[1px] h-[30px] leading-[30px] text-fore"
      >
        <Flex gap={8}>
          <div
            style={{
              color: type === Type.Image ? '#4C90F0' : undefined,
              cursor: 'pointer',
            }}
            onClick={() => setType(Type.Image)}
          >
            图片
          </div>
          <div>|</div>
          <div
            style={{
              color: type === Type.Video ? '#4C90F0' : undefined,
              cursor: 'pointer',
            }}
            onClick={() => setType(Type.Video)}
          >
            视频
          </div>
        </Flex>
        {/* {detail?.imageUrl && (
          <TooltipIcon
            title="放大"
            onClick={() => {
              if (type === Type.Image) {
                showPreview()
              } else if (type === Type.Video) {
                setVisible(true)
                setType(Type.Video)
              }
            }}
          >
            <FullScreen />
          </TooltipIcon>
        )} */}
      </Flex>
      {type === Type.Image && (
        <div className="w-full aspect-video relative">
          {data?.imageUrl ? (
            <ImageContainBox2 src={handleStorageURL(data?.imageUrl ?? '')}>
              {render()}
            </ImageContainBox2>
          ) : (
            <AppEmpty />
          )}
        </div>
      )}
      {type === Type.Video && (
        <div>
          <Video src={handleStorageURL(data?.recordPath || '')} />
        </div>
      )}
    </div>
  )
}

export default ImageOrVideo
