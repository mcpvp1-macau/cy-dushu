import IconTakeoff from '@/assets/icons/jsx/uav/IconTakeoff'
import VerticalIconButton from '@/components/ui/button/VerticalButton'
import FormModal from '@/components/XForm/Modal'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { memo, type FC } from 'react'

type PropsType = {
  postServiceFn: (identifier: string, data?: any) => Promise<void>
}

/** 一键起飞 */
const Takeoff: FC<PropsType> = memo(({ postServiceFn }) => {
  const isLimitedFly = useUavControlRoomStore((s) => s.isLimitedFly)
  const hasControlPower = useUavControlRoomStore((s) => s.hasControlPower)
  const hasService = useDeviceDetailStore((s) => s.serviceHave['takeoff'])
  const canTakeoff = !isLimitedFly && hasControlPower && hasService

  const handleClick = async (data) => {
    postServiceFn('takeoff', data)
  }

  const [open, { setTrue, setFalse }] = useBoolean(false)

  return (
    <>
      <VerticalIconButton
        className="flex-1 h-10 p-0 text-xs"
        disabled={!canTakeoff}
        icon={<IconTakeoff className="text-base" />}
        onClick={setTrue}
      >
        一键起飞
      </VerticalIconButton>
      {open && (
        <FormModal
          title="一键起飞"
          initialValues={{ height: 100 }}
          items={[
            {
              label: '起飞高度',
              name: 'height',
              type: 'input-number',
              rules: [{ required: true, message: '请输入起飞高度' }],
              otherProps: {
                addonAfter: 'm',
              },
            },
          ]}
          onClose={setFalse}
          onConfirm={handleClick}
        />
      )}
    </>
  )
})

Takeoff.displayName = 'Takeoff'

export default Takeoff
