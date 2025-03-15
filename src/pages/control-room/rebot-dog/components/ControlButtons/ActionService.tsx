import FloatIconButton from '@/components/ui/button/FloatIconButton'
import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'
import { AppstoreOutlined } from '@ant-design/icons'
import { Dropdown, Tooltip } from 'antd'
import SitDown from './assets/sitDown.svg'
import LayDown from './assets/layDown.svg'
import StandUp from './assets/standUp.svg'

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
            label: (
              <Tooltip title="坐下" placement="left">
                <img className="size-5" src={SitDown} />
              </Tooltip>
            ),
          },
          {
            key: 'actionGetDown',
            label: (
              <Tooltip title="趴下" placement="left">
                <img className="size-5" src={LayDown} />
              </Tooltip>
            ),
          },
          {
            key: 'actionStandUp',
            label: (
              <Tooltip title="站立" placement="left">
                <img className="size-5" src={StandUp} />
              </Tooltip>
            ),
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
