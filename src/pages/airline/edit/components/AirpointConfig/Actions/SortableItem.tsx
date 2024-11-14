import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import styles from './SortableItem.module.less'
import WRJXT from '../icons/WRJXT'
import FXQPHJ from '../icons/FXQPHJ'
import YTPHJ from '../icons/YTPHJ'
import YTFYJ from '../icons/YTFYJ'
import PZ from '../icons/PZ'
import XJBJ from '../icons/XJBJ'
import { Dropdown, MenuProps } from 'antd'
import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'
import IconButton from '@/components/ui/button/IconButton'
import IconCameraSwitch from '@/assets/icons/jsx/IconCameraSwitch'
import IconAIEnable from '@/assets/icons/jsx/IconAIEnable'
import IconAIDisable from '@/assets/icons/jsx/IconAIDisable'
import { QuestionCircleOutlined } from '@ant-design/icons'

interface Props {
  id: string
  action: any
  activeOperator: string
  setActiveOperator: React.Dispatch<React.SetStateAction<string>>
}

const getIcon = (action: any) => {
  if (!action) return
  if (action.type === 'HOVER') {
    return <WRJXT />
  }
  if (action?.type === 'ROTATE_YAW') {
    return <FXQPHJ />
  }
  if (action?.type === 'CAMERA_POSITION' && action.config.x !== undefined) {
    return <YTPHJ />
  }
  if (action?.type === 'CAMERA_POSITION' && action.config.y !== undefined) {
    return <YTFYJ />
  }
  if (action?.type === 'GET_PICTURE') {
    return <PZ />
  }
  if (action?.type === 'LEN_CHANGE') {
    return <IconCameraSwitch />
  }
  if (action?.type === 'ZOOM') {
    return <XJBJ />
  }
  if (action?.type === 'OPEN_AI') {
    return <IconAIEnable />
  }
  if (action?.type === 'CLOSE_AI') {
    return <IconAIDisable />
  }
  if (action?.type === 'UNKNOWN') {
    return <QuestionCircleOutlined />
  }
}

const actionNameMap = new Map([
  ['HOVER', '悬停'],
  ['ROTATE_YAW', '飞行器偏航角'],
  ['CAMERA_POSITION', '云台偏航&俯仰角'],
  ['ZOOM', '相机变焦'],
  ['GET_PICTURE', '拍照'],
  ['LEN_CHANGE', '镜头切换'],
  ['OPEN_AI', '开启算法'],
  ['CLOSE_AI', '关闭算法'],
  ['UNKNOWN', '暂不支持编辑该航线'],
])

const SortableItem: React.FC<Props> = ({
  id,
  action,
  activeOperator,
  setActiveOperator,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  let transition2 = transition
  if (transition2 === 'transform 0ms linear') {
    transition2 = undefined
  }
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition2,
    cursor: 'move',
    ...(isDragging ? { position: 'relative', zIndex: 99999 } : {}),
  }

  const currentIndex = useAirlineConfigStore((s) => s.currentIndex)
  const setAirpointsConfig = useAirlineConfigStore(
    (s) => s.updateAirpointsConfig,
  )

  const del = () => {
    if (activeOperator === action.xid) {
      setActiveOperator('')
    }
    const airpointsConfig = useAirlineConfigStore.getState().airpointsConfig
    setAirpointsConfig(
      airpointsConfig.map((item, i) => {
        if (currentIndex === i) {
          return {
            ...item,
            actions: item.actions.filter((v) => v.xid !== action.xid),
          }
        }
        return item
      }),
    )
  }

  const items: MenuProps['items'] = [
    {
      key: action.xid,
      label: (
        <div
          onClick={(e) => {
            e.stopPropagation()
            del()
          }}
          className="rrr"
        >
          删除
        </div>
      ),
    },
  ]

  return (
    <Dropdown menu={{ items }} trigger={['contextMenu']}>
      <div
        id={id}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
      >
        <div
          className={clsx([
            styles.operator,
            { [styles.active]: action.xid === activeOperator },
          ])}
        >
          <IconButton
            toolTipProps={{
              title: actionNameMap.get(action?.type) ?? '',
              placement: 'top',
              mouseEnterDelay: 0.3,
            }}
          >
            {getIcon(action)}
          </IconButton>
        </div>
      </div>
    </Dropdown>
  )
}

export default SortableItem
