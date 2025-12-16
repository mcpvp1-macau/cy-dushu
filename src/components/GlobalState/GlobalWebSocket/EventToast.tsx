import { RightModeEnum, RightOuterEnum } from '@/enum/right-mode'
import { actionTanqiEmitter } from '@/pages/right/ActionTanqi/ActionTanqi'
import useRightMode from '@/store/layout/useRightMode.store'
import { CaretDownOutlined, WarningOutlined } from '@ant-design/icons'
import { Button, Dropdown } from 'antd'
import DeviceSourceLink from './DeviceSourceLink'

type PropsType = {
  data: API_EVENTS.domain.Event
}

/** 事件通知 */
const EventToast: FC<PropsType> = memo(({ data }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { actionId } = useParams()
  const updateRightMode = useRightMode((s) => s.updateRightMode)
  const updateDetailId = useRightMode((s) => s.updateDetailId)

  const rightOuterMode = useRightMode((s) => s.rightOuterMode)

  return (
    <div className="flex rounded bg-ground-1/90 ring-1 ring-ground-5 w-[350px] backdrop-blur-sm items-center p-3 gap-3 z-10">
      <div className="flex flex-1 items-center">
        <div className="w-full max-w-[240px] overflow-hidden">
          <div className="flex gap-1 text-sm font-medium text-hightlight overflow-hidden">
            <WarningOutlined className="text-yellow-500" />
            <p className="truncate">{data.eventName}</p>
          </div>
          <DeviceSourceLink
            label={data.deviceName ?? '未知设备'}
            deviceId={data.deviceId}
            title={data.deviceName}
          />
        </div>
      </div>
      <div>
        <Dropdown
          menu={{
            items: [
              {
                key: 'view-detail',
                label: '查看',
                onClick: () => {
                  updateRightMode(RightModeEnum.EVENT_DETAIL)
                  updateDetailId(data.eventId)
                  navigate('/')
                },
              },
              ...(actionId &&
              data.deviceName &&
              rightOuterMode === RightOuterEnum.TANQI
                ? [
                    {
                      key: 'tanqi',
                      label: '檀棋处理',
                      onClick: () => {
                        actionTanqiEmitter.emit('resolveEvent', data)
                      },
                    },
                  ]
                : []),
            ],
          }}
          trigger={['click']}
        >
          <Button size="small">
            {t('common.options')}
            <CaretDownOutlined className="text-xs" />
          </Button>
        </Dropdown>
      </div>
    </div>
  )
})

EventToast.displayName = 'EventToast'

export default EventToast
