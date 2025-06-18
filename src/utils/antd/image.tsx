import {
  DownloadOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
  UndoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons'
import { downloadAndRename } from '../download'
import { Space } from 'antd'
import { GetProp, Image } from 'antd'

type ToolbarRenderProps = Exclude<
  GetProp<typeof Image, 'preview'>,
  boolean
>['toolbarRender']

/** 普通照片工具栏 */
export const makeToolbarRender = (min = 1, max = 50): ToolbarRenderProps => {
  return (
    _,
    {
      transform: { scale },
      actions: {
        onFlipY,
        onFlipX,
        onRotateLeft,
        onRotateRight,
        onZoomOut,
        onZoomIn,
        onReset,
      },
      image,
    },
  ) => {
    return (
      <Space size={12} className="toolbar-wrapper">
        <DownloadOutlined
          onClick={() => {
            downloadAndRename(
              image.url,
              image.url.slice(image.url.lastIndexOf('/') + 1),
            )
          }}
        />
        <SwapOutlined rotate={90} onClick={onFlipY} />
        <SwapOutlined onClick={onFlipX} />
        <RotateLeftOutlined onClick={onRotateLeft} />
        <RotateRightOutlined onClick={onRotateRight} />
        <ZoomOutOutlined disabled={scale === min} onClick={onZoomOut} />
        <ZoomInOutlined disabled={scale === max} onClick={onZoomIn} />
        <UndoOutlined onClick={onReset} />
      </Space>
    )
  }
}

/** 全景照片工具栏 */
export const makePanormaToolbarRender = () => {
  return (_, { image }) => {
    return (
      <Space size={12} className="toolbar-wrapper">
        <DownloadOutlined
          onClick={() => {
            downloadAndRename(
              image.url,
              image.url.slice(image.url.lastIndexOf('/') + 1),
            )
          }}
        />
      </Space>
    )
  }
}
