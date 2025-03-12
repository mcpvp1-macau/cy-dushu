import FloatIconButton from '@/components/ui/button/FloatIconButton'
import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'
import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'
import { AppstoreOutlined } from '@ant-design/icons'
import { Dropdown } from 'antd'

type PropsType = unknown

/** 动作服务 */
const ActionService: FC<PropsType> = memo(() => {
  const postService = usePostDeviceService()

  const handleClick = useMemoizedFn(({ key }) => postService(key))

  return (
    <Dropdown
      placement="top"
      menu={{
        onClick: handleClick,
        items: [
          {
            key: 'actionSit',
            label: '坐下',
          },
          {
            key: 'actionGetDown',
            label: '趴下',
          },
          {
            key: 'actionStandUp',
            label: '站立',
          },
        ],
      }}
    >
      <FloatIconButton className="scale-90">
        <AppstoreOutlined />
      </FloatIconButton>
    </Dropdown>
  )
})

ActionService.displayName = 'ActionService'

export default ActionService
