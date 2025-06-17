import PositionTooltip from '@/components/map/PostionTooltip'
import useMediaOnMapStore from '@/store/map/useMediaOnMap.store'
import { makeToolbarRender } from '@/utils/antd/image'
import { Image } from 'antd'
import { Fragment } from 'react/jsx-runtime'

type PropsType = unknown

const PicutreOnMap: FC<PropsType> = memo(() => {
  const mediaGroup = useMediaOnMapStore((s) => s.mediaGroup)

  return (
    <>
      <Image.PreviewGroup>
        {Object.entries(mediaGroup).map(([id, pictures]) => {
          return (
            <Fragment key={id}>
              {pictures.map((e) => (
                <PositionTooltip position={[e.longitude!, e.latitude!]}>
                  <div className="w-[90px] aspect-video flex items-center justify-center">
                    <Image
                      loading="lazy"
                      src={`/storage/${e.url}`}
                      width="100%"
                      height="100%"
                      className="size-full object-cover rounded-sm"
                      preview={{
                        destroyOnClose: true,
                        toolbarRender: makeToolbarRender(1, 50),
                      }}
                      alt={e.url.slice(e.url.lastIndexOf('/') + 1)}
                    />
                  </div>
                </PositionTooltip>
              ))}
            </Fragment>
          )
        })}
      </Image.PreviewGroup>
    </>
  )
})

PicutreOnMap.displayName = 'PicutreOnMap'

export default PicutreOnMap
